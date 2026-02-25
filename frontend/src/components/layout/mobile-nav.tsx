"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/log", label: "Log" },
  { href: "/correlations", label: "Correlate" },
  { href: "/settings", label: "Settings" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t bg-card">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors",
            pathname === item.href
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          <span className="text-lg">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
