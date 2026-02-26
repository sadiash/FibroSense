"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  EnvelopeSimpleIcon,
  LockIcon,
  SpinnerIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { FibroSenseLogo } from "@/components/layout/fibrosense-logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

export default function RegisterPage() {
  const { register } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Client-side validation
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.";
      toast({
        title: "Registration failed",
        description: message.includes("409")
          ? "An account with this email already exists."
          : message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

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
            <h1 className="text-2xl font-bold gradient-text">
              Create Account
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Start tracking your fibromyalgia patterns
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Label htmlFor="full-name" className="text-xs font-medium">
                Full Name
              </Label>
              <div className="relative">
                <UserIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                  weight="duotone"
                />
                <Input
                  id="full-name"
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-9 h-10 rounded-xl bg-background/50 border-border/50 focus:border-primary/50"
                  autoComplete="name"
                  disabled={isSubmitting}
                />
              </div>
            </motion.div>

            {/* Email */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
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
                  disabled={isSubmitting}
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
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
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 h-10 rounded-xl bg-background/50 border-border/50 focus:border-primary/50"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                />
              </div>
            </motion.div>

            {/* Confirm Password */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Label
                htmlFor="confirm-password"
                className="text-xs font-medium"
              >
                Confirm Password
              </Label>
              <div className="relative">
                <LockIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                  weight="duotone"
                />
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-9 h-10 rounded-xl bg-background/50 border-border/50 focus:border-primary/50"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                />
              </div>
            </motion.div>

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="pt-1"
            >
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <SpinnerIcon
                      className="h-4 w-4 animate-spin"
                      weight="bold"
                    />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </motion.div>
          </form>

          {/* Login link */}
          <motion.p
            className="text-center text-sm text-muted-foreground mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline transition-colors"
            >
              Sign in
            </Link>
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
