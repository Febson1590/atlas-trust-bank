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
  const session = await getSession();
  if (!session) redirect("/login");

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

  // Get the latest document (for display)
  const latestDoc = user.kycDocuments[0] ?? null;

  const serializedDoc = latestDoc
    ? {
        id: latestDoc.id,
        type: latestDoc.type,
        fileName: latestDoc.fileName,
        fileUrl: latestDoc.fileUrl,
        status: latestDoc.status,
        adminNote: latestDoc.adminNote,
        createdAt: latestDoc.createdAt.toISOString(),
      }
    : null;

  // Find rejection note if any
  const rejectedDoc = user.kycDocuments.find(
    (doc) => doc.status === "REJECTED" && doc.adminNote
  );
  const rejectionNote = rejectedDoc?.adminNote ?? null;

  // Verified date
  const verifiedDoc = user.kycDocuments.find(
    (doc) => doc.status === "VERIFIED" && doc.reviewedAt
  );

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      {/* Page Header */}
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
          Verify your identity to get full access to your account.
        </p>
      </div>

      {/* Status Banner */}
      <KycStatusComponent
        status={user.kycStatus}
        adminNote={rejectionNote}
      />

      {/* Verified Details */}
      {user.kycStatus === "VERIFIED" && (
        <div className="rounded-xl bg-navy-800 border border-border-subtle p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">
            Verification Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-text-muted mb-1">Name</p>
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
          </div>
        </div>
      )}

      {/* Upload Form — show for NOT_STARTED, PENDING, and REJECTED */}
      {user.kycStatus !== "VERIFIED" && (
        <KycUploadForm
          document={serializedDoc}
          kycStatus={user.kycStatus}
        />
      )}
    </div>
  );
}
