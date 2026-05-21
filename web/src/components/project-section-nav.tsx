type Item = { href: string; label: string };

type Props = {
  items: Item[];
};

/** Horizontal in-page nav for long project detail pages. */
export function ProjectSectionNav({ items }: Props) {
  return (
    <nav
      aria-label="On this page"
      className="flex flex-wrap gap-2 border-b border-[color:var(--border-subtle)] pb-3"
    >
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="ws-focus-ring rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface-raised)]/80 px-3 py-1 text-xs font-medium text-text-muted transition hover:border-[color:var(--border-default)] hover:text-text-primary"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
