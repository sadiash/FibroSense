"use client";

import { useEffect } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { AuthProvider } from "@/lib/auth-context";
import { AuthGuard } from "@/components/layout/auth-guard";
import { Toaster } from "@/components/ui/toaster";

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
          <AuthProvider>
            <AuthGuard>
              {children}
            </AuthGuard>
          </AuthProvider>
          <Toaster />
        </QueryClientProvider>
      </body>
    </html>
  );
}
