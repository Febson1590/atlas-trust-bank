import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { consumeResetToken, hashPassword } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const result = resetPasswordSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const { token, password } = result.data;

    // Consume reset token (returns email if valid, null if not)
    const email = await consumeResetToken(token);
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired reset token. Please request a new password reset.",
        },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          message:
            "Password has been reset successfully. You can now log in with your new password.",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
