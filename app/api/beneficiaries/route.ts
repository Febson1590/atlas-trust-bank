import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { beneficiarySchema } from "@/lib/validations";

// ─── GET — Fetch user's beneficiaries ───────────────────────
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const beneficiaries = await prisma.beneficiary.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });

    const serialized = beneficiaries.map((b) => ({
      id: b.id,
      name: b.name,
      bankName: b.bankName,
      accountNumber: b.accountNumber,
      routingNumber: b.routingNumber,
      swiftCode: b.swiftCode,
      country: b.country,
      createdAt: b.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data: serialized });
  } catch (error) {
    console.error("Fetch beneficiaries error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch beneficiaries" },
      { status: 500 }
    );
  }
}

// ─── POST — Create a new beneficiary ────────────────────────
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
    const result = beneficiarySchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const { name, bankName, accountNumber, routingNumber, swiftCode, country } =
      result.data;

    // Check for duplicate beneficiary
    const existing = await prisma.beneficiary.findFirst({
      where: {
        userId: session.userId,
        accountNumber,
        bankName,
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "A beneficiary with this account already exists" },
        { status: 409 }
      );
    }

    const beneficiary = await prisma.beneficiary.create({
      data: {
        userId: session.userId,
        name,
        bankName,
        accountNumber,
        routingNumber: routingNumber || null,
        swiftCode: swiftCode || null,
        country: country || "US",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: beneficiary.id,
          name: beneficiary.name,
          bankName: beneficiary.bankName,
          accountNumber: beneficiary.accountNumber,
          routingNumber: beneficiary.routingNumber,
          swiftCode: beneficiary.swiftCode,
          country: beneficiary.country,
          createdAt: beneficiary.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create beneficiary error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

// ─── PUT — Update a beneficiary ─────────────────────────────
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
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Beneficiary ID is required" },
        { status: 400 }
      );
    }

    // Validate update fields
    const result = beneficiarySchema.safeParse(updateData);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    // Check ownership
    const existing = await prisma.beneficiary.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Beneficiary not found" },
        { status: 404 }
      );
    }

    const { name, bankName, accountNumber, routingNumber, swiftCode, country } =
      result.data;

    const updated = await prisma.beneficiary.update({
      where: { id },
      data: {
        name,
        bankName,
        accountNumber,
        routingNumber: routingNumber || null,
        swiftCode: swiftCode || null,
        country: country || "US",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        bankName: updated.bankName,
        accountNumber: updated.accountNumber,
        routingNumber: updated.routingNumber,
        swiftCode: updated.swiftCode,
        country: updated.country,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Update beneficiary error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

// ─── DELETE — Delete a beneficiary ──────────────────────────
export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Try getting id from query params or body
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {
        // No body provided
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Beneficiary ID is required" },
        { status: 400 }
      );
    }

    // Check ownership
    const existing = await prisma.beneficiary.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Beneficiary not found" },
        { status: 404 }
      );
    }

    await prisma.beneficiary.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      data: { message: "Beneficiary deleted successfully" },
    });
  } catch (error) {
    console.error("Delete beneficiary error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
