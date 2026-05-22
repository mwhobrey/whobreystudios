import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cx } from "@/lib/ui";

type Props = {
  markdown: string;
  className?: string;
};

export function LegalProse({ markdown, className }: Props) {
  return (
    <div
      className={cx(
        "legal-prose max-w-none text-sm leading-relaxed text-text-secondary",
        "[&_h1]:mt-8 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:text-text-primary",
        "[&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-text-primary",
        "[&_h3]:mt-4 [&_h3]:font-medium [&_h3]:text-text-primary",
        "[&_p]:mt-3",
        "[&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5",
        "[&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-5",
        "[&_a]:text-[color:var(--brand-primary)] [&_a]:underline",
        "[&_strong]:text-text-primary",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
}
