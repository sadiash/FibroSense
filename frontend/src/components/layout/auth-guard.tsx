"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { FibroSenseLogo } from "./fibrosense-logo";

const PUBLIC_PATHS = ["/login", "/register"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !isPublicPath) {
      router.replace("/login");
    }

    if (isAuthenticated && isPublicPath) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, isPublicPath, pathname, router]);

  // Loading screen
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-[0.07]"
            style={{
              background:
                "radial-gradient(circle, hsl(var(--glow-primary)), transparent 70%)",
            }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-[0.05]"
            style={{
              background:
                "radial-gradient(circle, hsl(var(--glow-lavender)), transparent 70%)",
            }}
          />
        </div>

        <div className="flex flex-col items-center gap-6">
          {/* Spinning butterfly logo */}
          <motion.div
            className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] flex items-center justify-center shadow-lg"
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <FibroSenseLogo className="h-9 w-9 text-white" />
          </motion.div>

          {/* Brand name */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h1 className="text-xl font-bold gradient-text">FibroSense</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Loading your dashboard...
            </p>
          </motion.div>

          {/* Pulse bar */}
          <div className="w-32 h-1 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))]"
              animate={{ x: ["-100%", "100%"] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ width: "50%" }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Waiting for redirect
  if (!isAuthenticated && !isPublicPath) {
    return null;
  }
  if (isAuthenticated && isPublicPath) {
    return null;
  }

  return <>{children}</>;
}
