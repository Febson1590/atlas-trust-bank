import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { ShieldCheck, FileText } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import KycActions from "./KycActions";

export const dynamic = "force-dynamic";

const STATUS_TABS = ["ALL", "PENDING", "VERIFIED", "REJECTED"] as const;

const DOC_TYPE_LABELS: Record<string, string> = {
  ID: "Government ID",
  SELFIE: "Selfie Verification",
  PROOF_OF_ADDRESS: "Proof of Address",
};

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function AdminKycPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const statusFilter = params.status || "ALL";
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = statusFilter !== "ALL"
    ? { status: statusFilter as "PENDING" | "VERIFIED" | "REJECTED" }
    : {};

  const [documents, total, statusCounts] = await Promise.all([
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
    Promise.all(
      STATUS_TABS.filter((s) => s !== "ALL").map(async (s) => ({
        status: s,
        count: await prisma.kycDocument.count({ where: { status: s as "PENDING" | "VERIFIED" | "REJECTED" } }),
      }))
    ),
  ]);

  const totalAll = statusCounts.reduce((sum, s) => sum + s.count, 0);
  const totalPages = Math.ceil(total / limit);

  const serialized = documents.map((d) => ({
    id: d.id,
    userId: d.userId,
    type: d.type,
    fileUrl: d.fileUrl,
    fileName: d.fileName,
    status: d.status,
    adminNote: d.adminNote,
    reviewedAt: d.reviewedAt?.toISOString() ?? null,
    createdAt: d.createdAt.toISOString(),
    user: d.user,
  }));

  // Group by user for display
  const grouped: Record<string, { user: any; docs: any[] }> = {};
  for (const doc of serialized) {
    const key = doc.userId;
    if (!grouped[key]) {
      grouped[key] = { user: doc.user, docs: [] };
    }
    grouped[key].docs.push(doc);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gold-gradient">
            <ShieldCheck className="h-5 w-5 text-navy-950" />
          </div>
          KYC Management
        </h1>
        <p className="text-text-muted mt-1">{total} document{total !== 1 ? "s" : ""}</p>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => {
          const count = tab === "ALL" ? totalAll : statusCounts.find((s) => s.status === tab)?.count || 0;
          const isActive = statusFilter === tab;
          return (
            <a
              key={tab}
              href={`/admin/kyc${tab !== "ALL" ? `?status=${tab}` : ""}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "gold-gradient text-navy-950"
                  : "glass glass-border text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                isActive ? "bg-navy-950/20 text-navy-950" : "bg-navy-800 text-text-muted"
              }`}>
                {count}
              </span>
            </a>
          );
        })}
      </div>

      {/* Content */}
      {Object.keys(grouped).length === 0 ? (
        <div className="glass glass-border rounded-xl">
          <EmptyState
            icon={FileText}
            title="No KYC documents"
            description={statusFilter !== "ALL" ? `No ${statusFilter.toLowerCase()} documents.` : "No KYC documents have been submitted."}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([userId, { user, docs }]) => (
            <div key={userId} className="glass glass-border rounded-xl overflow-hidden">
              {/* User Header */}
              <div className="px-4 sm:px-6 py-4 border-b border-border-default flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-800 border border-border-default flex-shrink-0">
                    <span className="text-sm font-semibold gold-text">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-text-primary font-medium truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-text-muted text-xs truncate">{user.email}</p>
                  </div>
                </div>
                <StatusBadge status={user.kycStatus} />
              </div>

              {/* Documents */}
              <div className="divide-y divide-border-default">
                {docs.map((doc) => (
                  <div key={doc.id} className="px-4 sm:px-6 py-4 space-y-3">
                    {/* Doc info row */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-navy-800 border border-border-default flex-shrink-0">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-text-muted" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-text-primary text-sm font-medium">
                            {DOC_TYPE_LABELS[doc.type] || doc.type}
                          </p>
                          <StatusBadge status={doc.status} />
                        </div>
                        <p className="text-text-muted text-xs truncate mt-0.5">{doc.fileName}</p>
                        <p className="text-text-muted text-xs mt-0.5">
                          Uploaded {formatDate(doc.createdAt)}
                          {doc.reviewedAt && ` · Reviewed ${formatDate(doc.reviewedAt)}`}
                        </p>
                        {doc.adminNote && (
                          <p className="text-xs text-text-muted mt-1 italic">
                            Note: {doc.adminNote}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action row — visible and tappable */}
                    {doc.status === "PENDING" && (
                      <div className="flex items-center gap-2 pl-12 sm:pl-[52px]">
                        <KycActions document={doc} />
                        {doc.fileUrl && !doc.fileUrl.startsWith("data:") && (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gold-500 hover:text-gold-400 px-3 py-1.5 rounded-lg border border-gold-500/20 hover:border-gold-500/40 transition-colors"
                          >
                            View File
                          </a>
                        )}
                      </div>
                    )}

                    {/* View file for non-pending docs */}
                    {doc.status !== "PENDING" && doc.fileUrl && !doc.fileUrl.startsWith("data:") && (
                      <div className="pl-12 sm:pl-[52px]">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gold-500 hover:text-gold-400 transition-colors underline decoration-dashed"
                        >
                          View File
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">
            Showing {skip + 1}–{Math.min(skip + limit, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <a
                href={`/admin/kyc?page=${page - 1}${statusFilter !== "ALL" ? `&status=${statusFilter}` : ""}`}
                className="px-3 py-1.5 text-sm border border-border-default rounded-lg text-text-secondary hover:bg-navy-800/50 transition-colors"
              >
                Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/admin/kyc?page=${page + 1}${statusFilter !== "ALL" ? `&status=${statusFilter}` : ""}`}
                className="px-3 py-1.5 text-sm border border-border-default rounded-lg text-text-secondary hover:bg-navy-800/50 transition-colors"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
