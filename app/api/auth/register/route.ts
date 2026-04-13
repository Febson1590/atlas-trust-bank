import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, storeOTP, checkRateLimit, getClientIP } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";
import { sendOTPEmail } from "@/lib/email";
import { generateAccountNumber } from "@/lib/utils";

export async function POST(request: Request) {
  let step = "init";
  try {
    step = "json";
    const body = await request.json();

    step = "validate";
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, password } = result.data;

    step = "rateLimit";
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

    step = "findUser";
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    step = "hash";
    const hashedPassword = await hashPassword(password);

    step = "createUser";
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        firstName,
        lastName,
        password: hashedPassword,
        accounts: {
          create: {
            accountNumber: generateAccountNumber(),
            type: "CHECKING",
            label: "Primary Checking",
            balance: 0,
            currency: "USD",
          },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    step = "storeOTP";
    const otp = await storeOTP(user.email, "verification");

    step = "sendEmail";
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
    const message = error instanceof Error ? error.message : String(error);
    const name = error instanceof Error ? error.constructor.name : "Unknown";
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again.", _debug: { step, name, message, hasDbUrl: !!process.env.DATABASE_URL } },
      { status: 500 }
    );
  }
}
