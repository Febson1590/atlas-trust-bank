import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOTP, createSession, checkRateLimit } from "@/lib/auth";
import { otpSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const result = otpSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const { email, code } = result.data;

    // Rate limit by email, not IP. Keying on IP lets attackers cycle
    // across email addresses on the same IP, and keying on IP alone also
    // blocks legitimate users behind a shared NAT/office network.
    const rateLimit = await checkRateLimit("otp", email.toLowerCase());
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many attempts. Please try again in ${rateLimit.retryAfter} seconds.`,
        },
        { status: 429 }
      );
    }

    // Verify the login OTP
    const otpResult = await verifyOTP(email.toLowerCase(), "login", code);
    if (!otpResult.valid) {
      return NextResponse.json(
        { success: false, error: otpResult.error || "Invalid verification code" },
        { status: 400 }
      );
    }

    // Find user and create session
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Create session
    await createSession(user.id, user.email, user.role);

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          message: "Login successful",
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login OTP verification error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
