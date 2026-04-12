import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import KycStatusComponent from "@/components/dashboard/KycStatus";
import KycUploadForm from "@/components/dashboard/KycUploadForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KYC Verification",
};

export default async function KycPage() {
  // ── Session ────────────────────────────────────────────────
  const session = await getSession();
  if (!session) redirect("/login");

  // ── Fetch user with KYC data ───────────────────────────────
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      firstName: true,
      lastName: true,
      kycStatus: true,
      kycDocuments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) redirect("/login");

  // ── Serialize documents for client component ───────────────
  const serializedDocuments = user.kycDocuments.map((doc) => ({
    id: doc.id,
    type: doc.type,
    fileName: doc.fileName,
    fileUrl: doc.fileUrl,
    status: doc.status,
    adminNote: doc.adminNote,
    createdAt: doc.createdAt.toISOString(),
  }));

  // ── Find the latest rejection note (if any) ───────────────
  const rejectedDoc = user.kycDocuments.find(
    (doc) => doc.status === "REJECTED" && doc.adminNote
  );
  const rejectionNote = rejectedDoc?.adminNote ?? null;

  // ── Verification details for verified users ────────────────
  const verifiedDoc = user.kycDocuments.find(
    (doc) => doc.status === "VERIFIED" && doc.reviewedAt
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/10">
            <ShieldCheck className="h-5 w-5 text-gold-500" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary">
            KYC Verification
          </h2>
        </div>
        <p className="text-sm text-text-muted mt-1 ml-12">
          Verify your identity to unlock full access to all banking features.
        </p>
      </div>

      {/* ── KYC Status Banner ────────────────────────────────── */}
      <KycStatusComponent
        status={user.kycStatus}
        adminNote={rejectionNote}
      />

      {/* ── Verified Details ─────────────────────────────────── */}
      {user.kycStatus === "VERIFIED" && (
        <div className="rounded-xl bg-navy-800 border border-border-subtle p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">
            Verification Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-text-muted mb-1">Verified Name</p>
              <p className="text-sm font-medium text-text-primary">
                {user.firstName} {user.lastName}
              </p>
            </div>
            {verifiedDoc?.reviewedAt && (
              <div>
                <p className="text-xs text-text-muted mb-1">Verified On</p>
                <p className="text-sm font-medium text-text-primary">
                  {formatDate(verifiedDoc.reviewedAt)}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-text-muted mb-1">Documents Submitted</p>
              <p className="text-sm font-medium text-text-primary">
                {user.kycDocuments.length} document{user.kycDocuments.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">Access Level</p>
              <p className="text-sm font-medium text-success">
                Full Access
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Upload Form ──────────────────────────────────────── */}
      {/* Show form for NOT_STARTED, PENDING (read-only), and REJECTED */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">
          {user.kycStatus === "NOT_STARTED"
            ? "Required Documents"
            : user.kycStatus === "REJECTED"
            ? "Re-submit Your Documents"
            : user.kycStatus === "PENDING"
            ? "Submitted Documents"
            : "Your Documents"}
        </h3>
        <KycUploadForm
          documents={serializedDocuments}
          kycStatus={user.kycStatus}
        />
      </div>

      {/* ── Help Section ─────────────────────────────────────── */}
      {(user.kycStatus === "NOT_STARTED" || user.kycStatus === "REJECTED") && (
        <div className="rounded-xl bg-navy-800 border border-border-subtle p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">
            Tips for Successful Verification
          </h3>
          <ul className="space-y-3">
            {[
              "Ensure all documents are clearly visible and not blurry or cropped.",
              "Government ID must be valid and not expired.",
              "Selfie should clearly show your face alongside the ID document.",
              "Proof of address must be dated within the last 3 months.",
              "Accepted file formats: JPG, PNG, or PDF. Maximum file size: 5MB.",
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-500/10 mt-0.5">
                  <span className="text-xs font-bold text-gold-500">
                    {i + 1}
                  </span>
                </div>
                <p className="text-sm text-text-secondary">{tip}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
