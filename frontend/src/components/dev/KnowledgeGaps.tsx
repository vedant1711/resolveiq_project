"use client";

import type { DevDashboard } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface KnowledgeGapsProps {
  gaps: DevDashboard["knowledge_gaps"];
}

export default function KnowledgeGaps({ gaps }: KnowledgeGapsProps) {
  return (
    <Card className="border-border bg-card relative overflow-hidden">
      <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] dark:h-px bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent" />
      <CardHeader className="pb-4">
        <CardTitle className="font-display text-sm font-semibold">Knowledge Gaps</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {gaps.map((gap) => (
          <div key={gap.category} className="flex items-center justify-between">
            <span className="text-sm">{gap.category}</span>
            <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-mono text-[10px] uppercase tracking-wider">
              {gap.open_count} open
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
