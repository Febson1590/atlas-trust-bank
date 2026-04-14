"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  document: KycDocument | null;
  kycStatus: string;
}

const ACCEPTED_TYPES = ".jpg,.jpeg,.png,.pdf";
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_SIZE_LABEL = "5MB";

// ─── Component ──────────────────────────────────────────

export default function KycUploadForm({
  document: existingDoc,
  kycStatus,
}: KycUploadFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isReviewMode = kycStatus === "PENDING";
  const isRejected = existingDoc?.status === "REJECTED";
  const hasExisting = !!existingDoc && !isRejected;

  // Validate file
  const validateFile = (f: File): string | null => {
    if (f.size > MAX_SIZE) {
      return `File is too large. Maximum size is ${MAX_SIZE_LABEL}.`;
    }
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!ext || !["jpg", "jpeg", "png", "pdf"].includes(ext)) {
      return "Only JPG, PNG, and PDF files are accepted.";
    }
    return null;
  };

  // Upload file
  const uploadFile = async (selectedFile: File) => {
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setFile(selectedFile);
    setUploading(true);
    setProgress(0);
    setError(null);
    setSuccess(false);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 15, 85));
      }, 200);

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", "ID");

      const response = await fetch("/api/kyc", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "Upload failed. Please try again.");
        setUploading(false);
        setProgress(0);
        return;
      }

      setProgress(100);
      setUploading(false);
      setSuccess(true);

      router.refresh();
    } catch (err) {
      console.error("KYC upload error:", err);
      setError("Something went wrong. Check your connection and try again.");
      setUploading(false);
      setProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) uploadFile(f);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files?.[0];
    if (f) uploadFile(f);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="rounded-xl bg-navy-800 border border-border-subtle overflow-hidden">
      {/* Card header */}
      <div className="p-5 pb-0">
        <h3 className="text-sm font-semibold text-text-primary">
          Upload Verification Document
        </h3>
        <p className="text-xs text-text-muted mt-1 leading-relaxed">
          Upload one valid ID document (passport, driver&apos;s license, or national
          ID). Our team will review it and update your status.
        </p>
      </div>

      <div className="p-5">
        {/* Existing document info (pending review) */}
        {hasExisting && !uploading && !success && (
          <div className="flex items-center gap-3 rounded-lg bg-navy-900/50 border border-border-subtle p-3">
            <FileText className="h-4 w-4 text-text-muted shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-secondary truncate">
                {existingDoc.fileName}
              </p>
              <p className="text-xs text-text-muted">
                Uploaded{" "}
                {new Date(existingDoc.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            {existingDoc.status === "PENDING" && (
              <Clock className="h-4 w-4 text-warning shrink-0" />
            )}
          </div>
        )}

        {/* Pending review message */}
        {isReviewMode && !uploading && !success && (
          <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
            <div className="h-2 w-2 rounded-full bg-warning animate-pulse" />
            Your document is being reviewed. We&apos;ll let you know when it&apos;s done.
          </div>
        )}

        {/* Rejection note */}
        {isRejected && existingDoc?.adminNote && (
          <div className="rounded-lg bg-error/5 border border-error/20 p-3 mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-error mb-1">
              Why it was rejected
            </p>
            <p className="text-sm text-text-secondary">
              {existingDoc.adminNote}
            </p>
          </div>
        )}

        {/* Upload progress */}
        {uploading && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Loader2 className="h-4 w-4 text-gold-500 animate-spin" />
              <span className="text-sm text-text-secondary">
                Uploading {file?.name}...
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-navy-700 overflow-hidden">
              <div
                className="h-full rounded-full gold-gradient transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-error/5 border border-error/20 p-3 mb-3">
            <AlertCircle className="h-4 w-4 text-error shrink-0 mt-0.5" />
            <p className="text-sm text-error flex-1">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-error/60 hover:text-error transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Success state */}
        {success && file && !uploading && (
          <div className="flex items-center gap-3 rounded-lg bg-success/5 border border-success/20 p-3">
            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-secondary truncate">
                {file.name}
              </p>
              <p className="text-xs text-success">
                Uploaded! We&apos;re reviewing it now.
              </p>
            </div>
          </div>
        )}

        {/* Drop zone — show when not in review mode and no success state */}
        {!isReviewMode && !uploading && !success && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 cursor-pointer transition-all",
              "border-border-subtle hover:border-gold-500/40 hover:bg-navy-700/30",
              "group",
              (hasExisting || isRejected) && "mt-3"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              onChange={handleFileChange}
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
              JPG, PNG, or PDF &mdash; Max {MAX_SIZE_LABEL}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
