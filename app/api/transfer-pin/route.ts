import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// ─── GET — Check if user has a transfer PIN set ──────────────
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { transferPin: true },
    });

    return NextResponse.json({
      success: true,
      data: { hasPin: !!user?.transferPin },
    });
  } catch (error) {
    console.error("Transfer PIN check error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// ─── POST — Set or update transfer PIN ───────────────────────
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { pin, currentPin } = body;

    // Validate new PIN
    if (!pin || typeof pin !== "string" || pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
      return NextResponse.json(
        { success: false, error: "PIN must be 4–6 digits" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { transferPin: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // If PIN already exists, require current PIN to change it
    if (user.transferPin) {
      if (!currentPin) {
        return NextResponse.json(
          { success: false, error: "Enter your current PIN to change it" },
          { status: 400 }
        );
      }
      const valid = await bcrypt.compare(currentPin, user.transferPin);
      if (!valid) {
        return NextResponse.json(
          { success: false, error: "Current PIN is incorrect" },
          { status: 400 }
        );
      }
    }

    // Hash and store new PIN
    const hashed = await bcrypt.hash(pin, 10);
    await prisma.user.update({
      where: { id: session.userId },
      data: { transferPin: hashed },
    });

    return NextResponse.json({
      success: true,
      data: { message: "Transfer PIN set successfully" },
    });
  } catch (error) {
    console.error("Transfer PIN set error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
