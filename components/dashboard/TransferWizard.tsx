"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Send,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Copy,
  Users,
  UserPlus,
  Wallet,
  Building2,
  CheckCircle2,
  Globe,
  Info,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { transferSchema, type TransferInput } from "@/lib/validations";
import { cn, formatCurrency, maskAccountNumber } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────

interface Account {
  id: string;
  accountNumber: string;
  label: string;
  balance: number;
  currency: string;
  type: string;
}

interface Beneficiary {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string | null;
  swiftCode: string | null;
  country: string;
}

interface TransferResult {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  recipientName: string | null;
  recipientBank: string | null;
  recipientAcct: string | null;
  description: string | null;
  createdAt: string;
}

interface TransferWizardProps {
  accounts: Account[];
  beneficiaries: Beneficiary[];
  hasTransferPin: boolean;
}

// ─── Constants ──────────────────────────────────────────────

const STEPS = [
  { label: "Details", icon: Send },
  { label: "Review", icon: ShieldCheck },
  { label: "Confirm", icon: ShieldCheck },
  { label: "Processing", icon: Loader2 },
  { label: "Complete", icon: CheckCircle2 },
];

const HIGH_RISK_AMOUNT = 10000;

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

// ─── Bank database with region metadata ─────────────────────

interface BankEntry {
  name: string;
  aliases?: string[];
  region: string;
  country: string;
  flag: string;
  acctLabel: string;
  acctPlaceholder: string;
  acctHint?: string;
  requireRouting?: boolean;
  routingLabel?: string;
  routingPlaceholder?: string;
  requireSwift?: boolean;
  requireSortCode?: boolean;
  sortCodePlaceholder?: string;
  helperText: string;
}

// Helper to create US bank entries
const usBank = (name: string, aliases?: string[]): BankEntry => ({ name, aliases, region: "US", country: "United States", flag: "🇺🇸", acctLabel: "Account Number", acctPlaceholder: "Enter account number", requireRouting: true, routingLabel: "Routing Number (ABA)", routingPlaceholder: "9 digits", helperText: "Requires account number and routing number" });
const ukBank = (name: string, aliases?: string[]): BankEntry => ({ name, aliases, region: "GB", country: "United Kingdom", flag: "🇬🇧", acctLabel: "Account Number", acctPlaceholder: "8-digit account number", requireSortCode: true, sortCodePlaceholder: "e.g. 20-00-00", requireSwift: true, helperText: "Requires account number, sort code, and SWIFT" });
const euBank = (name: string, country: string, flag: string, aliases?: string[]): BankEntry => ({ name, aliases, region: "EU", country, flag, acctLabel: "IBAN", acctPlaceholder: "Enter IBAN", acctHint: "IBAN is required for SEPA transfers", requireSwift: true, helperText: "Requires IBAN and SWIFT/BIC code" });
const swiftBank = (name: string, country: string, flag: string, region: string, aliases?: string[]): BankEntry => ({ name, aliases, region, country, flag, acctLabel: "Account Number", acctPlaceholder: "Enter account number", requireSwift: true, helperText: "Requires account number and SWIFT/BIC code" });
const ibanBank = (name: string, country: string, flag: string, region: string, aliases?: string[]): BankEntry => ({ name, aliases, region, country, flag, acctLabel: "IBAN", acctPlaceholder: "Enter IBAN", requireSwift: true, helperText: "Requires IBAN and SWIFT/BIC code" });

