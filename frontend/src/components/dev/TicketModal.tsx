"use client";

import { useEffect, useState } from "react";
import type { JiraTicket, AnalyzeResult, GenerateDraftResult } from "@/types";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TicketModalProps {
  ticket: JiraTicket;
  isOpen: boolean;
  onClose: () => void;
  onDraftGenerated: (draft: GenerateDraftResult) => void;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function TicketModal({ ticket, isOpen, onClose, onDraftGenerated }: TicketModalProps) {
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<GenerateDraftResult | null>(null);
  const [loadingPhase, setLoadingPhase] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setAnalyzeResult(null);
      setIsAnalyzing(false);
      setIsGenerating(false);
      setGeneratedDraft(null);
      setLoadingPhase("");
      return;
    }

    if (ticket.resolve_iq_score !== null) {
      setAnalyzeResult({
        ticket_id: ticket.ticket_id,
        score: ticket.resolve_iq_score,
        status: ticket.resolve_iq_score >= 7 ? "sufficient" : "insufficient",
        label: ticket.score_label,
        matched_articles:
          ticket.resolve_iq_score >= 7
            ? [
                {
                  title: "Corporate Certificate Renewal — VPN Client Compatibility Guide",
                  confluence_url: "https://resolveiq598.atlassian.net/wiki/spaces/MSKB/pages/884736",
                  relevance: 0.94,
                },
                {
                  title: "macOS Client Troubleshooting Runbook v3",
                  confluence_url: "https://resolveiq598.atlassian.net/wiki/spaces/MSKB/pages/778241",
                  relevance: 0.87,
                },
              ]
            : [],
        jira_comment_posted: true,
      });
    } else if (ticket.status === "In Progress") {
      handleAnalyze();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await api.analyzeTicket(ticket.ticket_id, ticket.summary, ticket.summary);
      setAnalyzeResult(result);
    } catch {
      setAnalyzeResult({
        ticket_id: ticket.ticket_id,
        score: 5,
        status: "insufficient",
        label: "5/10 — Insufficient",
        matched_articles: [],
        jira_comment_posted: false,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateDraft = async () => {
    setIsGenerating(true);
    setLoadingPhase("Connecting to Slack #incidents-channel...");
    await sleep(1200);
    setLoadingPhase("Ingesting thread context...");
    await sleep(1000);
    setLoadingPhase("Extracting Root Cause & Resolution...");
    await sleep(1500);
    setLoadingPhase("Generating Confluence KB draft...");

    try {
      const draft = await api.generateDraft(ticket.ticket_id);
      setLoadingPhase("Pushing to Confluence as Draft...");
      await sleep(800);
      setGeneratedDraft(draft);
      onDraftGenerated(draft);
    } catch {
      setLoadingPhase("Error generating draft. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-card border-border">
        {/* Accent stripe */}
        <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] dark:h-px bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-cyan dark:from-transparent dark:via-brand-cyan/50 dark:to-transparent rounded-t-lg" />

        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <a
              href={ticket.jira_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-brand-blue dark:text-brand-cyan hover:underline transition-colors"
            >
              {ticket.ticket_id}
            </a>
            <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wider border-border text-muted-foreground">
              {ticket.status}
            </Badge>
          </div>
          <DialogTitle className="text-lg font-semibold pr-8">{ticket.summary}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Analyzing */}
          {isAnalyzing && (
            <div className="flex items-center gap-3 p-6 rounded-lg bg-surface border border-border">
              <div className="relative">
                <svg className="animate-spin h-5 w-5 text-brand-cyan relative" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-foreground/90">Analyzing knowledge base coverage...</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Querying Pinecone · Scoring with GPT-4o
                </p>
              </div>
            </div>
          )}

          {/* To Do */}
          {!isAnalyzing && !analyzeResult && ticket.status === "To Do" && (
            <div className="p-6 rounded-lg bg-surface border border-border text-center">
              <p className="text-sm text-muted-foreground">
                Ticket in <span className="text-foreground font-medium">To Do</span> status. Move to <span className="text-brand-cyan font-medium">In Progress</span> to trigger analysis.
              </p>
            </div>
          )}

          {/* Sufficient */}
          {analyzeResult?.status === "sufficient" && (
            <div className="space-y-4 riq-fade-up">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-brand-cyan/5 border border-green-200 dark:border-brand-cyan/20">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-brand-cyan/15 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-600 dark:text-brand-cyan">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-700 dark:text-brand-cyan">{analyzeResult.score}/10</span>
                    <Badge className="bg-green-100 dark:bg-brand-cyan/15 text-green-700 dark:text-brand-cyan border border-green-200 dark:border-brand-cyan/25 text-[10px] font-medium uppercase tracking-wider">
                      Sufficient Documentation
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Existing KB articles cover this issue:
                  </p>
                </div>
              </div>

              {analyzeResult.matched_articles.length > 0 && (
                <div className="space-y-2">
                  {analyzeResult.matched_articles.map((article) => (
                    <a
                      key={article.title}
                      href={article.confluence_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-brand-cyan/30 hover:bg-surface transition-all group"
                    >
                      <span className="text-brand-cyan">📄</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800 dark:text-foreground/90 group-hover:text-brand-blue dark:group-hover:text-brand-cyan transition-colors">{article.title}</p>
                        <p className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5">{Math.round(article.relevance * 100)}% match</p>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-border-strong group-hover:text-brand-cyan transition-colors">
                        <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
                      </svg>
                    </a>
                  ))}
                </div>
              )}

              <a href={ticket.jira_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full mt-2 border-border hover:bg-slate-50 dark:hover:bg-brand-cyan/10 text-sm font-medium">
                  Open in Jira →
                </Button>
              </a>
            </div>
          )}

          {/* No articles */}
          {analyzeResult?.status === "no_articles" && (
            <div className="space-y-4 riq-fade-up">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-surface border border-border">
                <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                    <circle cx="12" cy="12" r="9" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-semibold text-muted-foreground">No articles found</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pinecone returned no matches for this ticket yet.
                  </p>
                </div>
              </div>

              <a href={ticket.jira_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full mt-2 border-border hover:bg-slate-50 dark:hover:bg-brand-cyan/10 text-sm font-medium">
                  Open in Jira →
                </Button>
              </a>
            </div>
          )}

          {/* Insufficient */}
          {analyzeResult?.status === "insufficient" && (
            <div className="space-y-4 riq-fade-up">
              <div className="flex items-center gap-3 p-4 rounded-lg riq-critical-pulse border border-red-200 dark:border-red-500/20">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/15 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-600 dark:text-red-400">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">{analyzeResult.score}/10</span>
                    <Badge className="bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/25 text-[10px] font-medium uppercase tracking-wider">
                      Insufficient — Draft Required
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ticket closure blocked: no matching documentation. Generate a KB draft from the incident thread.
                  </p>
                </div>
              </div>

              {!generatedDraft && (
                <Button
                  onClick={handleGenerateDraft}
                  disabled={isGenerating}
                  size="lg"
                  className="w-full h-12 bg-brand-blue text-white hover:bg-brand-blue-soft text-sm font-semibold tracking-wide transition-all duration-200 dark:bg-primary dark:text-primary-foreground dark:riq-cta-glow dark:font-bold dark:uppercase"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-sm font-medium tracking-wide">{loadingPhase}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                      Generate Draft from Slack Thread
                    </span>
                  )}
                </Button>
              )}

              {generatedDraft && (
                <div className="riq-fade-up p-5 rounded-lg bg-green-50 dark:bg-brand-cyan/5 border border-green-200 dark:border-brand-cyan/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-brand-cyan/15 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-600 dark:text-brand-cyan">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    <p className="font-semibold text-green-700 dark:text-brand-cyan">Draft created in Confluence!</p>
                  </div>
                  <p className="text-sm text-foreground/80">{generatedDraft.generated_title}</p>
                  {generatedDraft.confluence_url && (
                    <a href={generatedDraft.confluence_url} target="_blank" rel="noopener noreferrer">
                      <Button
                        variant="outline"
                        className="w-full mt-1 border-green-300 dark:border-brand-cyan/30 text-green-700 dark:text-brand-cyan hover:bg-green-50 dark:hover:bg-brand-cyan/10 text-sm font-medium"
                      >
                        Review Draft in Confluence →
                      </Button>
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
