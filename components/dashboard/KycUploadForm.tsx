"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  Camera,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";

// ─── Types ──────────────────────────────────────────────

interface KycDocument {
  id: string;
  type: string;
  fileName: string;
  fileUrl: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
}

interface KycUploadFormProps {
  documents: KycDocument[];
  kycStatus: string;
}

interface UploadState {
  file: File | null;
  uploading: boolean;
  progress: number;
  error: string | null;
}

type DocType = "ID" | "SELFIE" | "PROOF_OF_ADDRESS";

// ─── Section config ─────────────────────────────────────

const DOC_SECTIONS: {
  type: DocType;
  title: string;
  description: string;
  icon: typeof FileText;
  acceptHint: string;
}[] = [
  {
    type: "ID",
    title: "Government-Issued ID",
    description: "Upload your passport, driver's license, or national identity card.",
    icon: FileText,
    acceptHint: "Passport, Driver's License, or National ID",
  },
  {
    type: "SELFIE",
    title: "Selfie with ID",
    description: "Take a clear photo of yourself holding your government-issued ID.",
    icon: Camera,
    acceptHint: "Clear photo of you holding your ID document",
  },
  {
    type: "PROOF_OF_ADDRESS",
    title: "Proof of Address",
    description: "Upload a recent utility bill, bank statement, or government letter (within 3 months).",
    icon: MapPin,
    acceptHint: "Utility bill, bank statement, or government letter",
  },
];

const ACCEPTED_TYPES = ".jpg,.jpeg,.png,.pdf";
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_SIZE_LABEL = "5MB";

// ─── Component ──────────────────────────────────────────