const BANK_DB: BankEntry[] = [
  // ── North America ──
  usBank("JPMorgan Chase", ["Chase", "JP Morgan"]),
  usBank("Bank of America", ["BofA", "BOA"]),
  usBank("Wells Fargo"),
  usBank("Citibank", ["Citi"]),
  usBank("Capital One"),
  usBank("Goldman Sachs", ["GS"]),
  usBank("Morgan Stanley"),
  usBank("US Bank", ["USB"]),
  usBank("PNC Bank", ["PNC"]),
  usBank("Charles Schwab", ["Schwab"]),
  { name: "Royal Bank of Canada", aliases: ["RBC"], region: "CA", country: "Canada", flag: "🇨🇦", acctLabel: "Account Number", acctPlaceholder: "Enter account number", requireRouting: true, routingLabel: "Transit / Institution Number", routingPlaceholder: "e.g. 12345-003", requireSwift: true, helperText: "Requires account, transit number, and SWIFT" },
  { name: "TD Bank", aliases: ["Toronto-Dominion"], region: "CA", country: "Canada", flag: "🇨🇦", acctLabel: "Account Number", acctPlaceholder: "Enter account number", requireRouting: true, routingLabel: "Transit / Institution Number", routingPlaceholder: "e.g. 12345-004", requireSwift: true, helperText: "Requires account, transit number, and SWIFT" },
  { name: "Scotiabank", aliases: ["Bank of Nova Scotia"], region: "CA", country: "Canada", flag: "🇨🇦", acctLabel: "Account Number", acctPlaceholder: "Enter account number", requireRouting: true, routingLabel: "Transit / Institution Number", routingPlaceholder: "e.g. 12345-002", requireSwift: true, helperText: "Requires account, transit number, and SWIFT" },
  // ── United Kingdom ──
  ukBank("Barclays"),
  ukBank("HSBC UK", ["HSBC"]),
  ukBank("Lloyds Bank", ["Lloyds"]),
  ukBank("NatWest"),
  ukBank("Monzo"),
  ukBank("Revolut UK", ["Revolut"]),
  ukBank("Standard Chartered", ["StanChart"]),
  // ── Europe ──
  euBank("Deutsche Bank", "Germany", "🇩🇪"),
  euBank("Commerzbank", "Germany", "🇩🇪"),
  euBank("BNP Paribas", "France", "🇫🇷", ["BNP"]),
  euBank("Société Générale", "France", "🇫🇷", ["SocGen"]),
  euBank("Crédit Agricole", "France", "🇫🇷"),
  euBank("ING Group", "Netherlands", "🇳🇱", ["ING"]),
  euBank("ABN AMRO", "Netherlands", "🇳🇱"),
  euBank("Rabobank", "Netherlands", "🇳🇱"),
  euBank("Santander", "Spain", "🇪🇸"),
  euBank("BBVA", "Spain", "🇪🇸"),
  euBank("CaixaBank", "Spain", "🇪🇸"),
  euBank("UniCredit", "Italy", "🇮🇹"),
  euBank("Intesa Sanpaolo", "Italy", "🇮🇹"),
  euBank("UBS", "Switzerland", "🇨🇭"),
  euBank("Credit Suisse", "Switzerland", "🇨🇭"),
  euBank("Nordea", "Sweden", "🇸🇪"),
  euBank("Danske Bank", "Denmark", "🇩🇰"),
  euBank("KBC Group", "Belgium", "🇧🇪", ["KBC"]),
  // ── China ──
  swiftBank("Industrial and Commercial Bank of China", "China", "🇨🇳", "CN", ["ICBC"]),
  swiftBank("China Construction Bank", "China", "🇨🇳", "CN", ["CCB"]),
  swiftBank("Agricultural Bank of China", "China", "🇨🇳", "CN", ["ABC"]),
  swiftBank("Bank of China", "China", "🇨🇳", "CN", ["BOC"]),
  swiftBank("Bank of Communications", "China", "🇨🇳", "CN", ["BoCom"]),
  // ── India ──
  swiftBank("State Bank of India", "India", "🇮🇳", "IN", ["SBI"]),
  swiftBank("HDFC Bank", "India", "🇮🇳", "IN", ["HDFC"]),
  swiftBank("ICICI Bank", "India", "🇮🇳", "IN", ["ICICI"]),
  swiftBank("Axis Bank", "India", "🇮🇳", "IN"),
  swiftBank("Kotak Mahindra Bank", "India", "🇮🇳", "IN", ["Kotak"]),
  // ── Japan ──
  swiftBank("Mitsubishi UFJ Financial Group", "Japan", "🇯🇵", "JP", ["MUFG", "Mitsubishi UFJ"]),
  swiftBank("Sumitomo Mitsui Banking", "Japan", "🇯🇵", "JP", ["SMBC"]),
  swiftBank("Mizuho Bank", "Japan", "🇯🇵", "JP", ["Mizuho"]),
  // ── Singapore / Southeast Asia ──
  swiftBank("DBS Bank", "Singapore", "🇸🇬", "SG", ["DBS"]),
  swiftBank("OCBC Bank", "Singapore", "🇸🇬", "SG", ["OCBC"]),
  swiftBank("United Overseas Bank", "Singapore", "🇸🇬", "SG", ["UOB"]),
  swiftBank("Bangkok Bank", "Thailand", "🇹🇭", "TH"),
  swiftBank("BDO Unibank", "Philippines", "🇵🇭", "PH", ["BDO"]),
  swiftBank("Maybank", "Malaysia", "🇲🇾", "MY"),
  // ── Middle East ──
  ibanBank("Emirates NBD", "UAE", "🇦🇪", "AE", ["ENBD"]),
  ibanBank("Abu Dhabi Commercial Bank", "UAE", "🇦🇪", "AE", ["ADCB"]),
  ibanBank("Saudi National Bank", "Saudi Arabia", "🇸🇦", "SA", ["SNB"]),
  ibanBank("Al Rajhi Bank", "Saudi Arabia", "🇸🇦", "SA"),
  ibanBank("Qatar National Bank", "Qatar", "🇶🇦", "QA", ["QNB"]),
  // ── Africa ──
  swiftBank("Standard Bank", "South Africa", "🇿🇦", "ZA"),
  swiftBank("FirstRand Bank", "South Africa", "🇿🇦", "ZA", ["FNB"]),
  swiftBank("Nedbank", "South Africa", "🇿🇦", "ZA"),
  swiftBank("First Bank of Nigeria", "Nigeria", "🇳🇬", "NG", ["FirstBank"]),
  swiftBank("GTBank", "Nigeria", "🇳🇬", "NG", ["Guaranty Trust"]),
  swiftBank("Zenith Bank", "Nigeria", "🇳🇬", "NG"),
  swiftBank("Access Bank", "Nigeria", "🇳🇬", "NG"),
  swiftBank("United Bank for Africa", "Nigeria", "🇳🇬", "NG", ["UBA"]),
  swiftBank("Ecobank", "Pan-Africa", "🌍", "AF"),
  swiftBank("KCB Bank", "Kenya", "🇰🇪", "KE", ["Kenya Commercial Bank"]),
  swiftBank("Equity Bank", "Kenya", "🇰🇪", "KE"),
  // ── South America ──
  swiftBank("Itaú Unibanco", "Brazil", "🇧🇷", "BR", ["Itau"]),
  swiftBank("Banco do Brasil", "Brazil", "🇧🇷", "BR", ["BB"]),
  swiftBank("Bradesco", "Brazil", "🇧🇷", "BR"),
  swiftBank("Banco de Chile", "Chile", "🇨🇱", "CL"),
  swiftBank("Bancolombia", "Colombia", "🇨🇴", "CO"),
  swiftBank("Banco de la Nación Argentina", "Argentina", "🇦🇷", "AR"),
  // ── Australia / NZ ──
  { name: "Commonwealth Bank", aliases: ["CommBank", "CBA"], region: "AU", country: "Australia", flag: "🇦🇺", acctLabel: "Account Number", acctPlaceholder: "Enter account number", requireRouting: true, routingLabel: "BSB Number", routingPlaceholder: "6 digits (e.g. 062-000)", requireSwift: true, helperText: "Requires account number, BSB, and SWIFT" },
  { name: "ANZ Bank", aliases: ["ANZ"], region: "AU", country: "Australia", flag: "🇦🇺", acctLabel: "Account Number", acctPlaceholder: "Enter account number", requireRouting: true, routingLabel: "BSB Number", routingPlaceholder: "6 digits", requireSwift: true, helperText: "Requires account number, BSB, and SWIFT" },
  { name: "Westpac", region: "AU", country: "Australia", flag: "🇦🇺", acctLabel: "Account Number", acctPlaceholder: "Enter account number", requireRouting: true, routingLabel: "BSB Number", routingPlaceholder: "6 digits", requireSwift: true, helperText: "Requires account number, BSB, and SWIFT" },
  { name: "National Australia Bank", aliases: ["NAB"], region: "AU", country: "Australia", flag: "🇦🇺", acctLabel: "Account Number", acctPlaceholder: "Enter account number", requireRouting: true, routingLabel: "BSB Number", routingPlaceholder: "6 digits", requireSwift: true, helperText: "Requires account number, BSB, and SWIFT" },
];

