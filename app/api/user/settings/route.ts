import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword, verifyPassword } from "@/lib/auth";

// ─── PUT -- Change password ──────────────────────────────────────
export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: "All password fields are required" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "New passwords do not match" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Password strength validation
    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json(
        { success: false, error: "Password must contain at least one uppercase letter" },
        { status: 400 }
      );
    }
    if (!/[a-z]/.test(newPassword)) {
      return NextResponse.json(
        { success: false, error: "Password must contain at least one lowercase letter" },
        { status: 400 }
      );
    }
    if (!/[0-9]/.test(newPassword)) {
      return NextResponse.json(
        { success: false, error: "Password must contain at least one number" },
        { status: 400 }
      );
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      return NextResponse.json(
        { success: false, error: "Password must contain at least one special character" },
        { status: 400 }
      );
    }

    // Fetch current user password
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, password: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash new password and update
    const hashed = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: session.userId },
      data: { password: hashed },
    });

    return NextResponse.json({
      success: true,
      data: { message: "Password changed successfully" },
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to change password" },
      { status: 500 }
    );
  }
}
