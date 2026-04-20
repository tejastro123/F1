import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Ticker } from "@/components/layout/Ticker";
import { Toaster } from "@/components/ui/Toaster";

export const metadata: Metadata = {
  title: {
    template: "%s | Tejas Pit Wall Pro",
    default: "Tejas Pit Wall Pro — F1 Analytics & Live Tracking",
  },
  description:
    "Production-grade Formula 1 analytics platform. Live race tracking, AI-powered insights, driver analytics, race strategy simulator, and real-time telemetry.",
  keywords: ["Formula 1", "F1", "live race", "telemetry", "analytics", "pit wall", "race tracker"],
  authors: [{ name: "Tejas" }],
  openGraph: {
    title: "Tejas Pit Wall Pro",
    description: "Formula 1 Analytics & Live Tracking Platform",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#E10600",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>
          <Ticker />
          <Navbar />
          <main className="relative z-10 min-h-screen">{children}</main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
