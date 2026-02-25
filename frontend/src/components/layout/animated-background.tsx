"use client";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-background" />

      {/* Animated blobs */}
      <div
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-[0.07] animate-blob-1"
        style={{
          background: "radial-gradient(circle, hsl(var(--glow-primary)), transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-[0.05] animate-blob-2"
        style={{
          background: "radial-gradient(circle, hsl(var(--glow-teal)), transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/3 left-1/2 w-80 h-80 rounded-full opacity-[0.04] animate-blob-1"
        style={{
          background: "radial-gradient(circle, hsl(var(--glow-rose)), transparent 70%)",
          animationDelay: "-7s",
        }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}
