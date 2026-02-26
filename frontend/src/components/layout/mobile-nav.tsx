"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  SquaresFourIcon,
  ClipboardTextIcon,
  SparkleIcon,
  GearSixIcon,
} from "@phosphor-icons/react";

const navItems = [
  {
    href: "/",
    label: "Home",
    icon: <SquaresFourIcon className="h-5 w-5" weight="duotone" />,
  },
  {
    href: "/log",
    label: "Log",
    icon: <ClipboardTextIcon className="h-5 w-5" weight="duotone" />,
  },
  {
    href: "/correlations",
    label: "Insights",
    icon: <SparkleIcon className="h-5 w-5" weight="duotone" />,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: <GearSixIcon className="h-5 w-5" weight="duotone" />,
  },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <motion.nav
        className="flex items-center justify-around rounded-2xl glass-strong py-2 px-2 shadow-lg"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.5 }}
        style={{
          boxShadow: "0 -4px 30px -8px hsl(var(--glow-primary) / 0.1), 0 4px 20px -4px rgba(0,0,0,0.15)",
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="relative flex-1">
              <motion.div
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1.5 rounded-xl relative",
                  isActive ? "text-primary-foreground" : "text-muted-foreground"
                )}
                whileTap={{ scale: 0.9 }}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))]"
                    layoutId="mobile-nav-active"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    style={{
                      boxShadow: "0 2px 10px -2px hsl(var(--glow-primary) / 0.4)",
                    }}
                  />
                )}
                <span className="relative z-10">{item.icon}</span>
                <span className="relative z-10 text-[10px] font-medium">
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </motion.nav>
    </div>
  );
}
