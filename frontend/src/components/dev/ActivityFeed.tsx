"use client";

import type { DevDashboard } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityFeedProps {
  feed: DevDashboard["activity_feed"];
}

export default function ActivityFeed({ feed }: ActivityFeedProps) {
  return (
    <Card className="border-border bg-card relative overflow-hidden">
      <span aria-hidden className="hidden dark:block absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-blue/30 to-transparent" />
      <CardHeader className="pb-4 border-b border-border mb-4">
        <CardTitle className="text-base font-semibold">Activity Feed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {feed.map((event, idx) => (
          <div key={`${event.type}-${idx}`} className="flex items-start gap-3">
            <div className="mt-1.5 h-2 w-2 rounded-full bg-brand-cyan" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800 dark:text-foreground/90">{event.message}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(event.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
