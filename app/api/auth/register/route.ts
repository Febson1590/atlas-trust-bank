import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, storeOTP, checkRateLimit, getClientIP } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";
import { sendOTPEmail } from "@/lib/email";
import { generateAccountNumber } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, password } = result.data;

    // Rate limiting
    const ip = getClientIP(request);
    const rateLimit = await checkRateLimit("register", ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many registration attempts. Please try again in ${rateLimit.retryAfter} seconds.`,
        },
        { status: 429 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Default accounts issued to every new user. All 4 are created in a
    // single nested `create` so the user + accounts land atomically in
    // Postgres — if account creation fails for any reason, no user row is
    // left behind. Each account gets its own unique accountNumber via
    // generateAccountNumber() so the `@unique` constraint is never hit.
    //
    // The AccountType enum in the schema has CHECKING | SAVINGS | INVESTMENT,
    // but Savings was removed from the default issuance set per product
    // direction — new users get Primary Checking + three multi-currency
    // checking accounts (EUR, GBP, BTC). The SAVINGS enum value is kept in
    // the schema for legacy / admin-created accounts but is no longer
    // offered in the admin create form (see app/admin/accounts/AccountActions.tsx)
    // and is rejected server-side (see app/api/admin/accounts/route.ts).
    const defaultAccounts = [
      {
        accountNumber: generateAccountNumber(),
        type: "CHECKING" as const,
        label: "Primary Checking",
        balance: 0,
        currency: "USD",
      },
      {
        accountNumber: generateAccountNumber(),
        type: "CHECKING" as const,
        label: "EUR Account",
        balance: 0,
        currency: "EUR",
      },
      {
        accountNumber: generateAccountNumber(),
        type: "CHECKING" as const,
        label: "GBP Account",
        balance: 0,
        currency: "GBP",
      },
      {
        accountNumber: generateAccountNumber(),
        type: "CHECKING" as const,
        label: "BTC Wallet",
        balance: 0,
        currency: "BTC",
      },
    ];

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        firstName,
        lastName,
        password: hashedPassword,
        accounts: {
          create: defaultAccounts,
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    // Generate and store OTP for email verification
    const otp = await storeOTP(user.email, "verification");

    // Send verification email
    await sendOTPEmail(user.email, otp, "verification");

    return NextResponse.json(
      {
        success: true,
        data: {
          message:
            "Registration successful. Please check your email for the verification code.",
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
