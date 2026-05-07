import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Whobrey Studios",
    template: "%s · Whobrey Studios",
  },
  description:
    "Whobrey Studios client portal for design and production work — digital assets, vinyl decal projects, quote approvals, revisions, secure file delivery, and messaging.",
  applicationName: "Whobrey Studios",
  authors: [{ name: "Whobrey Studios" }],
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
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
  themeColor: "#08080b",
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
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col">{children}</body>
    </html>
  );
}
