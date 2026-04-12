import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, storeOTP, checkRateLimit, getClientIP } from "@/lib/auth";
import { sendOTPEmail } from "@/lib/email";

// ─── POST — Send OTP for transfer verification ──────────────
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Rate limiting
    const ip = getClientIP(request);
    const rateLimit = await checkRateLimit("otp", ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many OTP requests. Please try again in ${rateLimit.retryAfter} seconds.`,
        },
        { status: 429 }
      );
    }

    // Get user email
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { email: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Generate and store OTP
    const code = await storeOTP(user.email, "transfer");

    // Send OTP email
    await sendOTPEmail(user.email, code, "transfer");

    return NextResponse.json({
      success: true,
      data: { message: "Verification code sent to your email" },
    });
  } catch (error) {
    console.error("Send transfer OTP error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send verification code" },
      { status: 500 }
    );
  }
}
