"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/components/shared/ThemeProvider";

interface KbCaptureGaugeProps {
  value: number;
}

export default function KbCaptureGauge({ value }: KbCaptureGaugeProps) {
  const circumference = 2 * Math.PI * 60;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Card className="border-border bg-card h-full relative overflow-hidden">
      <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] dark:h-px bg-gradient-to-r from-transparent via-brand-blue/30 to-transparent" />
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand-blue dark:bg-brand-blue-soft riq-pulse" />
          <CardTitle className="font-display text-sm font-semibold">KB Capture Rate</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground font-mono">
          Resolved incidents with KB articles
        </p>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pt-2">
        <div className="relative w-40 h-40">
          <svg className="w-40 h-40 -rotate-90" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="60" stroke={isDark ? "#1f2942" : "#dfe1e6"} strokeWidth="10" fill="none" />
            <circle
              cx="70"
              cy="70"
              r="60"
              stroke="url(#gaugeGradient)"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={isDark ? "#00d4e8" : "#0079bf"} />
                <stop offset="100%" stopColor={isDark ? "#1e5fd4" : "#0052cc"} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-4xl font-bold text-brand-cyan">{value}%</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">captured</span>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
          <span className="text-muted-foreground font-mono text-xs">Target: 95%</span>
          <span className="text-brand-cyan font-mono text-xs ml-1">↑ 12% from Q3</span>
        </div>
      </CardContent>
    </Card>
  );
}
