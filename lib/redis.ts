import { Redis } from "@upstash/redis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function createRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || "https://placeholder.upstash.io",
    token: process.env.UPSTASH_REDIS_REST_TOKEN || "placeholder",
  });
}

export const redis = globalForRedis.redis ?? createRedis();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

// ─── Redis Key Factory ───────────────────────────────────
// All Redis keys are namespaced and prefixed for clarity.
// Redis is ONLY used for ephemeral data: sessions, OTPs, rate limits.

export const RK = {
  // Sessions
  session: (token: string) => `session:${token}`,

  // OTP codes
  otp: (email: string, purpose: string) => `otp:${purpose}:${email}`,

  // Rate limiting
  rateLimit: (action: string, identifier: string) =>
    `rate:${action}:${identifier}`,

  // Password reset tokens
  resetToken: (token: string) => `reset:${token}`,
} as const;

// ─── Session Types ───────────────────────────────────────

export interface SessionData {
  userId: string;
  email: string;
  role: string;
  createdAt: number;
}

export interface OtpData {
  code: string;
  email: string;
  attempts: number;
  createdAt: number;
}

export interface RateLimitData {
  count: number;
  firstAttempt: number;
}
