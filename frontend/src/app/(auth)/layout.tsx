"use client";

import { AnimatedBackground } from "@/components/layout/animated-background";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AnimatedBackground />
      <div className="min-h-screen flex items-center justify-center p-4">
        {children}
      </div>
    </>
  );
}
