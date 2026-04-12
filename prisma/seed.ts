import dotenv from "dotenv";
dotenv.config();

import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@atlastrust.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";

  console.log(`Checking for existing admin: ${adminEmail}`);

  // Check if admin exists
  const existing = await sql`SELECT id FROM "User" WHERE email = ${adminEmail}`;
  if (existing.length > 0) {
    console.log(`Admin user already exists: ${adminEmail}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);
  const id = crypto.randomUUID().replace(/-/g, "").substring(0, 25);

  await sql`
    INSERT INTO "User" (id, email, "firstName", "lastName", password, role, status, "emailVerified", "kycStatus", "createdAt", "updatedAt")
    VALUES (${id}, ${adminEmail}, 'Admin', 'Atlas', ${hashedPassword}, 'ADMIN', 'ACTIVE', true, 'VERIFIED', NOW(), NOW())
  `;

  console.log(`Admin user created: ${adminEmail} (${id})`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  });
