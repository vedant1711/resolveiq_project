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
      <span aria-hidden className="hidden dark:block absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent" />
      <CardHeader className="pb-4 border-b border-border mb-4">
        <CardTitle className="text-base font-semibold">Integration Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Jira Webhook</span>
          <Badge className="bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 dark:border dark:border-green-500/20 font-medium text-xs">
            {status.jira_webhook}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Confluence Sync</span>
          <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:border dark:border-blue-500/20 font-medium text-xs">
            {status.confluence_sync.status}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          Last sync: {new Date(status.confluence_sync.last_sync_at).toLocaleString()} · {status.confluence_sync.chunks_indexed} chunks
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Pinecone</span>
          <Badge className="bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 dark:border dark:border-green-500/20 font-medium text-xs">
            {status.pinecone}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">OpenAI</span>
          <Badge className="bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 dark:border dark:border-green-500/20 font-medium text-xs">
            {status.openai}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
