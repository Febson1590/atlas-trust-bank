import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { KycDocType, KycStatus } from "@/generated/prisma";

// ─── Allowed file types and size ─────────────────────────
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// ─── GET: Fetch user's KYC documents ─────────────────────
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        kycStatus: true,
        kycDocuments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          kycStatus: user.kycStatus,
          documents: user.kycDocuments,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("KYC GET error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// ─── POST: Upload KYC document ──────────────────────────
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const docType = formData.get("type") as string | null;

    // Validate document type
    if (!docType || !Object.values(KycDocType).includes(docType as KycDocType)) {
      return NextResponse.json(
        { success: false, error: "Invalid document type." },
        { status: 400 }
      );
    }

    // Validate file presence
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No file provided." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File is too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Validate file extension
    const fileName = file.name;
    const lastDot = fileName.lastIndexOf(".");
    const fileExtension = lastDot >= 0 ? fileName.slice(lastDot).toLowerCase() : "";
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json(
        { success: false, error: "Only JPG, PNG, and PDF files are accepted." },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Only JPG, PNG, and PDF files are accepted." },
        { status: 400 }
      );
    }

    // Convert file to base64 data URL for storage (works on serverless)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const fileUrl = `data:${file.type};base64,${base64}`;

    // Check if there's an existing document of this type
    const existingDoc = await prisma.kycDocument.findFirst({
      where: {
        userId: session.userId,
        type: docType as KycDocType,
      },
    });

    let document;

    if (existingDoc) {
      // Update existing document (re-upload)
      document = await prisma.kycDocument.update({
        where: { id: existingDoc.id },
        data: {
          fileUrl,
          fileName: file.name,
          status: KycStatus.PENDING,
          adminNote: null,
          reviewedBy: null,
          reviewedAt: null,
        },
      });
    } else {
      // Create new document record
      document = await prisma.kycDocument.create({
        data: {
          userId: session.userId,
          type: docType as KycDocType,
          fileUrl,
          fileName: file.name,
          status: KycStatus.PENDING,
        },
      });
    }

    // Update user's KYC status to PENDING
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { kycStatus: true },
    });

    if (
      user &&
      (user.kycStatus === KycStatus.NOT_STARTED || user.kycStatus === KycStatus.REJECTED)
    ) {
      await prisma.user.update({
        where: { id: session.userId },
        data: { kycStatus: KycStatus.PENDING },
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          document: {
            id: document.id,
            type: document.type,
            fileName: document.fileName,
            status: document.status,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("KYC POST error:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
