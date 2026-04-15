import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, getClientIP } from "@/lib/auth";
import { sendKycUpdateEmail } from "@/lib/email";

// ─── GET — Fetch all KYC documents with user info ───────────────
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "";
    const skip = (page - 1) * limit;

    const where = status
      ? { status: status as "PENDING" | "VERIFIED" | "REJECTED" }
      : {};

    const [documents, total] = await Promise.all([
      prisma.kycDocument.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              kycStatus: true,
            },
          },
        },
      }),
      prisma.kycDocument.count({ where }),
    ]);

    const serialized = documents.map((d) => ({
      id: d.id,
      userId: d.userId,
      type: d.type,
      fileUrl: d.fileUrl,
      fileName: d.fileName,
      status: d.status,
      adminNote: d.adminNote,
      reviewedBy: d.reviewedBy,
      reviewedAt: d.reviewedAt?.toISOString() ?? null,
      createdAt: d.createdAt.toISOString(),
      user: d.user,
    }));

    return NextResponse.json({
      success: true,
      data: serialized,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin fetch KYC error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch KYC documents" },
      { status: 500 }
    );
  }
}

// ─── PUT — Review KYC document (approve/reject) ─────────────────
export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { documentId, action, adminNote } = body;

    if (!documentId || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "documentId and action (approve/reject) are required" },
        { status: 400 }
      );
    }

    const document = await prisma.kycDocument.findUnique({
      where: { id: documentId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            email: true,
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    const ipAddress = getClientIP(request);

    if (action === "approve") {
      // Atomic: flip the doc to VERIFIED, check every doc for this user,
      // and promote the user's overall kycStatus if they're all verified.
      // Previously these three steps ran outside a transaction so a DB
      // blip between them could leave doc + user state inconsistent.
      const allVerified = await prisma.$transaction(async (tx) => {
        await tx.kycDocument.update({
          where: { id: documentId },
          data: {
            status: "VERIFIED",
            adminNote: adminNote || null,
            reviewedBy: session.userId,
            reviewedAt: new Date(),
          },
        });

        // Re-read inside the transaction so we see the just-written row.
        const allDocs = await tx.kycDocument.findMany({
          where: { userId: document.userId },
        });

        const verified =
          allDocs.length > 0 &&
          allDocs.every((d) => d.status === "VERIFIED");

        if (verified) {
          await tx.user.update({
            where: { id: document.userId },
            data: { kycStatus: "VERIFIED" },
          });
        }

        return verified;
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          adminId: session.userId,
          action: "APPROVE_KYC_DOCUMENT",
          targetType: "KycDocument",
          targetId: documentId,
          details: {
            documentType: document.type,
            userId: document.userId,
            allVerified,
            adminNote,
          },
          ipAddress,
        },
      });

      // Send email notification (non-blocking)
      const emailStatus = allVerified ? "VERIFIED" : "PENDING";
      sendKycUpdateEmail(
        document.user.email,
        document.user.firstName,
        emailStatus,
        undefined
      ).catch(console.error);

      return NextResponse.json({
        success: true,
        message: `Document approved${allVerified ? ". User KYC fully verified." : "."}`,
      });
    }

    if (action === "reject") {
      // Update document and user KYC status
      await prisma.$transaction(async (tx) => {
        await tx.kycDocument.update({
          where: { id: documentId },
          data: {
            status: "REJECTED",
            adminNote: adminNote || null,
            reviewedBy: session.userId,
            reviewedAt: new Date(),
          },
        });

        await tx.user.update({
          where: { id: document.userId },
          data: { kycStatus: "REJECTED" },
        });
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          adminId: session.userId,
          action: "REJECT_KYC_DOCUMENT",
          targetType: "KycDocument",
          targetId: documentId,
          details: {
            documentType: document.type,
            userId: document.userId,
            adminNote,
          },
          ipAddress,
        },
      });

      sendKycUpdateEmail(
        document.user.email,
        document.user.firstName,
        "REJECTED",
        adminNote
      ).catch(console.error);

      return NextResponse.json({ success: true, message: "Document rejected" });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Admin KYC review error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to review document" },
      { status: 500 }
    );
  }
}
