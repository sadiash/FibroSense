"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";
import { AnimatedBackground } from "@/components/layout/animated-background";
import { DemoBanner } from "@/components/layout/demo-banner";
import { DataPrefetch } from "@/components/layout/data-prefetch";
import { MedicalDisclaimer } from "@/components/shared/medical-disclaimer";
import { Onboarding } from "@/components/layout/onboarding";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
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
      <Onboarding />
    </>
  );
}
