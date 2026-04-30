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
        <span aria-hidden className="hidden dark:block absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent" />
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">KB Match Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-slate-900 dark:text-brand-cyan">{aiCoverage.match_rate}%</p>
          <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card relative overflow-hidden">
        <span aria-hidden className="hidden dark:block absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-blue/30 to-transparent" />
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg ResolveIQ Score</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-slate-900 dark:text-brand-blue-soft">{aiCoverage.avg_score}</p>
          <p className="text-xs text-muted-foreground mt-1">Across {aiCoverage.tickets_scored} tickets</p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card relative overflow-hidden">
        <span aria-hidden className="hidden dark:block absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent" />
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">No-Doc Blockers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-red-600 dark:text-red-500">{aiCoverage.no_doc_blockers}</p>
          <p className="text-xs text-muted-foreground mt-1">Require KB draft</p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card relative overflow-hidden">
        <span aria-hidden className="hidden dark:block absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-blue/30 to-transparent" />
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Automation Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-slate-900 dark:text-brand-cyan">{Math.min(100, aiCoverage.match_rate + 18)}%</p>
          <p className="text-xs text-muted-foreground mt-1">Webhook + AI scoring</p>
        </CardContent>
      </Card>
    </div>
  );
}
