#!/usr/bin/env node
/**
 * One-shot local dev: Docker Postgres → install → migrate → seed → Next dev.
 * Run from repo root: npm run dev
 */
import { randomBytes } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const envPath = join(web, ".env");
const envExample = join(web, ".env.example");

function run(label, cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, {
    cwd: opts.cwd ?? root,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, ...opts.env },
  });
  if (result.status !== 0) {
    console.error(`[dev] ${label} failed (exit ${result.status}).`);
    process.exit(result.status ?? 1);
  }
}

function ensureEnvFile() {
  if (!existsSync(envPath) && existsSync(envExample)) {
    copyFileSync(envExample, envPath);
    console.log("[dev] Created web/.env from .env.example.");
  }
  if (!existsSync(envPath)) {
    console.error("[dev] Missing web/.env — copy web/.env.example to web/.env and set DATABASE_URL / AUTH_SECRET.");
    process.exit(1);
  }

  let content = readFileSync(envPath, "utf8");
  const placeholder = /AUTH_SECRET=(["'])replace-with-a-long-random-string\1/;
  if (placeholder.test(content)) {
    const secret = randomBytes(32).toString("hex");
    content = content.replace(
      placeholder,
      `AUTH_SECRET="${secret}"`,
    );
    writeFileSync(envPath, content);
    console.log("[dev] Set AUTH_SECRET (was placeholder).");
  }
}

async function main() {
  console.log("[dev] Starting Postgres (docker compose)…");
  const docker = spawnSync("docker", ["compose", "up", "-d"], {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (docker.status !== 0) {
    console.error(
      "[dev] docker compose failed — start Docker Desktop or run Postgres yourself and set DATABASE_URL in web/.env.",
    );
    process.exit(docker.status ?? 1);
  }

  await delay(1500);

  ensureEnvFile();

  if (!existsSync(join(web, "node_modules"))) {
    run("npm install", "npm", ["install"], { cwd: web });
  } else {
    console.log("[dev] node_modules present — skip npm install. (cd web && npm i if deps changed.)");
  }
  run("prisma migrate deploy", "npx", ["prisma", "migrate", "deploy"], { cwd: web });
  run("prisma db seed", "npx", ["prisma", "db", "seed"], { cwd: web });

  console.log("[dev] Starting Next.js…");
  const child = spawn("npm", ["run", "dev"], {
    cwd: web,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  child.on("exit", (code) => process.exit(code ?? 0));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
