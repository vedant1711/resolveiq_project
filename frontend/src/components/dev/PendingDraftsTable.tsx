"use client";

import type { KnowledgeDraft } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface PendingDraftsTableProps {
  drafts: KnowledgeDraft[];
  onRefresh: () => void;
}

export default function PendingDraftsTable({ drafts, onRefresh }: PendingDraftsTableProps) {
  const handlePublish = async (draftId: number) => {
    try {
      await api.publishDraft(draftId);
      toast.success("Draft marked as published!");
      onRefresh();
    } catch {
      toast.error("Failed to publish draft");
    }
  };

  return (
    <Card className="riq-fade-up riq-stagger-3 border-border bg-card relative overflow-hidden">
      <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] dark:h-px bg-gradient-to-r from-transparent via-brand-blue/25 to-transparent" />
      <CardHeader className="pb-4">
        <CardTitle className="font-display text-sm font-semibold flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-blue dark:text-brand-blue-soft">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Pending KB Drafts
          {drafts.length > 0 && (
            <Badge className="ml-2 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20 font-mono text-[10px] uppercase tracking-wider">
              {drafts.length} to review
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {drafts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 text-border-strong">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p className="font-mono text-xs">No pending drafts. Generate one from a ticket with insufficient KB coverage.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-surface hover:bg-surface-2 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-brand-cyan">{draft.ticket_id}</span>
                    <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20">
                      {draft.status === "pending_review" ? "Pending Review" : draft.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground/90 truncate">{draft.generated_title}</p>
                  <p className="font-mono text-[10px] text-muted-foreground/60 mt-0.5">
                    Created {new Date(draft.created_at).toLocaleDateString()} at{" "}
                    {new Date(draft.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {draft.confluence_url && (
                    <a href={draft.confluence_url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="font-mono text-[10px] uppercase tracking-wider border-border hover:border-brand-cyan/40 hover:text-brand-cyan">
                        Review →
                      </Button>
                    </a>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="font-mono text-[10px] uppercase tracking-wider text-brand-cyan hover:bg-brand-cyan/10"
                    onClick={() => handlePublish(draft.id)}
                  >
                    Publish
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
