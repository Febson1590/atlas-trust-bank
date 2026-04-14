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

// ─── Admin Schemas ───────────────────────────────────────

export const adminCreditDebitSchema = z.object({
  accountId: z.string().min(1),
  type: z.enum(["CREDIT", "DEBIT"]),
  amount: z.number().positive("Amount must be greater than 0"),
  description: z.string().min(3, "Description is required"),
  category: z.string().optional(),
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

export const transactionGeneratorSchema = z.object({
  accountId: z.string().min(1),
  count: z.number().int().min(1).max(100),
  startDate: z.string(),
  endDate: z.string(),
  minAmount: z.number().positive(),
  maxAmount: z.number().positive(),
  types: z.array(z.enum(["CREDIT", "DEBIT"])).min(1),
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
export type AdminCreditDebitInput = z.infer<typeof adminCreditDebitSchema>;
export type AdminTransferActionInput = z.infer<typeof adminTransferActionSchema>;
export type TransactionGeneratorInput = z.infer<typeof transactionGeneratorSchema>;
