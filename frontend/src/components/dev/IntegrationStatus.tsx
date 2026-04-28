"use client";

import type { DevDashboard } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface IntegrationStatusProps {
  status: DevDashboard["integration_status"];
}

export default function IntegrationStatus({ status }: IntegrationStatusProps) {
  return (
    <Card className="border-border bg-card relative overflow-hidden">
      <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] dark:h-px bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent" />
      <CardHeader className="pb-4">
        <CardTitle className="font-display text-sm font-semibold">Integration Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Jira Webhook</span>
          <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20 font-mono text-[10px] uppercase tracking-wider">
            {status.jira_webhook}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Confluence Sync</span>
          <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 font-mono text-[10px] uppercase tracking-wider">
            {status.confluence_sync.status}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground font-mono">
          Last sync: {new Date(status.confluence_sync.last_sync_at).toLocaleString()} · {status.confluence_sync.chunks_indexed} chunks
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Pinecone</span>
          <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20 font-mono text-[10px] uppercase tracking-wider">
            {status.pinecone}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">OpenAI</span>
          <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20 font-mono text-[10px] uppercase tracking-wider">
            {status.openai}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
