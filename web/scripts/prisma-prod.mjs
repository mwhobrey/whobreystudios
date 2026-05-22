#!/usr/bin/env node
/**
 * Run Prisma against Production DATABASE_URL without local Docker .env winning.
 *
 *   npm run db:prod:push
 *   npm run db:prod:seed
 *
 * URL resolution (first match wins):
 *   1. Non-empty DATABASE_URL in the shell (not localhost)
 *   2. web/.env.production.db.local (gitignored; paste Neon URL once)
 *   3. .vercel/.env.production.local or .env.production.local if value is non-empty
 *   4. vercel env run -e production (temporarily renames .env / .env.local)
 *
 * Requires: `npx vercel link` once from web/
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, "..");

const command = process.argv[2];
if (command !== "push" && command !== "seed") {
  console.error("Usage: node scripts/prisma-prod.mjs <push|seed>");
  process.exit(1);
}

const LOCAL_ENV_FILES = [".env", ".env.local"];
const CANDIDATE_ENV_FILES = [
  ".env.production.db.local",
  ".vercel/.env.production.local",
  ".env.production.local",
];

function parseDatabaseUrlFromContent(content) {
  const line = content.split(/\r?\n/).find((l) => /^DATABASE_URL=/.test(l));
  if (!line) return "";
  let value = line.slice("DATABASE_URL=".length).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return value;
}

function parseDatabaseUrlFromFile(filePath) {
  if (!fs.existsSync(filePath)) return "";
  return parseDatabaseUrlFromContent(fs.readFileSync(filePath, "utf8"));
}

function isLocalhostUrl(url) {
  return /127\.0\.0\.1|localhost/i.test(url);
}

function isUsableDatabaseUrl(url) {
  return typeof url === "string" && url.length > 12 && url.includes("@") && !isLocalhostUrl(url);
}

function hostHint(url) {
  if (!isUsableDatabaseUrl(url)) return "unknown";
  return url.split("@")[1]?.split("/")[0] ?? "unknown";
}

function resolveDatabaseUrl() {
  if (isUsableDatabaseUrl(process.env.DATABASE_URL)) {
    return { url: process.env.DATABASE_URL, source: "shell" };
  }

  for (const rel of CANDIDATE_ENV_FILES) {
    const value = parseDatabaseUrlFromFile(path.join(webRoot, rel));
    if (isUsableDatabaseUrl(value)) {
      return { url: value, source: rel };
    }
  }

  return null;
}

function printEmptyDatabaseUrlHelp() {
  console.error(`
DATABASE_URL is missing or empty for Production.

Vercel \`env pull\` often writes DATABASE_URL="" for sensitive vars — and a known CLI bug
stores an empty string when the var was added with \`--sensitive\` (dashboard still shows "Encrypted").

Fix (pick one):

  A) Vercel dashboard → whobrey-studios-demo → Settings → Environment Variables
     → DATABASE_URL (Production) → paste Neon pooled URL from console.neon.tech → Connect

  B) CLI (do NOT pass --sensitive until your CLI is fixed):
     echo "<neon-pooled-url>" | npx vercel env update DATABASE_URL production

  C) Local one-off file (gitignored):
     copy .env.production.db.local.example → .env.production.db.local
     paste DATABASE_URL from Neon, then re-run npm run db:prod:push

Verify (length should be > 50, not 0):
  (Get-Content .vercel\\.env.production.local | Select-String DATABASE_URL).Length
`);
}

function runPrisma(databaseUrl) {
  const prismaArgs = command === "push" ? ["prisma", "db", "push"] : ["prisma", "db", "seed"];
  const { DATABASE_URL: _drop, ...baseEnv } = process.env;
  const result = spawnSync("npx", prismaArgs, {
    cwd: webRoot,
    stdio: "inherit",
    env: {
      ...baseEnv,
      DATABASE_URL: databaseUrl,
      DOTENV_CONFIG_PATH: path.join(webRoot, ".env.production.db.local"),
    },
  });
  return result.status ?? 1;
}

function runViaVercelEnvRun() {
  const prismaSubcommand = command === "push" ? ["prisma", "db", "push"] : ["prisma", "db", "seed"];
  const restored = [];

  for (const name of LOCAL_ENV_FILES) {
    const filePath = path.join(webRoot, name);
    if (!fs.existsSync(filePath)) continue;
    const backupPath = `${filePath}.prisma-prod.bak`;
    fs.renameSync(filePath, backupPath);
    restored.push([filePath, backupPath]);
  }

  const { DATABASE_URL: _drop, ...baseEnv } = process.env;
  let status = 1;
  try {
    const result = spawnSync(
      "npx",
      ["vercel", "env", "run", "-e", "production", "--", "npx", ...prismaSubcommand],
      {
        cwd: webRoot,
        stdio: "inherit",
        env: baseEnv,
      },
    );
    status = result.status ?? 1;
  } finally {
    for (const [filePath, backupPath] of restored) {
      if (fs.existsSync(backupPath)) {
        fs.renameSync(backupPath, filePath);
      }
    }
  }
  return status;
}

const resolved = resolveDatabaseUrl();
if (resolved) {
  console.log(`Using DATABASE_URL from ${resolved.source}`);
  console.log(`Target database host: ${hostHint(resolved.url)}`);
  process.exit(runPrisma(resolved.url));
}

// Pulled files exist but are empty — try env run without local .env override
const pulledEmpty =
  CANDIDATE_ENV_FILES.some((rel) => {
    const filePath = path.join(webRoot, rel);
    if (!fs.existsSync(filePath)) return false;
    const value = parseDatabaseUrlFromFile(filePath);
    return value === "" || (value.length > 0 && !isUsableDatabaseUrl(value));
  }) || fs.existsSync(path.join(webRoot, ".env.production.local"));

if (pulledEmpty) {
  console.log("No non-empty DATABASE_URL in env files; trying vercel env run (local .env hidden) …");
  const status = runViaVercelEnvRun();
  if (status !== 0) {
    printEmptyDatabaseUrlHelp();
  }
  process.exit(status);
}

printEmptyDatabaseUrlHelp();
process.exit(1);
