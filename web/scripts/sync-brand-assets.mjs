#!/usr/bin/env node
/**
 * Copy client WS* brand files into stable public/brand/* paths.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const brand = path.join(__dirname, "..", "public", "brand");

const copies = [
  ["WS Web Images/WS_app_icon.png", "icon-192.png"],
  ["WS Web Images/WS_app_icon.png", "icon-512.png"],
  ["WS Logo/whobrey_studios_logo_white.png", "logo-horizontal.png"],
  ["WS Logo/Whobrey Studios Emblem (White).svg", "emblem-white.svg"],
  ["WS Logo/whobrey_studios_emblem_white_v3.png", "emblem-white.png"],
];

for (const [from, to] of copies) {
  const src = path.join(brand, from);
  const dest = path.join(brand, to);
  if (!fs.existsSync(src)) {
    console.warn(`skip (missing): ${from}`);
    continue;
  }
  fs.copyFileSync(src, dest);
  console.log(`${from} → ${to}`);
}

console.log("sync-brand-assets: done");
