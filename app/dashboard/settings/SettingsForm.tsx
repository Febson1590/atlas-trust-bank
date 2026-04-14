"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  MapPin,
  Mail,
  Calendar,
  ShieldCheck,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Camera,
  Trash2,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";

interface Profile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  kycStatus: string;
  createdAt: string;
}

interface SettingsFormProps {
  profile: Profile;
}

export default function SettingsForm({ profile }: SettingsFormProps) {
  const router = useRouter();

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatarUrl || null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setAvatarError("");

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Image must be under 2MB");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarError("Only JPG, PNG, or WEBP allowed");
      return;
    }

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/user/avatar", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setAvatarError(data.error || "Upload failed");
        return;
      }

      setAvatarUrl(data.data.avatarUrl);
      router.refresh();
    } catch {
      setAvatarError("Something went wrong");
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleAvatarRemove() {
    setAvatarUploading(true);
    setAvatarError("");
    try {
      const res = await fetch("/api/user/avatar", { method: "DELETE" });
      if (res.ok) {
        setAvatarUrl(null);
        router.refresh();
      }
    } catch {
      setAvatarError("Failed to remove photo");
    } finally {
      setAvatarUploading(false);
    }
  }
  const [form, setForm] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone || "",
    address: profile.address || "",
    city: profile.city || "",
    state: profile.state || "",
    country: profile.country || "",
    zipCode: profile.zipCode || "",
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setSuccess("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update profile");
        return;
      }

      setSuccess("Profile updated successfully");
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  }

  const inputClasses =
    "w-full rounded-lg bg-navy-900 border border-border-subtle px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all";

  const labelClasses = "block text-xs font-medium text-text-muted mb-1.5";

  return (
    <div className="space-y-6">
      {/* ── Profile Photo ──────────────────────────────────── */}
      <div className="rounded-xl bg-navy-800 border border-border-subtle overflow-hidden">
        <div className="px-6 py-4 border-b border-border-subtle/50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/10">
              <Camera className="h-4 w-4 text-gold-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Profile Photo</h3>
              <p className="text-xs text-text-muted">JPG, PNG, or WEBP. Max 2MB.</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-5">
            {/* Avatar preview */}
            <div className="relative shrink-0">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Profile"
                  width={72}
                  height={72}
                  className="h-[72px] w-[72px] rounded-full object-cover border-2 border-border-default"
                  unoptimized
                />
              ) : (
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full gold-gradient text-lg font-bold text-navy-950 border-2 border-gold-500/30">
                  {getInitials(profile.firstName, profile.lastName)}
                </div>
              )}
              {avatarUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-navy-950/60">
                  <Loader2 className="h-5 w-5 text-gold-500 animate-spin" />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="rounded-lg bg-navy-700 border border-border-subtle px-4 py-2 text-xs font-medium text-text-primary hover:border-gold-500/30 transition-all disabled:opacity-50"
                >
                  {avatarUrl ? "Change Photo" : "Upload Photo"}
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleAvatarRemove}
                    disabled={avatarUploading}
                    className="rounded-lg border border-error/20 px-3 py-2 text-xs font-medium text-error hover:bg-error/10 transition-all disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              {avatarError && (
                <p className="text-xs text-error">{avatarError}</p>
              )}
            </div>

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* ── Personal Information ───────────────────────────── */}
      <form onSubmit={handleSubmit}>
        <div className="rounded-xl bg-navy-800 border border-border-subtle overflow-hidden">
          <div className="px-6 py-4 border-b border-border-subtle/50">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/10">
                <User className="h-4.5 w-4.5 text-gold-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">
                  Personal Information
                </h3>
                <p className="text-xs text-text-muted">
                  Update your personal details
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Status Messages */}
            {success && (
              <div className="flex items-center gap-2 rounded-lg bg-success/10 border border-success/20 px-4 py-3">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                <p className="text-sm text-success">{success}</p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-error/10 border border-error/20 px-4 py-3">
                <AlertCircle className="h-4 w-4 text-error shrink-0" />
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className={labelClasses}>
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                  minLength={2}
                />
              </div>
              <div>
                <label htmlFor="lastName" className={labelClasses}>
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                  minLength={2}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className={labelClasses}>
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className={cn(inputClasses, "pl-10")}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className={labelClasses}>
                Street Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="123 Main St"
                  className={cn(inputClasses, "pl-10")}
                />
              </div>
            </div>

            {/* City, State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className={labelClasses}>
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="New York"
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="state" className={labelClasses}>
                  State / Province
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="NY"
                  className={inputClasses}
                />
              </div>
            </div>

            {/* Country, Zip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="country" className={labelClasses}>
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  placeholder="United States"
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="zipCode" className={labelClasses}>
                  ZIP / Postal Code
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={form.zipCode}
                  onChange={handleChange}
                  placeholder="10001"
                  className={inputClasses}
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="gold-gradient rounded-lg px-6 py-2.5 text-sm font-semibold text-navy-950 transition-all hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* ── Account Information (Read-Only) ────────────────── */}
      <div className="rounded-xl bg-navy-800 border border-border-subtle overflow-hidden">
        <div className="px-6 py-4 border-b border-border-subtle/50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
              <Mail className="h-4.5 w-4.5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Account Information
              </h3>
              <p className="text-xs text-text-muted">
                These details cannot be changed here
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border-subtle/30">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-text-muted" />
              <span className="text-xs text-text-muted">Email Address</span>
            </div>
            <span className="text-sm font-medium text-text-primary">
              {profile.email}
            </span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border-subtle/30">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-text-muted" />
              <span className="text-xs text-text-muted">Account Opened</span>
            </div>
            <span className="text-sm font-medium text-text-primary">
              {new Date(profile.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-text-muted" />
              <span className="text-xs text-text-muted">KYC Status</span>
            </div>
            <StatusBadge status={profile.kycStatus} />
          </div>
        </div>
      </div>
    </div>
  );
}
