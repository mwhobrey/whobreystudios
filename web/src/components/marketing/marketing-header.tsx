import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";
import { AppButton } from "@/components/ui/app-button";

type Props = {
  signedInHref?: string | null;
  signedInLabel?: string | null;
};

export function MarketingHeader({ signedInHref, signedInLabel }: Props) {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-[88rem] items-center justify-between gap-4 px-6 py-6">
      <Link href="/" className="ws-focus-ring shrink-0 rounded">
        <Wordmark variant="horizontal" size="md" />
      </Link>

      <nav
        className="flex items-center gap-4 sm:gap-6"
        aria-label="Site"
      >
        <Link
          href="/faq"
          className="ws-focus-ring text-sm font-medium text-text-muted transition hover:text-text-primary"
        >
          FAQ
        </Link>
        {signedInHref && signedInLabel ? (
          <Link href={signedInHref}>
            <AppButton
              roleVariant="portal"
              iconRight={<ArrowRight className="h-4 w-4" />}
            >
              {signedInLabel}
            </AppButton>
          </Link>
        ) : (
          <Link href="/login">
            <AppButton iconRight={<ArrowRight className="h-4 w-4" />}>Sign in</AppButton>
          </Link>
        )}
      </nav>
    </header>
  );
}
