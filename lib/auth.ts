import { cookies } from "next/headers";
import { redis, RK, SessionData, OtpData, RateLimitData } from "./redis";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// ─── Constants ───────────────────────────────────────────

const SESSION_COOKIE = "atlas_session";
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days
const OTP_TTL = 60 * 5; // 5 minutes
const OTP_MAX_ATTEMPTS = 5;
const RESET_TOKEN_TTL = 60 * 15; // 15 minutes

export const RATE_LIMITS = {
  login: { max: 5, windowSeconds: 60 * 15 }, // 5 attempts per 15 min
  otp: { max: 5, windowSeconds: 60 * 10 }, // 5 attempts per 10 min
  register: { max: 3, windowSeconds: 60 * 60 }, // 3 per hour
  passwordReset: { max: 3, windowSeconds: 60 * 60 }, // 3 per hour
} as const;

// ─── Password Helpers ────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── Session Management ──────────────────────────────────

export function generateToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

export async function createSession(
  userId: string,
  email: string,
  role: string
): Promise<string> {
  const token = generateToken();
  const sessionData: SessionData = {
    userId,
    email,
    role,
    createdAt: Date.now(),
  };

  await redis.set(RK.session(token), JSON.stringify(sessionData), {
    ex: SESSION_TTL,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL,
    path: "/",
  });

  return token;
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const raw = await redis.get<string>(RK.session(token));
  if (!raw) return null;

  try {
    return typeof raw === "string" ? JSON.parse(raw) : (raw as SessionData);
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await redis.del(RK.session(token));
  }
  cookieStore.delete(SESSION_COOKIE);
}

export function getSessionToken(): string | undefined {
  // For use in middleware (sync cookie read)
  // This is a placeholder — middleware uses request.cookies directly
  return undefined;
}

// ─── OTP Management ─────────────────────────────────────

export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function storeOTP(
  email: string,
  purpose: string
): Promise<string> {
  const code = generateOTP();
  const data: OtpData = {
    code,
    email,
    attempts: 0,
    createdAt: Date.now(),
  };

  await redis.set(RK.otp(email, purpose), JSON.stringify(data), {
    ex: OTP_TTL,
  });

  return code;
}

export async function verifyOTP(
  email: string,
  purpose: string,
  code: string
): Promise<{ valid: boolean; error?: string }> {
  const key = RK.otp(email, purpose);
  const raw = await redis.get<string>(key);
  if (!raw) return { valid: false, error: "OTP expired or not found" };

  const data: OtpData =
    typeof raw === "string" ? JSON.parse(raw) : (raw as OtpData);

  if (data.attempts >= OTP_MAX_ATTEMPTS) {
    await redis.del(key);
    return { valid: false, error: "Too many attempts. Request a new code." };
  }

  if (data.code !== code) {
    data.attempts += 1;
    await redis.set(key, JSON.stringify(data), { ex: OTP_TTL });
    return { valid: false, error: "Invalid code" };
  }

  // Valid — delete the OTP
  await redis.del(key);
  return { valid: true };
}

// ─── Password Reset Tokens ──────────────────────────────

export async function createResetToken(email: string): Promise<string> {
  const token = generateToken();
  await redis.set(RK.resetToken(token), email, { ex: RESET_TOKEN_TTL });
  return token;
}

export async function verifyResetToken(
  token: string
): Promise<string | null> {
  const email = await redis.get<string>(RK.resetToken(token));
  return email || null;
}

export async function consumeResetToken(token: string): Promise<string | null> {
  const email = await verifyResetToken(token);
  if (email) {
    await redis.del(RK.resetToken(token));
  }
  return email;
}

// ─── Rate Limiting ──────────────────────────────────────

export async function checkRateLimit(
  action: keyof typeof RATE_LIMITS,
  identifier: string
): Promise<{ allowed: boolean; remaining: number; retryAfter?: number }> {
  const config = RATE_LIMITS[action];
  const key = RK.rateLimit(action, identifier);
  const raw = await redis.get<string>(key);

  if (!raw) {
    const data: RateLimitData = { count: 1, firstAttempt: Date.now() };
    await redis.set(key, JSON.stringify(data), { ex: config.windowSeconds });
    return { allowed: true, remaining: config.max - 1 };
  }

  const data: RateLimitData =
    typeof raw === "string" ? JSON.parse(raw) : (raw as RateLimitData);

  if (data.count >= config.max) {
    const elapsed = (Date.now() - data.firstAttempt) / 1000;
    const retryAfter = Math.ceil(config.windowSeconds - elapsed);
    return { allowed: false, remaining: 0, retryAfter: Math.max(retryAfter, 1) };
  }

  data.count += 1;
  const ttl = await redis.ttl(key);
  await redis.set(key, JSON.stringify(data), { ex: ttl > 0 ? ttl : config.windowSeconds });
  return { allowed: true, remaining: config.max - data.count };
}

// ─── Helpers ────────────────────────────────────────────

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "127.0.0.1";
}

export function parseUserAgent(ua: string | null): {
  browser: string;
  os: string;
} {
  if (!ua) return { browser: "Unknown", os: "Unknown" };
  const browser = ua.includes("Chrome")
    ? "Chrome"
    : ua.includes("Firefox")
    ? "Firefox"
    : ua.includes("Safari")
    ? "Safari"
    : ua.includes("Edge")
    ? "Edge"
    : "Other";
  const os = ua.includes("Windows")
    ? "Windows"
    : ua.includes("Mac")
    ? "macOS"
    : ua.includes("Linux")
    ? "Linux"
    : ua.includes("Android")
    ? "Android"
    : ua.includes("iOS")
    ? "iOS"
    : "Other";
  return { browser, os };
}
