"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export function Header() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 border-b bg-card">
      <div className="md:hidden">
        <h1 className="text-lg font-semibold">FibroSense</h1>
      </div>
      <div className="hidden md:block">
        <span className="text-sm text-muted-foreground">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </span>
      </div>
      <Button variant="ghost" size="sm" onClick={toggleTheme}>
        {isDark ? "Light" : "Dark"}
      </Button>
    </header>
  );
}
