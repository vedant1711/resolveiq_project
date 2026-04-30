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
      <span aria-hidden className="hidden dark:block absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent" />
      <CardHeader className="pb-4 border-b border-border mb-4">
        <CardTitle className="text-base font-semibold">Knowledge Gaps</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {gaps.map((gap) => (
          <div key={gap.category} className="flex items-center justify-between">
            <span className="text-sm font-medium">{gap.category}</span>
            <Badge className="bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 dark:border dark:border-red-500/20 font-medium text-xs">
              {gap.open_count} open
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
