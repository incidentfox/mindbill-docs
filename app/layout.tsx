import type { Metadata, Viewport } from "next";
import { DocsShell } from "@/components/docs-shell";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://docs.mindbill.org"),
  title: {
    default: "MindBill developer docs",
    template: "%s · MindBill docs",
  },
  description:
    "Review, submit, and track workers' compensation medical bills from your product.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "MindBill developer docs",
    description: "Partner API and native billing components.",
    url: "https://docs.mindbill.org",
    siteName: "MindBill docs",
    type: "website",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#20232a" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <DocsShell>{children}</DocsShell>
      </body>
    </html>
  );
}
