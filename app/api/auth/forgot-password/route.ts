import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createResetToken, checkRateLimit, getClientIP } from "@/lib/auth";
import { forgotPasswordSchema } from "@/lib/validations";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Rate limiting
    const ip = getClientIP(request);
    const rateLimit = await checkRateLimit("passwordReset", ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many password reset attempts. Please try again in ${rateLimit.retryAfter} seconds.`,
        },
        { status: 429 }
      );
    }

    // Always return success to prevent email enumeration
    const successResponse = NextResponse.json(
      {
        success: true,
        data: {
          message:
            "If an account with that email exists, a password reset link has been sent.",
        },
      },
      { status: 200 }
    );

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // If user not found, still return success for security
    if (!user) {
      return successResponse;
    }

    // Create reset token
    const token = await createResetToken(user.email);

    // Build reset URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    // Send password reset email
    await sendPasswordResetEmail(user.email, resetUrl);

    return successResponse;
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
