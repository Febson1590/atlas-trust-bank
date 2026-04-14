import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function AccountNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-error/10 border border-error/20 mb-4">
        <AlertCircle className="h-6 w-6 text-error" />
      </div>
      <h2 className="text-xl font-bold text-text-primary">
        Account not found
      </h2>
      <p className="text-sm text-text-muted mt-2 text-center max-w-sm">
        This account doesn&apos;t exist or you don&apos;t have access to it.
      </p>
      <Link
        href="/dashboard/accounts"
        className="mt-6 gold-gradient rounded-lg px-6 py-2.5 text-sm font-semibold text-navy-950 transition-all hover:opacity-90"
      >
        Back to Accounts
      </Link>
    </div>
  );
}
