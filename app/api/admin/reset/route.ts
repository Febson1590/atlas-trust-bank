import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, getClientIP } from "@/lib/auth";
import type { NextRequest } from "next/server";

// ─── POST — Reset all user data (admin only) ────────────────
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete everything in correct order
    await prisma.$transaction(async (tx) => {
      // Delete transfers first (references accounts)
      await tx.transfer.deleteMany({});
      // Delete transactions (references accounts)
      await tx.transaction.deleteMany({});
      // Delete cards (references accounts)
      await tx.card.deleteMany({});
      // Delete accounts
      await tx.account.deleteMany({});
      // Delete KYC documents
      await tx.kycDocument.deleteMany({});
      // Delete beneficiaries
      await tx.beneficiary.deleteMany({});
      // Delete notifications
      await tx.notification.deleteMany({});
      // Delete support messages then tickets
      await tx.ticketMessage.deleteMany({});
      await tx.supportTicket.deleteMany({});
      // Reset all user KYC status and transfer PINs (keep user accounts)
      await tx.user.updateMany({
        where: { role: "USER" },
        data: {
          kycStatus: "NOT_STARTED",
          transferPin: null,
          avatarUrl: null,
        },
      });
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: session.userId,
        action: "SYSTEM_RESET",
        targetType: "SYSTEM",
        targetId: "all",
        details: { message: "Full system data reset performed" },
        ipAddress: getClientIP(request),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("System reset error:", error);
    const message = error instanceof Error ? error.message : "Reset failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
