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
import { FibroSenseLogo } from "./fibrosense-logo";

const navItems = [
  {
    href: "/",
    label: "Dashboard",
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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-16 md:flex-col md:fixed md:inset-y-0 z-50">
      <div className="flex flex-col items-center h-full glass-strong">
        {/* Logo */}
        <div className="flex items-center justify-center h-16">
          <motion.div
            className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <FibroSenseLogo className="h-5 w-5 text-white" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col items-center gap-1 py-4 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={cn(
                    "relative flex items-center justify-center rounded-xl h-10 w-10 transition-colors group",
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] shadow-lg"
                      layoutId="sidebar-active"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      style={{
                        boxShadow: "0 4px 15px -3px hsl(var(--glow-primary) / 0.3)",
                      }}
                    />
                  )}
                  <span className="relative z-10">{item.icon}</span>
                  {/* Tooltip */}
                  <div className="absolute left-full ml-2 px-2 py-1 rounded-md bg-foreground text-background text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg">
                    {item.label}
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom indicator */}
        <div className="pb-4 flex flex-col items-center">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Secure &middot; Local data" />
        </div>
      </div>
    </aside>
  );
}
