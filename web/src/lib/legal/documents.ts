import "server-only";

import fs from "node:fs/promises";
import path from "node:path";

export const LEGAL_SLUGS = ["terms", "privacy", "refund"] as const;
export type LegalSlug = (typeof LEGAL_SLUGS)[number];

export type LegalDocument = {
  slug: LegalSlug;
  title: string;
  body: string;
  isPlaceholder: boolean;
};

const SLUG_META: Record<LegalSlug, { label: string; file: string }> = {
  terms: { label: "Terms", file: "terms.md" },
  privacy: { label: "Privacy", file: "privacy.md" },
  refund: { label: "Refund policy", file: "refund.md" },
};

const CONTENT_DIR = path.join(process.cwd(), "content", "legal");

function parseMarkdownFile(raw: string): { title: string; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { title: "Policy", body: raw.trim() };

  const frontmatter = match[1];
  const body = match[2].trim();
  const titleLine = frontmatter.match(/^title:\s*(.+)$/m);
  const title = titleLine?.[1]?.trim().replace(/^["']|["']$/g, "") ?? "Policy";
  return { title, body };
}

export function isLegalSlug(value: string): value is LegalSlug {
  return (LEGAL_SLUGS as readonly string[]).includes(value);
}

export function legalHref(slug: LegalSlug) {
  return `/legal/${slug}`;
}

export function legalLabel(slug: LegalSlug) {
  return SLUG_META[slug].label;
}

export async function getLegalDocument(slug: LegalSlug): Promise<LegalDocument | null> {
  const filePath = path.join(CONTENT_DIR, SLUG_META[slug].file);
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const { title, body } = parseMarkdownFile(raw);
    return {
      slug,
      title,
      body,
      isPlaceholder: /\*\*Placeholder\*\*/i.test(body),
    };
  } catch {
    return null;
  }
}

export async function listLegalDocuments(): Promise<LegalDocument[]> {
  const docs = await Promise.all(LEGAL_SLUGS.map((slug) => getLegalDocument(slug)));
  return docs.filter((doc): doc is LegalDocument => doc !== null);
}