// Fallback for banks not in the list
const DEFAULT_BANK_CONFIG: Omit<BankEntry, "name" | "region" | "country" | "flag" | "helperText" | "aliases"> = {
  acctLabel: "Account Number / IBAN",
  acctPlaceholder: "Enter account number or IBAN",
  requireSwift: true,
};

// ─── Component ──────────────────────────────────────────────

export default function TransferWizard({
  accounts,
  beneficiaries,
  hasTransferPin,
}: TransferWizardProps) {
  const router = useRouter();

  // Step state
  const [currentStep, setCurrentStep] = useState(0);
  const [recipientMode, setRecipientMode] = useState<"beneficiary" | "new">(
    beneficiaries.length > 0 ? "beneficiary" : "new"
  );
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<string>("");

  // Bank autocomplete state
  const [selectedBank, setSelectedBank] = useState<BankEntry | null>(null);
  const [bankSearch, setBankSearch] = useState("");
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
  const bankInputRef = useRef<HTMLInputElement | null>(null);
  const bankDropdownRef = useRef<HTMLDivElement | null>(null);

  // Derived: selected country from bank
  const selectedCountry = selectedBank?.region || "OTHER";

  // Filter banks for autocomplete (matches name, aliases, and country)
  const filteredBanks = bankSearch.length >= 1
    ? BANK_DB.filter((b) => {
        const q = bankSearch.toLowerCase();
        return (
          b.name.toLowerCase().includes(q) ||
          b.country.toLowerCase().includes(q) ||
          b.aliases?.some((a) => a.toLowerCase().includes(q))
        );
      }).slice(0, 12)
    : [];

  // Transfer result
  const [transferResult, setTransferResult] = useState<TransferResult | null>(null);

  // API states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [dormantError, setDormantError] = useState<{ message: string } | null>(null);

  // PIN + OTP state
  const [pin, setPin] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [needsOtp, setNeedsOtp] = useState(false);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [pinShake, setPinShake] = useState(false);
  const [otpShake, setOtpShake] = useState(false);
  const pinInputRef = useRef<HTMLInputElement | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Copy state
  const [copied, setCopied] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransferInput>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromAccountId: accounts[0]?.id || "",
      recipientName: "",
      recipientBank: "",
      recipientAcct: "",
      recipientCountry: "US",
      routingNumber: "",
      swiftCode: "",
      sortCode: "",
      amount: undefined,
      description: "",
    },
  });

  const watchAll = watch();
  const selectedAccountId = watch("fromAccountId");
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  // ── Cooldown timer ─────────────────────────────────────────
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // ── Auto-focus PIN input when entering step 2 ─────────────
  useEffect(() => {
    if (currentStep === 2 && !needsOtp) {
      // Retry focus multiple times for mobile reliability
      const attempts = [50, 150, 400];
      attempts.forEach((delay) => {
        setTimeout(() => pinInputRef.current?.focus(), delay);
      });
    }
  }, [currentStep, needsOtp]);

  // ── Close bank dropdown on outside click ───────────────────
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bankDropdownRef.current && !bankDropdownRef.current.contains(e.target as Node)) {
        setBankDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── Auto-fill from beneficiary ─────────────────────────────
  useEffect(() => {
    if (recipientMode === "beneficiary" && selectedBeneficiary) {
      const b = beneficiaries.find((b) => b.id === selectedBeneficiary);
      if (b) {
        setValue("recipientName", b.name);
        setValue("recipientBank", b.bankName);
        setValue("recipientAcct", b.accountNumber);
      }
    }
  }, [selectedBeneficiary, recipientMode, beneficiaries, setValue]);

  // ── OTP Input Handlers ─────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!text) return;
    const newOtp = [...otp];
    for (let i = 0; i < text.length; i++) {
      newOtp[i] = text[i];
    }
    setOtp(newOtp);
    const focusIndex = Math.min(text.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  // ── Build transfer payload ──────────────────────────────────
  const buildTransferPayload = useCallback(() => {
    const payload: Record<string, unknown> = {
      fromAccountId: watchAll.fromAccountId,
      recipientName: watchAll.recipientName,
      recipientBank: watchAll.recipientBank,
      recipientAcct: watchAll.recipientAcct,
      recipientCountry: selectedCountry,
      routingNumber: watchAll.routingNumber || undefined,
      swiftCode: watchAll.swiftCode || undefined,
      sortCode: watchAll.sortCode || undefined,
      amount: watchAll.amount,
      description: watchAll.description || undefined,
    };
    if (recipientMode === "beneficiary" && selectedBeneficiary) {
      payload.beneficiaryId = selectedBeneficiary;
    }
    return payload;
  }, [watchAll, selectedCountry, recipientMode, selectedBeneficiary]);

  // ── Submit transfer with PIN (+ OTP if high-risk) ──────────
  const MAX_OTP_ATTEMPTS = 5;

  const submitTransfer = useCallback(
    async (pinCode: string, otpCode?: string) => {
      setServerError("");
      setIsVerifying(true);

      try {
        const res = await fetch("/api/transfers/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pin: pinCode,
            otpCode,
            transferData: buildTransferPayload(),
          }),
        });

        const result = await res.json();

        if (!res.ok) {
          // Dormant / blocked account. We intentionally show a realistic
          // 3.5s "processing" animation BEFORE revealing the failure —
          // product feedback: an immediate "this transfer can't go
          // through" feels suspicious and makes users think our system
          // pre-flags their account. A short pretend-to-process delay
          // makes it feel like the bank actually tried and then ran
          // into the issue, which is gentler UX.
          if (result.error === "ACCOUNT_DORMANT") {
            const pendingMessage =
              result.data?.message ||
              "This account is currently unavailable. Please contact our support team.";
            setCurrentStep(5); // enters processing state (dormantError is still null)
            setIsVerifying(false);
            // Reveal the actual failure copy after ~3.5s. We don't clear
            // the step afterwards because the same step 5 also renders
            // the failure UI once `dormantError` becomes non-null.
            window.setTimeout(() => {
              setDormantError({ message: pendingMessage });
            }, 3500);
            return;
          }

          // High-risk: OTP required
          if (result.error === "OTP_REQUIRED") {
            setNeedsOtp(true);
            setIsVerifying(false);
            setIsSendingOtp(true);
            const otpRes = await fetch("/api/transfers/send-otp", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            });
            setIsSendingOtp(false);
            if (otpRes.ok) {
              setOtpSent(true);
              setCooldown(RESEND_COOLDOWN);
              setTimeout(() => inputRefs.current[0]?.focus(), 100);
            }
            return;
          }

          // PIN error — shake and clear
          if (result.error?.toLowerCase().includes("pin")) {
            setPinShake(true);
            setTimeout(() => setPinShake(false), 600);
            setPin("");
            setTimeout(() => pinInputRef.current?.focus(), 100);
          }

          // OTP error — shake, increment attempts, clear
          if (otpCode) {
            setOtpShake(true);
            setTimeout(() => setOtpShake(false), 600);
            setOtpAttempts((prev) => prev + 1);
            setOtp(Array(OTP_LENGTH).fill(""));
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
          }

          setServerError(result.error || "Transfer failed");
          setIsVerifying(false);
          return;
        }

        // Success — the API has already confirmed the transfer, so there's
        // no point in faking a 2-second "Processing..." screen. Drop straight
        // to the completion step. If the backend actually takes a while to
        // respond, the user sees the submit button's own loading state.
        setTransferResult(result.data);
        setCurrentStep(4);
      } catch {
        setServerError("Something went wrong. Please try again.");
        setIsVerifying(false);
      }
    },
    [buildTransferPayload]
  );

  // Auto-submit OTP for high-risk transfers
  useEffect(() => {
    const code = otp.join("");
    if (code.length === OTP_LENGTH && !isVerifying && needsOtp && pin) {
      submitTransfer(pin, code);
    }
  }, [otp, isVerifying, needsOtp, pin, submitTransfer]);

  // ── Step Handlers ──────────────────────────────────────────

  const handleDetailsSubmit = handleSubmit(() => {
    setServerError("");
    setCurrentStep(1);
  });

  // Review step: go to PIN entry
  const handleProceedToConfirm = () => {
    setServerError("");
    setCurrentStep(2);
  };

  // PIN submit handler
  const handlePinSubmit = () => {
    if (pin.length < 4) {
      setServerError("Enter your 4–6 digit transfer PIN");
      return;
    }
    submitTransfer(pin);
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || isSendingOtp) return;
    setIsSendingOtp(true);
    setServerError("");

    try {
      const res = await fetch("/api/transfers/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const result = await res.json();
        setServerError(result.error || "Failed to resend code");
      } else {
        setCooldown(RESEND_COOLDOWN);
        setOtp(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleCopyReference = () => {
    if (transferResult?.reference) {
      navigator.clipboard.writeText(transferResult.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ─── Render ───────────────────────────────────────────────

  // Hide the step indicator on the dedicated failure screen (step 5) —
  // the failure card has its own layout and the step bar would render
  // nonsense (5 dots all marked "complete" with no active step).
  const showStepIndicator = currentStep !== 5;

  return (
    <div className="max-w-2xl mx-auto">
      {/* ── Progress Steps ──────────────────────────────────── */}
      {showStepIndicator && (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const StepIcon = step.icon;

            return (
              <div key={step.label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                      isCompleted
                        ? "bg-gold-500 border-gold-500 text-navy-950"
                        : isActive
                        ? "border-gold-500 bg-gold-500/10 text-gold-500"
                        : "border-border-subtle bg-navy-800 text-text-muted"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <StepIcon
                        className={cn(
                          "h-4 w-4",
                          isActive && index === 3 && "animate-spin"
                        )}
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs mt-1.5 font-medium hidden sm:block",
                      isActive
                        ? "text-gold-500"
                        : isCompleted
                        ? "text-text-primary"
                        : "text-text-muted"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 w-8 sm:w-16 lg:w-24 mx-1 sm:mx-2 transition-all duration-300",
                      index < currentStep
                        ? "bg-gold-500"
                        : "bg-border-subtle"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* ── Server Error ────────────────────────────────────── */}
      {serverError && (
        <div className="mb-6 bg-error/10 border border-error/20 rounded-lg px-4 py-3 text-error text-sm flex items-start gap-2">
          <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-error" />
          {serverError}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          STEP 1 — Enter Details
          ═══════════════════════════════════════════════════════ */}
      {currentStep === 0 && (
        <form onSubmit={handleDetailsSubmit} className="space-y-6">
          <div className="rounded-xl bg-navy-800 border border-border-subtle p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-5">
              Transfer Details
            </h3>

            {/* Source Account */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                From Account
              </label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                <select
                  {...register("fromAccountId")}
                  className="w-full bg-navy-900 border border-border-default rounded-lg pl-10 pr-4 py-3 text-sm text-text-primary focus:border-gold-500 focus:outline-none appearance-none cursor-pointer"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.label} ({maskAccountNumber(acc.accountNumber)}) —{" "}
                      {formatCurrency(acc.balance, acc.currency)}
                    </option>
                  ))}
                </select>
              </div>
              {selectedAccount && (
                <p className="text-xs text-text-muted mt-1">
                  Available: {formatCurrency(selectedAccount.balance, selectedAccount.currency)}
                </p>
              )}
              {errors.fromAccountId && (
                <p className="text-xs text-error mt-1">{errors.fromAccountId.message}</p>
              )}
            </div>

            {/* Recipient Mode Toggle */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Recipient
              </label>
              <div className="flex rounded-lg bg-navy-900 border border-border-default p-1">
                <button
                  type="button"
                  onClick={() => {
                    setRecipientMode("beneficiary");
                    if (!selectedBeneficiary && beneficiaries.length > 0) {
                      setSelectedBeneficiary(beneficiaries[0].id);
                    }
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all",
                    recipientMode === "beneficiary"
                      ? "bg-navy-700 text-gold-500 border border-gold-500/30"
                      : "text-text-muted hover:text-text-secondary"
                  )}
                >
                  <Users className="h-4 w-4" />
                  Saved Beneficiary
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRecipientMode("new");
                    setSelectedBeneficiary("");
                    setValue("recipientName", "");
                    setValue("recipientBank", "");
                    setValue("recipientAcct", "");
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all",
                    recipientMode === "new"
                      ? "bg-navy-700 text-gold-500 border border-gold-500/30"
                      : "text-text-muted hover:text-text-secondary"
                  )}
                >
                  <UserPlus className="h-4 w-4" />
                  New Recipient
                </button>
              </div>
            </div>

            {/* Beneficiary Select */}
            {recipientMode === "beneficiary" && (
              <div className="mb-5">
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Select Beneficiary
                </label>
                {beneficiaries.length > 0 ? (
                  <select
                    value={selectedBeneficiary}
                    onChange={(e) => setSelectedBeneficiary(e.target.value)}
                    className="w-full bg-navy-900 border border-border-default rounded-lg px-4 py-3 text-sm text-text-primary focus:border-gold-500 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Select a beneficiary...</option>
                    {beneficiaries.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} — {b.bankName} ({maskAccountNumber(b.accountNumber)})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-text-muted bg-navy-900 rounded-lg px-4 py-3 border border-border-default">
                    No saved beneficiaries. Switch to &ldquo;New Recipient&rdquo; or add
                    beneficiaries from the Beneficiaries page.
                  </p>
                )}
              </div>
            )}

            {/* Recipient Fields */}
            {(recipientMode === "new" || selectedBeneficiary) && (() => {
              const isBeneficiary = recipientMode === "beneficiary";
              const bankConfig = selectedBank || DEFAULT_BANK_CONFIG;
              const inputCls = (readOnly: boolean) => cn(
                "w-full bg-navy-900 border border-border-default rounded-lg px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:border-gold-500 focus:outline-none transition",
                readOnly && "opacity-70 cursor-not-allowed"
              );

              return (
                <div className="space-y-4 mb-5">
                  {/* Recipient Name */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      {...register("recipientName")}
                      readOnly={isBeneficiary}
                      placeholder="Full name as shown on their account"
                      className={inputCls(isBeneficiary)}
                    />
                    {errors.recipientName && (
                      <p className="text-xs text-error mt-1">{errors.recipientName.message}</p>
                    )}
                  </div>

                  {/* Bank Autocomplete (new recipients only) */}
                  {!isBeneficiary ? (
                    <div ref={bankDropdownRef} className="relative">
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">
                        Bank
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                        <input
                          ref={bankInputRef}
                          type="text"
                          value={bankSearch}
                          onChange={(e) => {
                            setBankSearch(e.target.value);
                            setBankDropdownOpen(true);
                            if (!e.target.value) {
                              setSelectedBank(null);
                              setValue("recipientBank", "");
                              setValue("recipientCountry", "");
                              setValue("routingNumber", "");
                              setValue("swiftCode", "");
                              setValue("sortCode", "");
                            }
                          }}
                          onFocus={() => { if (bankSearch) setBankDropdownOpen(true); }}
                          placeholder="Search for a bank..."
                          className="w-full bg-navy-900 border border-border-default rounded-lg pl-10 pr-4 py-3 text-sm text-text-primary placeholder-text-muted focus:border-gold-500 focus:outline-none transition"
                          autoComplete="off"
                        />
                        {selectedBank && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                            {selectedBank.flag}
                          </span>
                        )}
                      </div>

                      {/* Dropdown */}
                      {bankDropdownOpen && filteredBanks.length > 0 && (
                        <div className="absolute z-30 mt-1 w-full rounded-lg bg-navy-900 border border-border-default shadow-xl shadow-navy-950/60 max-h-56 overflow-y-auto">
                          {filteredBanks.map((bank) => (
                            <button
                              key={bank.name + bank.region}
                              type="button"
                              onClick={() => {
                                setSelectedBank(bank);
                                setBankSearch(bank.name);
                                setBankDropdownOpen(false);
                                setValue("recipientBank", bank.name);
                                setValue("recipientCountry", bank.region);
                                setValue("routingNumber", "");
                                setValue("swiftCode", "");
                                setValue("sortCode", "");
                              }}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-navy-800 transition-colors"
                            >
                              <span className="text-base shrink-0">{bank.flag}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-text-primary truncate">{bank.name}</p>
                                <p className="text-[10px] text-text-muted">{bank.country}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* No results hint */}
                      {bankDropdownOpen && bankSearch.length >= 2 && filteredBanks.length === 0 && (
                        <div className="absolute z-30 mt-1 w-full rounded-lg bg-navy-900 border border-border-default shadow-xl shadow-navy-950/60 px-4 py-3">
                          <p className="text-xs text-text-muted">No banks found. You can type the bank name manually.</p>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBank(null);
                              setValue("recipientBank", bankSearch);
                              setBankDropdownOpen(false);
                            }}
                            className="mt-1.5 text-xs text-gold-500 hover:text-gold-400 transition-colors"
                          >
                            Use &ldquo;{bankSearch}&rdquo; as bank name →
                          </button>
                        </div>
                      )}

                      {errors.recipientBank && (
                        <p className="text-xs text-error mt-1">{errors.recipientBank.message}</p>
                      )}

                      {/* Bank helper message */}
                      {selectedBank && (
                        <div className="flex items-center gap-1.5 mt-2 rounded-lg bg-gold-500/5 border border-gold-500/15 px-3 py-2">
                          <Info className="h-3 w-3 text-gold-400 shrink-0" />
                          <p className="text-xs text-gold-400">{selectedBank.helperText}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Beneficiary bank (read-only) */
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">Bank</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                        <input
                          type="text"
                          {...register("recipientBank")}
                          readOnly
                          className="w-full bg-navy-900 border border-border-default rounded-lg pl-10 pr-4 py-3 text-sm text-text-primary opacity-70 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  )}

                  {/* Account Number / IBAN */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                      {isBeneficiary ? "Account Number" : bankConfig.acctLabel}
                    </label>
                    <input
                      type="text"
                      {...register("recipientAcct")}
                      readOnly={isBeneficiary}
                      placeholder={isBeneficiary ? "Account number" : bankConfig.acctPlaceholder}
                      className={inputCls(isBeneficiary)}
                    />
                    {!isBeneficiary && bankConfig.acctHint && (
                      <p className="flex items-center gap-1 text-xs text-gold-400/80 mt-1">
                        <Info className="h-3 w-3" />
                        {bankConfig.acctHint}
                      </p>
                    )}
                    {errors.recipientAcct && (
                      <p className="text-xs text-error mt-1">{errors.recipientAcct.message}</p>
                    )}
                  </div>

                  {/* Routing Number */}
                  {!isBeneficiary && bankConfig.requireRouting && (
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">
                        {bankConfig.routingLabel || "Routing Number"}
                      </label>
                      <input
                        type="text"
                        {...register("routingNumber")}
                        placeholder={bankConfig.routingPlaceholder || "Routing number"}
                        className={inputCls(false)}
                      />
                    </div>
                  )}

                  {/* Sort Code */}
                  {!isBeneficiary && bankConfig.requireSortCode && (
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">
                        Sort Code
                      </label>
                      <input
                        type="text"
                        {...register("sortCode")}
                        placeholder={bankConfig.sortCodePlaceholder || "Sort code"}
                        className={inputCls(false)}
                      />
                    </div>
                  )}

                  {/* SWIFT/BIC */}
                  {!isBeneficiary && bankConfig.requireSwift && (
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">
                        SWIFT / BIC Code
                      </label>
                      <input
                        type="text"
                        {...register("swiftCode")}
                        placeholder="e.g. CHASUS33"
                        className={inputCls(false)}
                      />
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Amount */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-text-muted pointer-events-none">
                  {selectedAccount?.currency === "EUR"
                    ? "\u20AC"
                    : selectedAccount?.currency === "GBP"
                    ? "\u00A3"
                    : "$"}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...register("amount", { valueAsNumber: true })}
                  placeholder="0.00"
                  className="w-full bg-navy-900 border border-border-default rounded-lg pl-8 pr-16 py-3 text-sm text-text-primary placeholder-text-muted focus:border-gold-500 focus:outline-none transition"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-text-muted">
                  {selectedAccount?.currency || "USD"}
                </span>
              </div>
              {errors.amount && (
                <p className="text-xs text-error mt-1">{errors.amount.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Description{" "}
                <span className="text-text-muted font-normal">(optional)</span>
              </label>
              <input
                type="text"
                {...register("description")}
                placeholder="What is this transfer for?"
                className="w-full bg-navy-900 border border-border-default rounded-lg px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:border-gold-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Continue Button */}
          <button
            type="submit"
            className="w-full gold-gradient text-navy-950 font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════
          STEP 2 — Review
          ═══════════════════════════════════════════════════════ */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="rounded-xl bg-navy-800 border border-border-subtle p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-5">
              Review Transfer
            </h3>

            <div className="space-y-4">
              {/* From Account */}
              <div className="flex items-center justify-between py-3 border-b border-border-subtle/50">
                <span className="text-sm text-text-muted">From Account</span>
                <span className="text-sm font-medium text-text-primary text-right">
                  {selectedAccount?.label}
                  <br />
                  <span className="text-xs text-text-muted">
                    {selectedAccount && maskAccountNumber(selectedAccount.accountNumber)}
                  </span>
                </span>
              </div>

              {/* Recipient */}
              <div className="flex items-center justify-between py-3 border-b border-border-subtle/50">
                <span className="text-sm text-text-muted">Recipient</span>
                <span className="text-sm font-medium text-text-primary text-right">
                  {watchAll.recipientName}
                  <br />
                  <span className="text-xs text-text-muted">
                    {watchAll.recipientBank}
                  </span>
                </span>
              </div>

              {/* Bank with region */}
              {selectedBank && (
                <div className="flex items-center justify-between py-3 border-b border-border-subtle/50">
                  <span className="text-sm text-text-muted">Bank</span>
                  <span className="text-sm font-medium text-text-primary text-right">
                    {selectedBank.flag} {watchAll.recipientBank}
                  </span>
                </div>
              )}

              {/* Account / IBAN */}
              <div className="flex items-center justify-between py-3 border-b border-border-subtle/50">
                <span className="text-sm text-text-muted">
                  {selectedBank?.acctLabel || "Account Number"}
                </span>
                <span className="text-sm font-medium text-text-primary font-mono text-right max-w-[180px] truncate">
                  {watchAll.recipientAcct}
                </span>
              </div>

              {/* Routing / Sort Code / SWIFT */}
              {watchAll.routingNumber && (
                <div className="flex items-center justify-between py-3 border-b border-border-subtle/50">
                  <span className="text-sm text-text-muted">
                    {selectedBank?.routingLabel || "Routing Number"}
                  </span>
                  <span className="text-sm font-medium text-text-primary font-mono">
                    {watchAll.routingNumber}
                  </span>
                </div>
              )}
              {watchAll.sortCode && (
                <div className="flex items-center justify-between py-3 border-b border-border-subtle/50">
                  <span className="text-sm text-text-muted">Sort Code</span>
                  <span className="text-sm font-medium text-text-primary font-mono">
                    {watchAll.sortCode}
                  </span>
                </div>
              )}
              {watchAll.swiftCode && (
                <div className="flex items-center justify-between py-3 border-b border-border-subtle/50">
                  <span className="text-sm text-text-muted">SWIFT / BIC</span>
                  <span className="text-sm font-medium text-text-primary font-mono">
                    {watchAll.swiftCode}
                  </span>
                </div>
              )}

              {/* Amount */}
              <div className="flex items-center justify-between py-3 border-b border-border-subtle/50">
                <span className="text-sm text-text-muted">Amount</span>
                <span className="text-lg font-bold gold-text">
                  {formatCurrency(watchAll.amount || 0, selectedAccount?.currency || "USD")}
                </span>
              </div>

              {/* Description */}
              {watchAll.description && (
                <div className="flex items-center justify-between py-3 border-b border-border-subtle/50">
                  <span className="text-sm text-text-muted">Description</span>
                  <span className="text-sm text-text-primary text-right max-w-[200px] truncate">
                    {watchAll.description}
                  </span>
                </div>
              )}

              {/* Available Balance */}
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-text-muted">
                  Balance After Transfer
                </span>
                <span className="text-sm font-medium text-text-secondary">
                  {selectedAccount &&
                    formatCurrency(
                      selectedAccount.balance - (watchAll.amount || 0),
                      selectedAccount.currency
                    )}
                </span>
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="rounded-lg bg-gold-500/5 border border-gold-500/20 px-4 py-3 text-xs text-gold-400">
            {!hasTransferPin
              ? "You'll need to set a transfer PIN in Security settings before confirming."
              : "You'll need your transfer PIN to confirm this transfer."}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setServerError("");
                setCurrentStep(0);
              }}
              className="flex-1 bg-navy-800 border border-border-subtle text-text-primary font-semibold py-3 px-6 rounded-lg hover:bg-navy-700 transition flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              type="button"
              onClick={handleProceedToConfirm}
              disabled={!hasTransferPin}
              className="flex-1 gold-gradient text-navy-950 font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              Confirm Transfer
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          STEP 3 — Transfer PIN (+ OTP for high-risk)
          ═══════════════════════════════════════════════════════ */}
      {currentStep === 2 && (
        <div className="space-y-5">
          <div className="rounded-xl bg-navy-800 border border-border-subtle p-6 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-gold-500" />
            </div>

            {!needsOtp ? (
              <>
                {/* ─── PIN entry ─── */}
                <h3 className="text-lg font-semibold text-text-primary mb-1">
                  Enter Transfer PIN
                </h3>
                <p className="text-sm text-text-muted mb-6">
                  Enter your 4-digit PIN to confirm.
                </p>

                {/* PIN input overlay — real input sits on top of dots */}
                <div
                  className={cn("relative mx-auto w-[180px] h-14 mb-6 cursor-text", pinShake && "animate-shake")}
                  onClick={() => pinInputRef.current?.focus()}
                >
                  {/* Dots underneath */}
                  <div className="absolute inset-0 flex items-center justify-center gap-4 pointer-events-none">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-4 w-4 rounded-full transition-all duration-200",
                          i < pin.length
                            ? "bg-gold-500 scale-110"
                            : "bg-navy-700 border-2 border-border-default"
                        )}
                      />
                    ))}
                  </div>

                  {/* Real input — transparent, overlays the dots */}
                  <input
                    ref={pinInputRef}
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setPin(val);
                      setServerError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && pin.length === 4) handlePinSubmit();
                    }}
                    disabled={isVerifying}
                    autoFocus
                    autoComplete="one-time-code"
                    className="absolute inset-0 w-full h-full opacity-0 text-lg caret-transparent"
                    aria-label="Transfer PIN"
                  />
                </div>

                <button
                  type="button"
                  onClick={handlePinSubmit}
                  disabled={isVerifying || pin.length < 4}
                  className="w-full gold-gradient text-navy-950 font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Confirm Transfer
                    </>
                  )}
                </button>

                {/* Forgot PIN */}
                <p className="mt-4 text-xs text-text-muted">
                  Forgot your PIN?{" "}
                  <a
                    href="/dashboard/security"
                    className="text-gold-500 hover:text-gold-400 transition-colors"
                  >
                    Reset in Security settings
                  </a>
                </p>
              </>
            ) : (
              <>
                {/* ─── High-risk OTP ─── */}
                <h3 className="text-lg font-semibold text-text-primary mb-1">
                  Additional Verification
                </h3>
                <p className="text-sm text-text-muted mb-6">
                  This transfer requires a verification code. Check your email.
                </p>

                {/* OTP attempt limit */}
                {otpAttempts >= MAX_OTP_ATTEMPTS ? (
                  <div className="rounded-lg bg-error/10 border border-error/20 p-4 mb-4">
                    <p className="text-sm text-error font-medium">
                      Too many failed attempts.
                    </p>
                    <p className="text-xs text-error/80 mt-1">
                      Please request a new code or try again later.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className={cn("flex items-center justify-center gap-2 sm:gap-3 mb-6", otpShake && "animate-shake")}>
                      {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                        <input
                          key={index}
                          ref={(el) => { inputRefs.current[index] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={otp[index]}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          onPaste={index === 0 ? handleOtpPaste : undefined}
                          disabled={isVerifying || otpAttempts >= MAX_OTP_ATTEMPTS}
                          className="w-10 h-12 sm:w-12 sm:h-14 bg-navy-900 border border-border-default rounded-lg text-center text-lg sm:text-xl font-semibold text-text-primary focus:border-gold-500 focus:outline-none transition disabled:opacity-50"
                          aria-label={`Digit ${index + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const code = otp.join("");
                        if (code.length === OTP_LENGTH) submitTransfer(pin, code);
                      }}
                      disabled={isVerifying || otp.join("").length !== OTP_LENGTH || otpAttempts >= MAX_OTP_ATTEMPTS}
                      className="w-full gold-gradient text-navy-950 font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          Verify &amp; Submit
                        </>
                      )}
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Resend for high-risk OTP */}
          {needsOtp && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  handleResendOtp();
                  setOtpAttempts(0);
                }}
                disabled={cooldown > 0 || isSendingOtp}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gold-500 hover:text-gold-400 transition disabled:text-text-muted disabled:cursor-not-allowed"
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Sending...
                  </>
                ) : cooldown > 0 ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    Resend in {cooldown}s
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    Resend Code
                  </>
                )}
              </button>
            </div>
          )}

          {/* Back button */}
          <button
            type="button"
            onClick={() => {
              setCurrentStep(1);
              setPin("");
              setNeedsOtp(false);
              setOtp(Array(OTP_LENGTH).fill(""));
              setOtpAttempts(0);
              setServerError("");
            }}
            className="w-full bg-navy-800 border border-border-subtle text-text-secondary font-medium py-2.5 rounded-lg hover:bg-navy-700 transition flex items-center justify-center gap-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Review
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          STEP 4 — Processing
          ═══════════════════════════════════════════════════════ */}
      {currentStep === 3 && (
        <div className="rounded-xl bg-navy-800 border border-border-subtle p-10">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="h-20 w-20 rounded-full border-4 border-gold-500/20 flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-gold-500 animate-spin" />
              </div>
              <div className="absolute inset-0 h-20 w-20 rounded-full border-4 border-transparent border-t-gold-500 animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Processing Your Transfer
            </h3>
            <p className="text-sm text-text-muted max-w-sm">
              Please wait while we process your transfer. This may take a
              moment...
            </p>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          STEP 5 — Result
          ═══════════════════════════════════════════════════════ */}
      {currentStep === 4 && transferResult && (
        <div className="space-y-6">
          <div className="rounded-xl bg-navy-800 border border-border-subtle p-6 text-center">
            {/* Success Icon */}
            <div className="mx-auto w-16 h-16 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>

            <h3 className="text-xl font-semibold text-text-primary mb-1">
              Transfer Submitted
            </h3>
            <p className="text-sm text-text-muted mb-6">
              Your transfer has been submitted and is pending review.
            </p>

            {/* Transfer Details */}
            <div className="bg-navy-900 rounded-lg p-4 text-left space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted uppercase tracking-wider">
                  Reference
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-medium text-gold-500">
                    {transferResult.reference}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyReference}
                    className="text-text-muted hover:text-gold-500 transition"
                    title="Copy reference"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted uppercase tracking-wider">
                  Amount
                </span>
                <span className="text-sm font-semibold text-text-primary">
                  {formatCurrency(transferResult.amount, transferResult.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted uppercase tracking-wider">
                  Recipient
                </span>
                <span className="text-sm text-text-primary">
                  {transferResult.recipientName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted uppercase tracking-wider">
                  Status
                </span>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-warning/15 text-warning border border-warning/20">
                  Pending
                </span>
              </div>
            </div>

            {/* Info Note */}
            <div className="rounded-lg bg-gold-500/5 border border-gold-500/20 px-4 py-3 text-xs text-gold-400 mb-6">
              Your transfer is being processed and will be completed shortly.
              You will receive an email notification once the transfer is
              approved.
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="flex-1 bg-navy-700 border border-border-subtle text-text-primary font-semibold py-3 px-6 rounded-lg hover:bg-navy-600 transition"
              >
                Back to Dashboard
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(0);
                  setTransferResult(null);
                  setOtp(Array(OTP_LENGTH).fill(""));
                  setOtpSent(false);
                  setServerError("");
                  setSelectedBeneficiary("");
                }}
                className="flex-1 gold-gradient text-navy-950 font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                New Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          STEP 5A — Fake processing animation (while we wait to reveal
          the dormancy result). Shows for ~3.5s after submission before
          flipping to the failure UI below. Makes the system feel like
          it's actually attempting the transfer instead of rejecting
          you instantly.
          ═══════════════════════════════════════════════════════ */}
      {currentStep === 5 && !dormantError && (
        <div className="space-y-6">
          <div className="rounded-xl bg-navy-800 border border-border-subtle p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mb-5">
              <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-1">
              Processing transfer…
            </h3>
            <p className="text-sm text-text-muted max-w-sm mx-auto">
              Please don&rsquo;t close this page. We&rsquo;re submitting
              your transfer to the bank&rsquo;s clearing system.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-500 animate-pulse" />
              <span>Contacting payment network</span>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          STEP 5B — Transfer blocked (dormant / frozen / restricted).
          Rendered once `dormantError` is populated (happens ~3.5s
          after STEP 5A). Intentionally neutral copy: we don't name
          the exact DB state or mention days of inactivity. The
          customer gets a friendly "contact us" flow; the underlying
          reason stays an admin-side concern.
          ═══════════════════════════════════════════════════════ */}
      {currentStep === 5 && dormantError && (
        <div className="space-y-6">
          <div className="rounded-xl bg-navy-800 border border-warning/20 p-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-warning/10 border border-warning/20 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-warning" />
            </div>

            <h3 className="text-xl font-semibold text-text-primary mb-2">
              We couldn&rsquo;t complete this transfer
            </h3>
            <p className="text-sm text-text-muted leading-relaxed max-w-md mx-auto mb-6">
              {dormantError.message}
            </p>

            <div className="rounded-lg bg-navy-900/50 border border-border-default px-4 py-3 text-xs text-text-secondary mb-6">
              Don&rsquo;t worry — no money has been moved or deducted. Once
              our team verifies your account, you&rsquo;ll be able to
              transfer again right away.
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="flex-1 bg-navy-700 border border-border-subtle text-text-primary font-semibold py-3 px-6 rounded-lg hover:bg-navy-600 transition"
              >
                Back to Dashboard
              </button>
              <Link
                href="/dashboard/support"
                className="flex-1 gold-gradient text-navy-950 font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition text-center"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
