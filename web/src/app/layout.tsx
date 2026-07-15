import type { Metadata, Viewport } from "next";
import { Geist_Mono, Manrope } from "next/font/google";
import { VercelObservability } from "@/components/analytics/vercel-observability";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Whobrey Studios",
    template: "%s · Whobrey Studios",
  },
  description:
    "Whobrey Studios client portal for design and production work: digital assets, vinyl decal projects, quote approvals, revisions, secure file delivery, and messaging.",
  applicationName: "Whobrey Studios",
  authors: [{ name: "Whobrey Studios" }],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Whobrey Studios",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/brand/icon-192.png", sizes: "192x192" }],
  },
  openGraph: {
    title: "Whobrey Studios",
    description:
      "Client portal for digital assets and production work with quote approvals, revisions, secure file delivery, and messaging.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Whobrey Studios",
    description:
      "Client portal for digital assets and production work with quote approvals, revisions, secure file delivery, and messaging.",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col">
        {children}
        <VercelObservability />
      </body>
    </html>
  );
}
