import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { KycDocType, KycStatus } from "@/app/generated/prisma";

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
      { success: false, error: "An unexpected error occurred. Please try again." },
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
        { success: false, error: "Invalid document type. Must be ID, SELFIE, or PROOF_OF_ADDRESS." },
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
        { success: false, error: "File size exceeds 5MB limit." },
        { status: 400 }
      );
    }

    // Validate file type by extension
    const fileExtension = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only JPG, PNG, and PDF files are allowed." },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only JPG, PNG, and PDF files are allowed." },
        { status: 400 }
      );
    }

    // Create upload directory
    const uploadDir = path.join(process.cwd(), "public", "uploads", "kyc", session.userId);
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `${docType}_${timestamp}_${safeFileName}`;
    const filePath = path.join(uploadDir, fileName);

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // File URL relative to public directory
    const fileUrl = `/uploads/kyc/${session.userId}/${fileName}`;

    // Check if there's an existing document of this type and remove it
    const existingDoc = await prisma.kycDocument.findFirst({
      where: {
        userId: session.userId,
        type: docType as KycDocType,
      },
    });

    let document;

    if (existingDoc) {
      // Update existing document (re-upload scenario)
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

    // Check if user now has all 3 document types uploaded
    const allDocuments = await prisma.kycDocument.findMany({
      where: { userId: session.userId },
      select: { type: true },
    });

    const uploadedTypes = new Set(allDocuments.map((d) => d.type));
    const hasAllDocuments =
      uploadedTypes.has(KycDocType.ID) &&
      uploadedTypes.has(KycDocType.SELFIE) &&
      uploadedTypes.has(KycDocType.PROOF_OF_ADDRESS);

    // Update user's KYC status to PENDING if all documents are uploaded
    if (hasAllDocuments) {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { kycStatus: true },
      });

      // Only update to PENDING if currently NOT_STARTED or REJECTED
      if (
        user &&
        (user.kycStatus === KycStatus.NOT_STARTED || user.kycStatus === KycStatus.REJECTED)
      ) {
        await prisma.user.update({
          where: { id: session.userId },
          data: { kycStatus: KycStatus.PENDING },
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          document,
          allDocumentsUploaded: hasAllDocuments,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("KYC POST error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
