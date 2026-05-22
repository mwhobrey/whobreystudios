#!/usr/bin/env node
/**
 * One-time: mark all local migrations as "already applied" on a non-empty DB
 * that was created with `db push` (fixes P3005 on first migrate deploy).
 *
 * Run ONLY after schema matches prisma/schema.prisma (use `npm run db:push` first).
 *
 *   DATABASE_URL="postgresql://..." npm run db:baseline
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, "..", "prisma", "migrations");

if (!process.env.DATABASE_URL?.trim()) {
  console.error("Set DATABASE_URL to your Neon connection string first.");
  process.exit(1);
}

const dirs = fs
  .readdirSync(migrationsDir)
  .filter((name) => fs.statSync(path.join(migrationsDir, name)).isDirectory())
  .sort();

console.log(`Baselining ${dirs.length} migrations on ${process.env.DATABASE_URL.split("@")[1] ?? "db"}...\n`);

for (const dir of dirs) {
  console.log(`→ migrate resolve --applied ${dir}`);
  execSync(`npx prisma migrate resolve --applied ${dir}`, {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
  });
}

console.log("\nDone. Future schema changes: use `npm run db:migrate` locally, then `npm run db:deploy` on prod.");
