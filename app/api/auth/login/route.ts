import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  createSession,
  storeOTP,
  checkRateLimit,
  getClientIP,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { sendOTPEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Rate limiting
    const ip = getClientIP(request);
    const rateLimit = await checkRateLimit("login", ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Please try again in ${rateLimit.retryAfter} seconds.`,
        },
        { status: 429 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check user status
    if (user.status === "SUSPENDED") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Your account has been suspended. Please contact support for assistance.",
        },
        { status: 403 }
      );
    }

    if (user.status === "FROZEN") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Your account has been frozen. Please contact support for assistance.",
        },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // If email is not verified, send verification OTP
    if (!user.emailVerified) {
      const otp = await storeOTP(user.email, "verification");
      await sendOTPEmail(user.email, otp, "verification");

      return NextResponse.json(
        {
          success: true,
          data: {
            requiresVerification: true,
            email: user.email,
            message: "Please verify your email. A verification code has been sent.",
          },
        },
        { status: 200 }
      );
    }

    // Send login OTP for 2FA
    const otp = await storeOTP(user.email, "login");
    await sendOTPEmail(user.email, otp, "login");

    return NextResponse.json(
      {
        success: true,
        data: {
          requiresOTP: true,
          email: user.email,
          message: "A sign-in verification code has been sent to your email.",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
