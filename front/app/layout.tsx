import type { Metadata } from "next";
import { Fraunces, Geist, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const sans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "envpull — encrypted .env sync",
  description:
    "Secure, zero-knowledge sync for your environment variables. Encrypt locally. Sync anywhere. Only you can read them.",
  metadataBase: new URL("https://envpull.dev"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased",
        display.variable,
        sans.variable,
        mono.variable,
      )}
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
