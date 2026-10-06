import dotenv from "dotenv";
dotenv.config();

import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  // Login looks users up by lowercased email, so store it the same way.
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@atlastrust.com")
    .trim()
    .toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";

  console.log(`Checking for existing admin: ${adminEmail}`);

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  // If the admin exists, re-sync password/role/status so changing
  // ADMIN_PASSWORD in .env and re-running the seed actually takes effect.
  const existing = await sql`SELECT id FROM "User" WHERE LOWER(email) = ${adminEmail}`;
  if (existing.length > 0) {
    await sql`
      UPDATE "User"
      SET email = ${adminEmail}, password = ${hashedPassword}, role = 'ADMIN',
          status = 'ACTIVE', "emailVerified" = true, "updatedAt" = NOW()
      WHERE id = ${existing[0].id}
    `;
    console.log(`Admin user updated: ${adminEmail}`);
    return;
  }
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
