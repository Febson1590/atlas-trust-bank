"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Users,
  User,
} from "lucide-react";

interface UserOption {
  id: string;
  name: string;
  email: string;
}

const NOTIFICATION_TYPES = [
  { value: "SYSTEM", label: "System" },
  { value: "SECURITY", label: "Security" },
  { value: "KYC", label: "KYC" },
  { value: "TRANSFER", label: "Transfer" },
  { value: "ACCOUNT", label: "Account" },
] as const;

export default function NotificationForm({ users }: { users: UserOption[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    target: "single" as "single" | "broadcast",
    userId: "",
    title: "",
    message: "",
    type: "SYSTEM",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        message: form.message,
        type: form.type,
      };

      if (form.target === "broadcast") {
        payload.userIds = "all";
      } else {
        payload.userId = form.userId;
      }

      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to send notification");
        return;
      }

      const count = data.data.sent;
      setSuccess(`Notification sent to ${count} user${count !== 1 ? "s" : ""}`);
      setForm({ target: "single", userId: "", title: "", message: "", type: "SYSTEM" });
      router.refresh();
    } catch {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass glass-border rounded-xl p-6 space-y-5">
      <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
        <Send className="h-4 w-4 text-gold-500" />
        Send Notification
      </h2>

      {/* Target Toggle */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Recipient</label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setForm({ ...form, target: "single", userId: "" })}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              form.target === "single"
                ? "gold-gradient text-navy-950"
                : "bg-navy-900/50 border border-border-default text-text-secondary hover:text-text-primary"
            }`}
          >
            <User className="h-4 w-4" />
            Single User
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, target: "broadcast" })}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              form.target === "broadcast"
                ? "gold-gradient text-navy-950"
                : "bg-navy-900/50 border border-border-default text-text-secondary hover:text-text-primary"
            }`}
          >
            <Users className="h-4 w-4" />
            Broadcast All
          </button>
        </div>
      </div>

      {/* User Select (single only) */}
      {form.target === "single" && (
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Select User</label>
          <select
            value={form.userId}
            onChange={(e) => setForm({ ...form, userId: e.target.value })}
            required
            className="w-full bg-navy-900/50 border border-border-default rounded-lg py-2.5 px-3 text-sm text-text-primary focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
          >
            <option value="">Choose a user...</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Notification Type */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Type</label>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full bg-navy-900/50 border border-border-default rounded-lg py-2.5 px-3 text-sm text-text-primary focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
        >
          {NOTIFICATION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
          placeholder="Notification title..."
          className="w-full bg-navy-900/50 border border-border-default rounded-lg py-2.5 px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
        />
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Message</label>
        <textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          required
          rows={4}
          placeholder="Notification message..."
          className="w-full bg-navy-900/50 border border-border-default rounded-lg py-2.5 px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 resize-none"
        />
      </div>

      {/* Feedback */}
      {error && (
        <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm flex items-center gap-2">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full gold-gradient rounded-lg py-2.5 text-sm font-semibold text-navy-950 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            {form.target === "broadcast" ? "Broadcast to All Users" : "Send Notification"}
          </>
        )}
      </button>
    </form>
  );
}