export default function KycUploadForm({
  documents,
  kycStatus,
}: KycUploadFormProps) {
  const router = useRouter();

  // Track upload state per document type
  const [uploads, setUploads] = useState<Record<DocType, UploadState>>({
    ID: { file: null, uploading: false, progress: 0, error: null },
    SELFIE: { file: null, uploading: false, progress: 0, error: null },
    PROOF_OF_ADDRESS: { file: null, uploading: false, progress: 0, error: null },
  });

  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  // Refs for hidden file inputs
  const fileInputRefs = useRef<Record<DocType, HTMLInputElement | null>>({
    ID: null,
    SELFIE: null,
    PROOF_OF_ADDRESS: null,
  });

  // Find existing document for a type
  const getExistingDoc = useCallback(
    (type: DocType): KycDocument | undefined => {
      return documents.find((doc) => doc.type === type);
    },
    [documents]
  );

  // Validate file
  const validateFile = (file: File): string | null => {
    if (file.size > MAX_SIZE) {
      return `File exceeds ${MAX_SIZE_LABEL} limit. Please choose a smaller file.`;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["jpg", "jpeg", "png", "pdf"].includes(ext)) {
      return "Invalid file type. Only JPG, PNG, and PDF files are accepted.";
    }

    return null;
  };

  // Upload file
  const uploadFile = async (type: DocType, file: File) => {
    // Validate
    const validationError = validateFile(file);
    if (validationError) {
      setUploads((prev) => ({
        ...prev,
        [type]: { ...prev[type], error: validationError, file: null },
      }));
      return;
    }

    // Set uploading state
    setUploads((prev) => ({
      ...prev,
      [type]: { file, uploading: true, progress: 0, error: null },
    }));

    try {
      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setUploads((prev) => ({
          ...prev,
          [type]: {
            ...prev[type],
            progress: Math.min(prev[type].progress + 15, 85),
          },
        }));
      }, 200);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("/api/kyc", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      const result = await response.json();

      if (!response.ok || !result.success) {
        setUploads((prev) => ({
          ...prev,
          [type]: {
            file: null,
            uploading: false,
            progress: 0,
            error: result.error || "Upload failed. Please try again.",
          },
        }));
        return;
      }

      // Success
      setUploads((prev) => ({
        ...prev,
        [type]: { file, uploading: false, progress: 100, error: null },
      }));

      // If all documents uploaded, show message
      if (result.data?.allDocumentsUploaded) {
        setSubmitMessage(
          "All documents uploaded successfully! Your verification is now under review."
        );
      }

      // Refresh server data
      router.refresh();
    } catch {
      setUploads((prev) => ({
        ...prev,
        [type]: {
          file: null,
          uploading: false,
          progress: 0,
          error: "Network error. Please check your connection and try again.",
        },
      }));
    }
  };

  // Handle file input change
  const handleFileChange = (type: DocType, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(type, file);
    }
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  // Handle drag and drop
  const handleDrop = (type: DocType, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(type, file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Clear error for a type
  const clearError = (type: DocType) => {
    setUploads((prev) => ({
      ...prev,
      [type]: { ...prev[type], error: null },
    }));
  };

  // Check if all docs are uploaded (either from server or just-uploaded)
  const allDocTypes: DocType[] = ["ID", "SELFIE", "PROOF_OF_ADDRESS"];
  const allUploaded = allDocTypes.every((type) => {
    const existing = getExistingDoc(type);
    return existing || uploads[type].progress === 100;
  });

  // Determine if the form should be interactive
  const isReviewMode = kycStatus === "PENDING" || kycStatus === "VERIFIED";

  return (
    <div className="space-y-6">
      {/* Submit message */}
      {submitMessage && (
        <div className="rounded-xl bg-success/10 border border-success/20 p-4 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
          <p className="text-sm text-success font-medium">{submitMessage}</p>
        </div>
      )}

      {/* Document upload sections */}
      {DOC_SECTIONS.map((section) => {
        const existing = getExistingDoc(section.type);
        const state = uploads[section.type];
        const SectionIcon = section.icon;

        // Determine section state
        const isUploaded = existing || state.progress === 100;
        const isUploading = state.uploading;
        const hasError = !!state.error;
        const isRejected = existing?.status === "REJECTED";

        return (
          <div
            key={section.type}
            className={cn(
              "rounded-xl border transition-all",
              isUploaded && !isRejected
                ? "bg-navy-800 border-success/20"
                : hasError || isRejected
                ? "bg-navy-800 border-error/20"
                : "bg-navy-800 border-border-subtle"
            )}
          >
            {/* Section header */}
            <div className="flex items-start gap-4 p-5 pb-0">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  isUploaded && !isRejected
                    ? "bg-success/10"
                    : "bg-gold-500/10"
                )}
              >
                {isUploaded && !isRejected ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <SectionIcon className="h-5 w-5 text-gold-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h4 className="text-sm font-semibold text-text-primary">
                    {section.title}
                  </h4>
                  {existing && (
                    <StatusBadge status={existing.status} />
                  )}
                </div>
                <p className="text-xs text-text-muted mt-1">
                  {section.description}
                </p>
              </div>
            </div>

            <div className="p-5">
              {/* Show uploaded file info */}
              {existing && !isRejected && !isUploading && (
                <div className="flex items-center gap-3 rounded-lg bg-navy-900/50 border border-border-subtle p-3">
                  <FileText className="h-4 w-4 text-text-muted shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-secondary truncate">
                      {existing.fileName}
                    </p>
                    <p className="text-xs text-text-muted">
                      Uploaded {new Date(existing.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  {existing.status === "VERIFIED" && (
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                  )}
                  {existing.status === "PENDING" && (
                    <Clock className="h-4 w-4 text-warning shrink-0" />
                  )}
                </div>
              )}

              {/* Show rejection note */}
              {isRejected && existing?.adminNote && (
                <div className="rounded-lg bg-error/5 border border-error/20 p-3 mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-error mb-1">
                    Rejection Reason
                  </p>
                  <p className="text-sm text-text-secondary">
                    {existing.adminNote}
                  </p>
                </div>
              )}

              {/* Upload progress */}
              {isUploading && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-4 w-4 text-gold-500 animate-spin" />
                    <span className="text-sm text-text-secondary">
                      Uploading {state.file?.name}...
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-navy-700 overflow-hidden">
                    <div
                      className="h-full rounded-full gold-gradient transition-all duration-300 ease-out"
                      style={{ width: `${state.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error message */}
              {hasError && (
                <div className="flex items-start gap-2 rounded-lg bg-error/5 border border-error/20 p-3 mb-3">
                  <AlertCircle className="h-4 w-4 text-error shrink-0 mt-0.5" />
                  <p className="text-sm text-error flex-1">{state.error}</p>
                  <button
                    type="button"
                    onClick={() => clearError(section.type)}
                    className="text-error/60 hover:text-error transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Drop zone — show when no file uploaded, or rejected, or has error */}
              {(!existing || isRejected) && !isUploading && !isReviewMode && (
                <div
                  onDrop={(e) => handleDrop(section.type, e)}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRefs.current[section.type]?.click()}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 cursor-pointer transition-all",
                    "border-border-subtle hover:border-gold-500/40 hover:bg-navy-700/30",
                    "group"
                  )}
                >
                  <input
                    ref={(el) => { fileInputRefs.current[section.type] = el; }}
                    type="file"
                    accept={ACCEPTED_TYPES}
                    onChange={(e) => handleFileChange(section.type, e)}
                    className="hidden"
                  />

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-700 border border-border-subtle group-hover:border-gold-500/30 transition-colors mb-3">
                    <Upload className="h-5 w-5 text-text-muted group-hover:text-gold-500 transition-colors" />
                  </div>

                  <p className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                    Drop your file here or{" "}
                    <span className="text-gold-500">browse</span>
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    {section.acceptHint}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    JPG, PNG, or PDF &mdash; Max {MAX_SIZE_LABEL}
                  </p>
                </div>
              )}

              {/* Just-uploaded success state (no server doc yet, but upload complete) */}
              {!existing && state.progress === 100 && state.file && !isUploading && (
                <div className="flex items-center gap-3 rounded-lg bg-success/5 border border-success/20 p-3">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-secondary truncate">
                      {state.file.name}
                    </p>
                    <p className="text-xs text-success">
                      Uploaded successfully
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Status indicator for all uploads */}
      {!isReviewMode && (
        <div className="rounded-xl bg-navy-800 border border-border-subtle p-5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-text-primary">
                Verification Progress
              </h4>
              <p className="text-xs text-text-muted mt-1">
                {allUploaded
                  ? "All documents uploaded. Your verification is under review."
                  : `${allDocTypes.filter((t) => getExistingDoc(t) || uploads[t].progress === 100).length} of 3 documents uploaded`}
              </p>
            </div>
            <div className="flex gap-1.5">
              {allDocTypes.map((type) => {
                const done = !!getExistingDoc(type) || uploads[type].progress === 100;
                return (
                  <div
                    key={type}
                    className={cn(
                      "h-2 w-8 rounded-full transition-all",
                      done ? "gold-gradient" : "bg-navy-700"
                    )}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
