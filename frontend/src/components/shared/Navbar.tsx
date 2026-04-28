"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getUser, logout } from "@/lib/auth";
import { useTheme } from "@/components/shared/ThemeProvider";
import type { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Navbar() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    setUserState(getUser());
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-xl">
      {/* Accent line — dark only */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-cyan/40 to-transparent dark:block hidden"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <Image
              src="/resolveiq-logo.png"
              alt="ResolveIQ"
              width={28}
              height={28}
              className="dark:drop-shadow-[0_0_10px_rgba(0,212,232,0.4)]"
            />
            <span className="font-display text-base font-bold tracking-tight text-foreground">ResolveIQ</span>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-surface hover:bg-surface-2 transition-colors"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title={theme === "dark" ? "Switch to Professional Light" : "Switch to Immersive Dark"}
            >
              {/* Sun icon */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`absolute transition-all duration-300 ${
                  theme === "dark"
                    ? "rotate-0 scale-100 opacity-100"
                    : "-rotate-90 scale-0 opacity-0"
                }`}
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
              {/* Moon icon */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`absolute transition-all duration-300 ${
                  theme === "light"
                    ? "rotate-0 scale-100 opacity-100"
                    : "rotate-90 scale-0 opacity-0"
                }`}
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </button>

            {/* User info */}
            {user && (
              <>
                <div className="hidden sm:flex items-center gap-2.5">
                  <span className="text-sm text-muted-foreground">{user.display_name}</span>
                  <Badge
                    variant="secondary"
                    className={
                      user.role === "vp_ops"
                        ? "bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue dark:text-brand-blue-soft border border-brand-blue/20 dark:border-brand-blue/30 font-mono text-[10px] uppercase tracking-[0.15em]"
                        : "bg-brand-cyan/10 dark:bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/20 dark:border-brand-cyan/25 font-mono text-[10px] uppercase tracking-[0.15em]"
                    }
                  >
                    {user.role === "vp_ops" ? "VP Operations" : "Developer"}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-brand-cyan font-mono text-xs uppercase tracking-wider"
                >
                  Sign Out
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
