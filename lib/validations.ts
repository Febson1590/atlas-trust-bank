import { z } from "zod";

// ─── Auth Schemas ────────────────────────────────────────

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name is too long"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name is too long"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const otpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "OTP must be 6 digits"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// ─── Transfer Schemas ────────────────────────────────────

export const transferSchema = z.object({
  fromAccountId: z.string().min(1, "Select source account"),
  recipientName: z.string().min(2, "Recipient name is required"),
  recipientBank: z.string().min(2, "Bank name is required"),
  recipientAcct: z.string().min(4, "Account number or IBAN is required"),
  recipientCountry: z.string().optional(),
  routingNumber: z.string().optional(),
  swiftCode: z.string().optional(),
  sortCode: z.string().optional(),
  amount: z
    .number({ message: "Enter a valid amount" })
    .positive("Amount must be greater than 0"),
  description: z.string().optional(),
});

// ─── Beneficiary Schemas ─────────────────────────────────

export const beneficiarySchema = z.object({
  name: z.string().min(2, "Name is required"),
  bankName: z.string().min(2, "Bank name is required"),
  accountNumber: z.string().min(5, "Account number is required"),
  routingNumber: z.string().optional(),
  swiftCode: z.string().optional(),
  country: z.string().min(1, "Country is required"),
});

// ─── Profile Schemas ─────────────────────────────────────

export const profileSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
});

// ─── Support Schemas ─────────────────────────────────────

export const supportTicketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

// ─── Public Contact Form Schema ──────────────────────────
// Used by the unauthenticated contact form on the marketing site.

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Please tell us your name")
    .max(100, "Name is too long"),
  email: z.string().email("Enter a valid email address"),
  subject: z
    .string()
    .min(3, "Subject must be at least 3 characters")
    .max(120, "Subject is too long"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(4000, "Message is too long"),
});

// ─── Admin Schemas ───────────────────────────────────────

export const adminCreditDebitSchema = z.object({
  accountId: z.string().min(1),
  type: z.enum(["CREDIT", "DEBIT"]),
  amount: z.number().positive("Amount must be greater than 0"),
  description: z.string().min(3, "Description is required"),
  category: z.string().optional(),
  // Optional back-dated transaction date. Route-level checks reject
  // future dates; Zod just guards the wire shape. Empty string from the
  // HTML date input is coerced to undefined.
  transactionDate: z
    .string()
    .datetime()
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export const adminTransferActionSchema = z.object({
  transferId: z.string().min(1),
  action: z.enum(["approve", "reject", "delay"]),
  adminNote: z.string().optional(),
});

export const adminAccountStatusSchema = z.object({
  accountId: z.string().min(1),
  status: z.enum(["ACTIVE", "DORMANT", "RESTRICTED", "FROZEN"]),
});

export const adminUserStatusSchema = z.object({
  userId: z.string().min(1),
  status: z.enum(["ACTIVE", "SUSPENDED", "FROZEN"]),
});

// Full admin control system for funding a user's four default accounts
// with realistic transaction history. Admin specifies totals, date range,
// transaction count, amount bounds, description lists, distribution
// parameters, generation pattern, and replace/append mode.
export const transactionGeneratorSchema = z.object({
  userId: z.string().min(1, "Select a user"),
  totalCredit: z
    .number({ message: "Total credit must be a number" })
    .min(0, "Total credit cannot be negative")
    .max(10_000_000, "Total credit too large"),
  totalDebit: z
    .number({ message: "Total debit must be a number" })
    .min(0, "Total debit cannot be negative")
    .max(10_000_000, "Total debit too large"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  txCount: z.number().int().min(4).max(500).optional(),
  minAmount: z.number().min(0.01).optional(),
  maxAmount: z.number().min(0.01).optional(),
  pattern: z.enum(["random", "highActivity", "salaryBased"]).optional(),
  primaryMinPct: z.number().min(0).max(100).optional(),
  primaryMaxPct: z.number().min(0).max(100).optional(),
  creditDescriptions: z.array(z.string().min(1)).optional(),
  debitDescriptions: z.array(z.string().min(1)).optional(),
  mode: z.enum(["replace", "append"]).optional(),
});

// ─── Types ──────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type TransferInput = z.infer<typeof transferSchema>;
export type BeneficiaryInput = z.infer<typeof beneficiarySchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type SupportTicketInput = z.infer<typeof supportTicketSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type AdminCreditDebitInput = z.infer<typeof adminCreditDebitSchema>;
export type AdminTransferActionInput = z.infer<typeof adminTransferActionSchema>;
export type TransactionGeneratorInput = z.infer<typeof transactionGeneratorSchema>;
