"use client";

import { useEffect } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";
import { AnimatedBackground } from "@/components/layout/animated-background";
import { Toaster } from "@/components/ui/toaster";
import { DemoBanner } from "@/components/layout/demo-banner";
import { DataPrefetch } from "@/components/layout/data-prefetch";
import { MedicalDisclaimer } from "@/components/shared/medical-disclaimer";
import { Onboarding } from "@/components/layout/onboarding";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });

function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
  }, []);
  return null;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8B5CF6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FibroSense" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body
        className={`${jakarta.className} antialiased bg-background text-foreground`}
      >
        <ServiceWorkerRegistrar />
        <QueryClientProvider client={queryClient}>
          <DataPrefetch />
          <AnimatedBackground />
          <Sidebar />
          <div className="md:pl-16 min-h-screen flex flex-col">
            <DemoBanner />
            <Header />
            <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
              {children}
              <MedicalDisclaimer variant="footer" />
            </main>
          </div>
          <MobileNav />
          <Toaster />
          <Onboarding />
        </QueryClientProvider>
      </body>
    </html>
  );
}
