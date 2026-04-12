import { NextResponse } from "next/server";
import { getSession, verifyOTP } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── POST — Verify transfer OTP ─────────────────────────────
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== "string" || code.length !== 6) {
      return NextResponse.json(
        { success: false, error: "A valid 6-digit OTP code is required" },
        { status: 400 }
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

    // Verify the OTP
    const result = await verifyOTP(user.email, "transfer", code);

    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: result.error || "Invalid verification code" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: "Transfer verified successfully" },
    });
  } catch (error) {
    console.error("Transfer OTP verification error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
