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

const siteDescription =
  "Graphic design, vinyl decals, vehicle wraps, and wide-format production from Whobrey Studios, with a client portal for quotes, revisions, and secure file delivery.";

export const metadata: Metadata = {
  metadataBase: new URL("https://whobreystudios.com"),
  title: {
    default: "Whobrey Studios",
    template: "%s · Whobrey Studios",
  },
  description: siteDescription,
  applicationName: "Whobrey Studios",
  authors: [{ name: "Whobrey Studios" }],
  keywords: [
    "graphic design",
    "vinyl decals",
    "vehicle wraps",
    "signage",
    "wide-format printing",
    "brand design",
  ],
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
  alternates: {
    canonical: "/",
  },
  openGraph: {
    siteName: "Whobrey Studios",
    title: "Whobrey Studios",
    description: siteDescription,
    url: "/",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Whobrey Studios",
    description: siteDescription,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Whobrey Studios",
  url: "https://whobreystudios.com",
  logo: "https://whobreystudios.com/brand/logo-horizontal.png",
  description: siteDescription,
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
        <script
          type="application/ld+json"
          // Static, hardcoded object — safe to serialize directly.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
        <VercelObservability />
      </body>
    </html>
  );
}
