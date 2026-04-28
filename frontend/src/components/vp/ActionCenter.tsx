"use client";

import type { KnowledgeDraft } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ActionCenterProps {
  drafts: KnowledgeDraft[];
}

export default function ActionCenter({ drafts }: ActionCenterProps) {
  return (
    <Card className="border-border bg-card relative overflow-hidden">
      <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] dark:h-px bg-gradient-to-r from-transparent via-brand-blue/30 to-transparent" />
      <CardHeader className="pb-4">
        <CardTitle className="font-display text-sm font-semibold flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand-blue riq-pulse" />
          Action Center
          <Badge variant="secondary" className="ml-2 bg-surface-2 text-muted-foreground font-mono text-[10px]">
            VP Operations
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Drafts Pending Review</p>
            <p className="text-xs text-muted-foreground font-mono">AI-generated articles awaiting approval</p>
          </div>
          <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20 font-mono text-[10px] uppercase tracking-wider">
            {drafts.length} pending
          </Badge>
        </div>

        {drafts.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4">No drafts awaiting review.</div>
        ) : (
          <div className="space-y-2">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-brand-cyan">
                      {draft.ticket_id}
                    </span>
                    <Badge variant="secondary" className="font-mono text-[10px] bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20">
                      Pending Review
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground/90 truncate mt-1">{draft.generated_title}</p>
                </div>
                {draft.confluence_url && (
                  <a href={draft.confluence_url} target="_blank" rel="noopener noreferrer">
                    <Button
                      size="sm"
                      variant="outline"
                      className="font-mono text-[10px] uppercase tracking-wider border-border hover:border-brand-cyan/40 hover:text-brand-cyan"
                    >
                      Review →
                    </Button>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
