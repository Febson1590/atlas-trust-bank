import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

// Reports whether the services login depends on are reachable.
// Returns only ok/fail flags — never secrets or error details.
async function check(fn: () => Promise<unknown>, label: string) {
  try {
    await fn();
    return "ok";
  } catch (error) {
    console.error(`[health] ${label} failed:`, error);
    return "fail";
  }
}

export async function GET() {
  const [database, redisStatus] = await Promise.all([
    check(() => prisma.$queryRaw`SELECT 1`, "database"),
    check(() => redis.ping(), "redis"),
  ]);

  const env = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    UPSTASH_REDIS_REST_URL: Boolean(process.env.UPSTASH_REDIS_REST_URL),
    UPSTASH_REDIS_REST_TOKEN: Boolean(process.env.UPSTASH_REDIS_REST_TOKEN),
  };

  const healthy = database === "ok" && redisStatus === "ok";
  return NextResponse.json(
    { healthy, database, redis: redisStatus, env },
    { status: healthy ? 200 : 503 }
  );
}
