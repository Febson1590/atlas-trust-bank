import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOTP, createSession } from "@/lib/auth";
import { otpSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    // Parse request body
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

    // Verify OTP
    const otpResult = await verifyOTP(email.toLowerCase(), "verification", code);
    if (!otpResult.valid) {
      return NextResponse.json(
        { success: false, error: otpResult.error || "Invalid verification code" },
        { status: 400 }
      );
    }

    // Update user email verification status
    const user = await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { emailVerified: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        kycStatus: true,
        emailVerified: true,
      },
    });

    // Create session
    await createSession(user.id, user.email, user.role);

    return NextResponse.json(
      {
        success: true,
        data: {
          message: "Email verified successfully",
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            status: user.status,
            kycStatus: user.kycStatus,
            emailVerified: user.emailVerified,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
