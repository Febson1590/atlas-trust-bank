import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { redis, RK, SessionData } from "@/lib/redis";
import {
  getSession,
  getCurrentSessionToken,
  destroyOtherUserSessions,
  verifyPassword,
  storeOTP,
  verifyOTP,
  checkRateLimit,
  getClientIP,
} from "@/lib/auth";
import { sendOTPEmail, sendSecurityAlertEmail } from "@/lib/email";

// Change the signed-in user's email (which is also their login), in two steps:
//   POST — user submits new email + current password. We send a 6-digit
//          code to the NEW address and park the pending change in Redis.
//   PUT  — user submits the code. On success the email is swapped and
//          becomes the login immediately.
// Confirming via the new inbox matters because sign-in codes go to the
// account email — a typo here would otherwise lock the user out.

const PENDING_TTL = 60 * 5; // matches OTP lifetime
const OTP_PURPOSE = "email-change";
const pendingKey = (userId: string) => `email_change:${userId}`;

const requestSchema = z.object({
  newEmail: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Current password is required"),
});

const confirmSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const newEmail = parsed.data.newEmail.toLowerCase();

    const rateLimit = await checkRateLimit("otp", `email-change:${session.userId}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many attempts. Please try again in ${rateLimit.retryAfter} seconds.`,
        },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { email: true, password: true },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (!(await verifyPassword(parsed.data.password, user.password))) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    if (newEmail === user.email) {
      return NextResponse.json(
        { success: false, error: "That is already your email address" },
        { status: 400 }
      );
    }

    const taken = await prisma.user.findUnique({
      where: { email: newEmail },
      select: { id: true },
    });
    if (taken) {
      return NextResponse.json(
        { success: false, error: "That email address is already in use" },
        { status: 409 }
      );
    }

    const otp = await storeOTP(newEmail, OTP_PURPOSE);
    await redis.set(pendingKey(session.userId), newEmail, { ex: PENDING_TTL });

    const sent = await sendOTPEmail(newEmail, otp, OTP_PURPOSE);
    if (!sent) {
      return NextResponse.json(
        {
          success: false,
          error: "We couldn't send a code to that address. Check it and try again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, data: { email: newEmail } });
  } catch (error) {
    console.error("Email change request error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const parsed = confirmSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const newEmail = await redis.get<string>(pendingKey(session.userId));
    if (!newEmail) {
      return NextResponse.json(
        { success: false, error: "Code expired. Please start again." },
        { status: 400 }
      );
    }

    const otpResult = await verifyOTP(newEmail, OTP_PURPOSE, parsed.data.code);
    if (!otpResult.valid) {
      return NextResponse.json(
        { success: false, error: otpResult.error || "Invalid code" },
        { status: 400 }
      );
    }

    // Re-check uniqueness: someone could have registered the address
    // during the 5-minute window.
    const taken = await prisma.user.findUnique({
      where: { email: newEmail },
      select: { id: true },
    });
    if (taken) {
      await redis.del(pendingKey(session.userId));
      return NextResponse.json(
        { success: false, error: "That email address is already in use" },
        { status: 409 }
      );
    }

    const before = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { email: true, firstName: true },
    });
    if (!before) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    await prisma.user.update({
      where: { id: session.userId },
      data: { email: newEmail, emailVerified: true },
    });

    await redis.del(pendingKey(session.userId));

    // Same policy as a password change: this device stays signed in (with
    // its cached email updated), every other device is signed out.
    const token = await getCurrentSessionToken();
    if (token) {
      const raw = await redis.get<string>(RK.session(token));
      if (raw) {
        const data: SessionData =
          typeof raw === "string" ? JSON.parse(raw) : (raw as SessionData);
        await redis.set(
          RK.session(token),
          JSON.stringify({ ...data, email: newEmail }),
          { keepTtl: true }
        );
      }
      await destroyOtherUserSessions(session.userId, token);
    }

    // Heads-up to the old inbox in case this wasn't them. Best-effort.
    await sendSecurityAlertEmail(before.email, before.firstName, {
      action: `email change to ${newEmail}`,
      device: request.headers.get("user-agent")?.slice(0, 80) || "Unknown",
      ip: getClientIP(request),
      time: new Date().toUTCString(),
    });

    return NextResponse.json({ success: true, data: { email: newEmail } });
  } catch (error) {
    console.error("Email change confirm error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
