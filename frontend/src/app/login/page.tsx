"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { api } from "@/lib/api";
import { setUser } from "@/lib/auth";
import { useTheme } from "@/components/shared/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const user = await api.mockLogin(username.toLowerCase().trim());
      setUser(user);
      router.push(user.redirect_to);
    } catch {
      setError("Invalid username. Try: harsh, vedant, or devika.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* ── Background: light = clean gradient, dark = immersive ambient ── */}
      <div className="absolute inset-0 bg-background" />

      {/* Light mode: subtle gradient */}
      <div
        aria-hidden
        className="dark:hidden pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #f7f8f9 0%, #eef0f4 40%, #e8edf5 100%)",
        }}
      />

      {/* Dark mode: grid backdrop */}
      <div
        aria-hidden
        className="hidden dark:block pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,212,232,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,232,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Dark mode: breathing cyan glow */}
      <div
        aria-hidden
        className="hidden dark:block riq-breathe pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(0,212,232,0.3), transparent 60%)",
        }}
      />

      {/* Dark mode: beacon sweep */}
      <div
        aria-hidden
        className="hidden dark:block riq-beacon-sweep pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(0,212,232,0.08) 30%, rgba(0,212,232,0.25) 50%, rgba(0,212,232,0.08) 70%, transparent 100%)",
          filter: "blur(2px)",
        }}
      />

      {/* Theme toggle — top right */}
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-20 flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-card hover:bg-surface-2 transition-colors"
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          className={`absolute transition-all duration-300 ${theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`}
        >
          <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          className={`absolute transition-all duration-300 ${theme === "light" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"}`}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>

      <Card className="riq-fade-up w-full max-w-md relative bg-card border-border shadow-lg dark:bg-surface/90 dark:backdrop-blur-xl dark:shadow-[0_0_80px_-20px_rgba(0,212,232,0.15)]">
        {/* Accent stripe — subtle in light, cyan in dark */}
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-cyan rounded-t-lg dark:h-px dark:from-transparent dark:via-brand-cyan/60 dark:to-transparent"
        />
        <CardHeader className="text-center space-y-4 pt-8">
          {/* Logo */}
          <div className="mx-auto relative">
            <div
              aria-hidden
              className="hidden dark:block riq-breathe absolute inset-[-40%] rounded-full bg-brand-cyan/15 blur-2xl"
            />
            <Image
              src="/resolveiq-logo.png"
              alt="ResolveIQ logo"
              width={72}
              height={72}
              className="relative dark:drop-shadow-[0_0_20px_rgba(0,212,232,0.5)]"
            />
          </div>
          <div>
            <CardTitle className="font-display text-2xl font-bold tracking-tight text-foreground">ResolveIQ</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              AI-Powered Knowledge Management for IT Teams
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-xs font-medium text-muted-foreground font-display uppercase tracking-wider">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full h-10 px-3 rounded-md bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground/60 font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                required
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-medium text-muted-foreground font-display uppercase tracking-wider">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full h-10 px-3 rounded-md bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
              />
              <p className="text-xs text-muted-foreground/60 font-mono">Any password accepted for demo</p>
            </div>

            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-display font-semibold tracking-wide transition-all duration-200 dark:riq-cta-glow dark:font-bold dark:uppercase dark:tracking-[0.15em]"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-card text-muted-foreground font-mono uppercase tracking-wider">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-10 border-border text-muted-foreground hover:bg-surface hover:text-foreground font-display text-sm transition-all"
              onClick={() => toast.info("SSO coming soon — use credentials for demo")}
            >
              <svg className="mr-2 h-4 w-4 text-brand-blue" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.2 3.6L6.4 8.4c-.8.8-.8 2 0 2.8l4.8 4.8c.8.8 2 .8 2.8 0l4.8-4.8c.8-.8.8-2 0-2.8L14 3.6c-.8-.8-2-.8-2.8 0z" />
              </svg>
              SSO with Atlassian
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-border/60">
            <p className="text-center font-mono text-[11px] text-muted-foreground/60 uppercase tracking-[0.15em]">
              Demo accounts: <span className="text-brand-cyan dark:text-brand-cyan font-semibold">harsh</span> (VP) · <span className="text-brand-cyan dark:text-brand-cyan font-semibold">vedant</span> · <span className="text-brand-cyan dark:text-brand-cyan font-semibold">devika</span> (Dev)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
