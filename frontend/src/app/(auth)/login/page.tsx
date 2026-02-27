"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { EnvelopeSimpleIcon, LockIcon, SpinnerIcon, EyeIcon } from "@phosphor-icons/react";
import { FibroSenseLogo } from "@/components/layout/fibrosense-logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { seedDemoData } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const GUEST_EMAIL = "guest@fibrosense.app";
const GUEST_PASSWORD = "TryFibroSense1!";

export default function LoginPage() {
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast({
        title: "Missing fields",
        description: "Please enter your email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      toast({
        title: "Sign in failed",
        description: message.includes("401")
          ? "Invalid email or password."
          : message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGuestLogin() {
    setIsGuestLoading(true);
    try {
      // Try login first; if account doesn't exist, register it
      try {
        await login({ email: GUEST_EMAIL, password: GUEST_PASSWORD });
      } catch {
        await register({
          email: GUEST_EMAIL,
          password: GUEST_PASSWORD,
          full_name: "Guest Explorer",
        });
      }
      // Seed demo data if the account is empty (no-ops if data exists)
      try {
        await seedDemoData();
      } catch {
        // Non-critical — data may already exist
      }
    } catch {
      toast({
        title: "Guest access unavailable",
        description: "Something went wrong. Please try again or create an account.",
        variant: "destructive",
      });
    } finally {
      setIsGuestLoading(false);
    }
  }

  const anyLoading = isSubmitting || isGuestLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full max-w-sm"
    >
      {/* Glass card */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Gradient border effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] opacity-20" />
        <div className="relative m-[1px] rounded-2xl glass-strong p-8">
          {/* Logo */}
          <motion.div
            className="flex flex-col items-center mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] flex items-center justify-center shadow-lg mb-4">
              <FibroSenseLogo className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">Welcome Back</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to your FibroSense account
            </p>
          </motion.div>

          {/* Guest access button */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={anyLoading}
              className="w-full h-10 rounded-xl text-sm font-semibold border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGuestLoading ? (
                <>
                  <SpinnerIcon className="h-4 w-4 animate-spin" weight="bold" />
                  Loading demo...
                </>
              ) : (
                <>
                  <EyeIcon className="h-4 w-4" weight="duotone" />
                  Try as Guest
                </>
              )}
            </button>
            <p className="text-[11px] text-muted-foreground text-center mt-1.5">
              Explore with 3 months of sample data — no signup needed
            </p>
          </motion.div>

          {/* Divider */}
          <motion.div
            className="relative mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-card/80 text-muted-foreground">or sign in</span>
            </div>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Label htmlFor="email" className="text-xs font-medium">
                Email
              </Label>
              <div className="relative">
                <EnvelopeSimpleIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                  weight="duotone"
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-10 rounded-xl bg-background/50 border-border/50 focus:border-primary/50"
                  autoComplete="email"
                  disabled={anyLoading}
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Label htmlFor="password" className="text-xs font-medium">
                Password
              </Label>
              <div className="relative">
                <LockIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                  weight="duotone"
                />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 h-10 rounded-xl bg-background/50 border-border/50 focus:border-primary/50"
                  autoComplete="current-password"
                  disabled={anyLoading}
                />
              </div>
            </motion.div>

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <button
                type="submit"
                disabled={anyLoading}
                className="w-full h-10 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <SpinnerIcon className="h-4 w-4 animate-spin" weight="bold" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </motion.div>
          </form>

          {/* Register link */}
          <motion.p
            className="text-center text-sm text-muted-foreground mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:underline transition-colors"
            >
              Create one
            </Link>
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
