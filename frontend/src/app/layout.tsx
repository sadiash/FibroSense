"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-background text-foreground`}>
        <QueryClientProvider client={queryClient}>
          <Sidebar />
          <div className="md:pl-60 min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 p-4 pb-20 md:pb-4">{children}</main>
          </div>
          <MobileNav />
          <Toaster />
        </QueryClientProvider>
      </body>
    </html>
  );
}
