"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DevDashboard } from "@/types";

interface InsightsGridProps {
  aiCoverage: DevDashboard["ai_coverage"];
}

export default function InsightsGrid({ aiCoverage }: InsightsGridProps) {
  return (
    <div className="riq-fade-up riq-stagger-2 grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="border-border bg-card relative overflow-hidden">
        <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] dark:h-px bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent" />
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-sm font-semibold">KB Match Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-display text-3xl font-bold text-brand-cyan">{aiCoverage.match_rate}%</p>
          <p className="text-xs text-muted-foreground font-mono">Last 7 days</p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card relative overflow-hidden">
        <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] dark:h-px bg-gradient-to-r from-transparent via-brand-blue/30 to-transparent" />
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-sm font-semibold">Avg ResolveIQ Score</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-display text-3xl font-bold text-brand-blue dark:text-brand-blue-soft">{aiCoverage.avg_score}</p>
          <p className="text-xs text-muted-foreground font-mono">Across {aiCoverage.tickets_scored} tickets</p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card relative overflow-hidden">
        <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] dark:h-px bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent" />
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-sm font-semibold">No-Doc Blockers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-display text-3xl font-bold text-red-500">{aiCoverage.no_doc_blockers}</p>
          <p className="text-xs text-muted-foreground font-mono">Require KB draft</p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card relative overflow-hidden">
        <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] dark:h-px bg-gradient-to-r from-transparent via-brand-blue/30 to-transparent" />
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-sm font-semibold">Automation Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-display text-3xl font-bold text-brand-cyan">{Math.min(100, aiCoverage.match_rate + 18)}%</p>
          <p className="text-xs text-muted-foreground font-mono">Webhook + AI scoring</p>
        </CardContent>
      </Card>
    </div>
  );
}
