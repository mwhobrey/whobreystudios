#!/usr/bin/env node
/**
 * Import client DOCX from public/legal/ into content/legal/*.md
 * Run: node scripts/import-legal-docx.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mammoth from "mammoth";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, "..");
const docxDir = path.join(webRoot, "content", "legal");
const outDir = path.join(webRoot, "content", "legal");

const MAP = [
  {
    docx: "Whobrey_Studios_Terms_of_Service.docx",
    out: "terms.md",
    title: "Terms of Service",
  },
  {
    docx: "Whobrey_Studios_Privacy_Policy.docx",
    out: "privacy.md",
    title: "Privacy Policy",
  },
  {
    docx: "Whobrey_Studios_Refund_and_Cancellation_Policy.docx",
    out: "refund.md",
    title: "Refund & Cancellation Policy",
  },
];

function normalizeMarkdown(body) {
  return body
    .replace(/\r\n/g, "\n")
    .replace(/\\([().\-])/g, "$1")
    .replace(/^# /gm, "## ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function convertOne({ docx, out, title }) {
  const inputPath = path.join(docxDir, docx);
  const { value: markdown } = await mammoth.convertToMarkdown({ path: inputPath });
  const body = normalizeMarkdown(markdown);
  const frontmatter = `---\ntitle: ${title}\nsource: content/legal/${docx}\n---\n\n`;
  const outputPath = path.join(outDir, out);
  await fs.writeFile(outputPath, frontmatter + body + "\n", "utf8");
  console.log(`Wrote ${path.relative(webRoot, outputPath)} (${body.length} chars)`);
}

async function main() {
  for (const entry of MAP) {
    await convertOne(entry);
  }
  console.log("\nDone. Review content/legal/*.md then deploy.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
