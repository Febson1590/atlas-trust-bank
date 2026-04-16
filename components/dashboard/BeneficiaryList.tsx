"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Users,
  Building2,
  Globe,
  AlertTriangle,
  Check,
} from "lucide-react";
import { beneficiarySchema, type BeneficiaryInput } from "@/lib/validations";
import { cn, maskAccountNumber } from "@/lib/utils";
import EmptyState from "@/components/ui/EmptyState";

// ─── Types ──────────────────────────────────────────────────

interface Beneficiary {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string | null;
  swiftCode: string | null;
  country: string;
  createdAt: string;
}

interface BeneficiaryListProps {
  initialBeneficiaries: Beneficiary[];
}

// ─── Country mapping ────────────────────────────────────────

const countryLabels: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  DE: "Germany",
  FR: "France",
  NG: "Nigeria",
  GH: "Ghana",
  KE: "Kenya",
  ZA: "South Africa",
  IN: "India",
  CN: "China",
  JP: "Japan",
  SG: "Singapore",
  AE: "UAE",
};

// ─── Component ──────────────────────────────────────────────

export default function BeneficiaryList({
  initialBeneficiaries,
}: BeneficiaryListProps) {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(initialBeneficiaries);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BeneficiaryInput>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      name: "",
      bankName: "",
      accountNumber: "",
      routingNumber: "",
      swiftCode: "",
      country: "US",
    },
  });

  // ── Open form for adding ───────────────────────────────────
  const handleOpenAdd = () => {
    reset({
      name: "",
      bankName: "",
      accountNumber: "",
      routingNumber: "",
      swiftCode: "",
      country: "US",
    });
    setEditingId(null);
    setServerError("");
    setSuccessMessage("");
    setIsFormOpen(true);
  };

  // ── Open form for editing ──────────────────────────────────
  const handleOpenEdit = (b: Beneficiary) => {
    setValue("name", b.name);
    setValue("bankName", b.bankName);
    setValue("accountNumber", b.accountNumber);
    setValue("routingNumber", b.routingNumber || "");
    setValue("swiftCode", b.swiftCode || "");
    setValue("country", b.country);
    setEditingId(b.id);
    setServerError("");
    setSuccessMessage("");
    setIsFormOpen(true);
  };

  // ── Close form ─────────────────────────────────────────────
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setServerError("");
    reset();
  };

  // ── Submit form (create or update) ─────────────────────────
  const onSubmit = async (data: BeneficiaryInput) => {
    setServerError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const isEditing = !!editingId;
      const url = "/api/beneficiaries";
      const method = isEditing ? "PUT" : "POST";
      const payload = isEditing ? { id: editingId, ...data } : data;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(result.error || "Something went wrong");
        setIsSubmitting(false);
        return;
      }

      if (isEditing) {
        setBeneficiaries((prev) =>
          prev.map((b) => (b.id === editingId ? result.data : b))
        );
        setSuccessMessage("Beneficiary updated successfully");
      } else {
        setBeneficiaries((prev) => [result.data, ...prev]);
        setSuccessMessage("Beneficiary added successfully");
      }

      handleCloseForm();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete beneficiary ─────────────────────────────────────
  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    setServerError("");

    try {
      const res = await fetch(`/api/beneficiaries?id=${id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(result.error || "Failed to delete beneficiary");
        setIsDeleting(false);
        setDeletingId(null);
        return;
      }

      setBeneficiaries((prev) => prev.filter((b) => b.id !== id));
      setDeletingId(null);
      setSuccessMessage("Beneficiary deleted successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────

  return (
    <div>
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 bg-success/10 border border-success/20 rounded-lg px-4 py-3 text-success text-sm flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" />
          {successMessage}
        </div>
      )}

      {/* Server Error */}
      {serverError && !isFormOpen && (
        <div className="mb-4 bg-error/10 border border-error/20 rounded-lg px-4 py-3 text-error text-sm flex items-start gap-2">
          <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-error" />
          {serverError}
        </div>
      )}

      {/* Add Beneficiary Button */}
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={handleOpenAdd}
          className="gold-gradient rounded-lg px-4 py-2.5 text-sm font-semibold text-navy-950 transition-all hover:opacity-90 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Beneficiary
        </button>
      </div>

      {/* ── Add / Edit Form Modal ──────────────────────────── */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm"
            onClick={handleCloseForm}
          />

          {/* Modal */}
          <div className="relative w-full max-w-lg rounded-xl bg-navy-800 border border-border-subtle p-6 animate-fade-in max-h-[calc(100dvh-2rem)] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-text-primary">
                {editingId ? "Edit Beneficiary" : "Add New Beneficiary"}
              </h3>
              <button
                type="button"
                onClick={handleCloseForm}
                className="text-text-muted hover:text-text-primary transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Server Error in modal */}
            {serverError && (
              <div className="mb-4 bg-error/10 border border-error/20 rounded-lg px-4 py-3 text-error text-sm flex items-start gap-2">
                <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-error" />
                {serverError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Recipient Name
                </label>
                <input
                  type="text"
                  {...register("name")}
                  placeholder="Full name of the recipient"
                  className="w-full bg-navy-900 border border-border-default rounded-lg px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:border-gold-500 focus:outline-none transition"
                />
                {errors.name && (
                  <p className="text-xs text-error mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Bank Name */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Bank Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                  <input
                    type="text"
                    {...register("bankName")}
                    placeholder="Name of the bank"
                    className="w-full bg-navy-900 border border-border-default rounded-lg pl-10 pr-4 py-3 text-sm text-text-primary placeholder-text-muted focus:border-gold-500 focus:outline-none transition"
                  />
                </div>
                {errors.bankName && (
                  <p className="text-xs text-error mt-1">{errors.bankName.message}</p>
                )}
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Account Number
                </label>
                <input
                  type="text"
                  {...register("accountNumber")}
                  placeholder="Recipient's account number"
                  className="w-full bg-navy-900 border border-border-default rounded-lg px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:border-gold-500 focus:outline-none transition"
                />
                {errors.accountNumber && (
                  <p className="text-xs text-error mt-1">
                    {errors.accountNumber.message}
                  </p>
                )}
              </div>

              {/* Routing Number + SWIFT Code row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Routing Number{" "}
                    <span className="text-text-muted font-normal">(opt.)</span>
                  </label>
                  <input
                    type="text"
                    {...register("routingNumber")}
                    placeholder="e.g. 021000021"
                    className="w-full bg-navy-900 border border-border-default rounded-lg px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:border-gold-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    SWIFT Code{" "}
                    <span className="text-text-muted font-normal">(opt.)</span>
                  </label>
                  <input
                    type="text"
                    {...register("swiftCode")}
                    placeholder="e.g. CHASUS33"
                    className="w-full bg-navy-900 border border-border-default rounded-lg px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:border-gold-500 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Country
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                  <select
                    {...register("country")}
                    className="w-full bg-navy-900 border border-border-default rounded-lg pl-10 pr-4 py-3 text-sm text-text-primary focus:border-gold-500 focus:outline-none appearance-none cursor-pointer"
                  >
                    {Object.entries(countryLabels).map(([code, label]) => (
                      <option key={code} value={code}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 bg-navy-700 border border-border-subtle text-text-primary font-semibold py-3 px-4 rounded-lg hover:bg-navy-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 gold-gradient text-navy-950 font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {editingId ? "Updating..." : "Adding..."}
                    </>
                  ) : editingId ? (
                    "Update Beneficiary"
                  ) : (
                    "Add Beneficiary"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ─────────────────────── */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm"
            onClick={() => setDeletingId(null)}
          />
          <div className="relative w-full max-w-sm rounded-xl bg-navy-800 border border-border-subtle p-6 animate-fade-in text-center max-h-[calc(100dvh-2rem)] overflow-y-auto">
            <div className="mx-auto w-14 h-14 rounded-full bg-error/10 border border-error/20 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-error" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Delete Beneficiary
            </h3>
            <p className="text-sm text-text-muted mb-6">
              Are you sure you want to delete this beneficiary? This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                disabled={isDeleting}
                className="flex-1 bg-navy-700 border border-border-subtle text-text-primary font-semibold py-2.5 px-4 rounded-lg hover:bg-navy-600 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                disabled={isDeleting}
                className="flex-1 bg-error/20 border border-error/30 text-error font-semibold py-2.5 px-4 rounded-lg hover:bg-error/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Beneficiary Cards ──────────────────────────────── */}
      {beneficiaries.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {beneficiaries.map((b) => (
            <div
              key={b.id}
              className="card-shine rounded-xl bg-navy-800 border border-border-subtle p-5 transition-all duration-200 hover:border-gold-500/30 hover:shadow-lg hover:shadow-navy-950/50"
            >
              {/* Top — name + actions */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500/10 border border-gold-500/20">
                    <span className="text-sm font-bold text-gold-500">
                      {b.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary leading-tight">
                      {b.name}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {countryLabels[b.country] || b.country}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(b)}
                    className="p-1.5 rounded-md text-text-muted hover:text-gold-500 hover:bg-navy-700 transition"
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingId(b.id)}
                    className="p-1.5 rounded-md text-text-muted hover:text-error hover:bg-error/10 transition"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 pt-3 border-t border-border-subtle/50">
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-text-muted shrink-0" />
                  <span className="text-xs text-text-secondary truncate">
                    {b.bankName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted font-mono">
                    Acct: {maskAccountNumber(b.accountNumber)}
                  </span>
                </div>
                {b.swiftCode && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-text-muted shrink-0" />
                    <span className="text-xs text-text-secondary">
                      SWIFT: {b.swiftCode}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-navy-800 border border-border-subtle">
          <EmptyState
            icon={Users}
            title="No beneficiaries yet"
            description="Add your first beneficiary to make transfers faster. Saved beneficiaries can be selected during the transfer process."
            action={{ label: "Add Beneficiary", onClick: handleOpenAdd }}
          />
        </div>
      )}
    </div>
  );
}
