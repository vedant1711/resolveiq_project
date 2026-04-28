"use client";

import { Fragment, useMemo, useState } from "react";
import Image from "next/image";
import type { JiraTicket, AnalyzeResult, GenerateDraftResult } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface ActiveTicketsTableProps {
  tickets: JiraTicket[];
  onRefresh: () => void;
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "Critical": return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20";
    case "High": return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20";
    case "Medium": return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20";
    default: return "bg-muted text-muted-foreground border border-border";
  }
}

function renderScore(ticket: JiraTicket) {
  if (ticket.resolve_iq_score === null) {
    if (ticket.score_label && ticket.score_label !== "Pending") {
      return (
        <Badge variant="secondary" className="bg-surface-2 text-muted-foreground font-mono text-[10px] uppercase tracking-wider">
          {ticket.score_label}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-surface-2 text-muted-foreground font-mono text-[10px] uppercase tracking-wider">
        Pending
      </Badge>
    );
  }
  if (ticket.resolve_iq_score >= 7) {
    return (
      <Badge className="bg-green-500/10 dark:bg-brand-cyan/15 text-green-700 dark:text-brand-cyan border border-green-500/20 dark:border-brand-cyan/25 font-mono text-[10px]">
        {ticket.resolve_iq_score}/10 — Sufficient
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-mono text-[10px]">
      {ticket.resolve_iq_score}/10 — Insufficient
    </Badge>
  );
}

export default function ActiveTicketsTable({ tickets, onRefresh }: ActiveTicketsTableProps) {
  const [scoreOverrides, setScoreOverrides] = useState<Record<string, AnalyzeResult>>({});
  const [analysisResults, setAnalysisResults] = useState<Record<string, AnalyzeResult>>({});
  const [loadingTicket, setLoadingTicket] = useState<string | null>(null);
  const [draftLoadingTicket, setDraftLoadingTicket] = useState<string | null>(null);
  const [draftResults, setDraftResults] = useState<Record<string, GenerateDraftResult>>({});
  const [draftErrors, setDraftErrors] = useState<Record<string, string>>({});

  const ticketsWithScores = useMemo(() => {
    return tickets.map((ticket) => {
      const override = scoreOverrides[ticket.ticket_id];
      if (!override) return ticket;
      return {
        ...ticket,
        resolve_iq_score: override.score,
        score_label: override.label,
      };
    });
  }, [tickets, scoreOverrides]);

  const formatDate = (value: string | null) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString();
  };

  const formatDuration = (hours: number | null) => {
    if (hours === null || Number.isNaN(hours)) return "—";
    const totalHours = Math.round(hours);
    const days = Math.floor(totalHours / 24);
    const remainder = totalHours % 24;
    if (days > 0) return `${days}d ${remainder}h`;
    return `${remainder}h`;
  };

  const handleAnalyze = async (ticket: JiraTicket) => {
    setLoadingTicket(ticket.ticket_id);
    try {
      const result = await api.analyzeTicket(ticket.ticket_id, ticket.description, ticket.summary);
      setAnalysisResults((prev) => ({ ...prev, [ticket.ticket_id]: result }));
      setScoreOverrides((prev) => ({ ...prev, [ticket.ticket_id]: result }));
    } finally {
      setLoadingTicket(null);
    }
  };

  const handleTransition = async (ticket: JiraTicket, status: string) => {
    if (!status) return;
    setLoadingTicket(ticket.ticket_id);
    try {
      await api.transitionTicket(ticket.ticket_id, status);
      onRefresh();
    } finally {
      setLoadingTicket(null);
    }
  };

  const handleGenerateDraft = async (ticket: JiraTicket) => {
    setDraftLoadingTicket(ticket.ticket_id);
    setDraftErrors((prev) => ({ ...prev, [ticket.ticket_id]: "" }));
    try {
      const result = await api.generateDraft(ticket.ticket_id);
      setDraftResults((prev) => ({ ...prev, [ticket.ticket_id]: result }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate draft";
      setDraftErrors((prev) => ({ ...prev, [ticket.ticket_id]: message }));
    } finally {
      setDraftLoadingTicket(null);
    }
  };

  return (
    <>
      <Card className="riq-fade-up riq-stagger-2 border-border bg-card relative overflow-hidden">
        <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] dark:h-px bg-gradient-to-r from-transparent via-brand-cyan/25 to-transparent" />
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-sm font-semibold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-cyan riq-pulse" />
            Active Tickets
            <Badge variant="secondary" className="ml-2 bg-surface-2 text-muted-foreground font-mono text-[10px]">{ticketsWithScores.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <table className="w-full table-fixed text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-4 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Ticket</th>
                  <th className="py-3 px-4 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Summary</th>
                  <th className="py-3 px-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground hidden lg:table-cell">Reporter</th>
                  <th className="py-3 px-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground hidden lg:table-cell">Assignee</th>
                  <th className="py-3 px-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground hidden xl:table-cell">Created</th>
                  <th className="py-3 px-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground hidden xl:table-cell">Time to Resolution</th>
                  <th className="py-3 px-4 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Priority</th>
                  <th className="py-3 px-4 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Status</th>
                  <th className="py-3 px-4 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">ResolveIQ Score</th>
                  <th className="py-3 px-4 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ticketsWithScores.map((ticket) => (
                  <Fragment key={ticket.ticket_id}>
                    <tr className="border-b border-border/40 hover:bg-surface transition-colors align-top">
                      <td className="py-3 px-4">
                        <a
                          href={ticket.jira_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-mono text-brand-cyan hover:underline transition-colors"
                        >
                          {ticket.ticket_id}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground/90 whitespace-normal break-words max-w-[260px]">
                        {ticket.summary}
                      </td>
                      <td className="py-3 px-3 text-sm text-muted-foreground hidden lg:table-cell">
                        {ticket.reporter_name}
                      </td>
                      <td className="py-3 px-3 text-sm text-muted-foreground hidden lg:table-cell">
                        {ticket.assignee_name}
                      </td>
                      <td className="py-3 px-3 text-sm text-muted-foreground hidden xl:table-cell">
                        {formatDate(ticket.created_at)}
                      </td>
                      <td className="py-3 px-3 text-sm text-muted-foreground hidden xl:table-cell">
                        {formatDuration(ticket.time_to_resolution_hours)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`${getPriorityColor(ticket.priority)} font-mono text-[10px] uppercase tracking-wider`}>
                          {ticket.priority}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          className="bg-transparent border border-border rounded-md px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground"
                          value={ticket.status}
                          onChange={(event) => handleTransition(ticket, event.target.value)}
                          disabled={loadingTicket === ticket.ticket_id}
                        >
                          <option value={ticket.status}>{ticket.status}</option>
                          {ticket.allowed_transitions.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        {renderScore(ticket)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-2 min-w-[140px]">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="font-mono text-[10px] uppercase tracking-[0.15em] justify-start items-center gap-2 hover:bg-brand-cyan/10 hover:text-brand-cyan transition-colors"
                            onClick={() => handleAnalyze(ticket)}
                            disabled={loadingTicket === ticket.ticket_id}
                          >
                            {loadingTicket === ticket.ticket_id ? (
                              <span className="flex items-center gap-2">
                                <Image
                                  src="/resolveiq-logo.png"
                                  alt="ResolveIQ"
                                  width={20}
                                  height={20}
                                  className="riq-spin-fast"
                                />
                                Analyzing
                              </span>
                            ) : (
                              "Analyze"
                            )}
                          </Button>
                          <a
                            href={ticket.jira_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[10px] uppercase tracking-[0.15em] text-brand-cyan hover:underline"
                          >
                            Open Jira →
                          </a>
                        </div>
                      </td>
                    </tr>
                    {analysisResults[ticket.ticket_id] && (
                      <tr className="border-b border-border/30 bg-surface/40">
                        <td colSpan={10} className="px-4 pb-4">
                          <div className="mt-2 rounded-lg border border-border/60 bg-card/60 p-4">
                            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-2">
                              Matched Articles
                            </div>
                            {analysisResults[ticket.ticket_id].matched_articles.length === 0 ? (
                              <div className="space-y-3">
                                <div className="text-sm text-muted-foreground">No articles found.</div>
                                <div className="flex flex-wrap items-center gap-3">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="font-mono text-[10px] uppercase tracking-[0.15em]"
                                    onClick={() => handleGenerateDraft(ticket)}
                                    disabled={draftLoadingTicket === ticket.ticket_id}
                                  >
                                    {draftLoadingTicket === ticket.ticket_id ? "Generating…" : "Generate Draft from Slack"}
                                  </Button>
                                  {draftErrors[ticket.ticket_id] && (
                                    <span className="text-xs text-red-500">{draftErrors[ticket.ticket_id]}</span>
                                  )}
                                </div>
                                {draftResults[ticket.ticket_id] && (
                                  <div className="rounded-md border border-border/70 bg-surface px-3 py-2 text-sm">
                                    <div className="text-xs font-mono uppercase tracking-[0.15em] text-muted-foreground">Draft Created</div>
                                    <div className="mt-1 font-medium">{draftResults[ticket.ticket_id].generated_title}</div>
                                    {draftResults[ticket.ticket_id].confluence_url && (
                                      <a
                                        href={draftResults[ticket.ticket_id].confluence_url || undefined}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-2 inline-block text-xs font-mono text-brand-cyan hover:underline"
                                      >
                                        Review Draft in Confluence →
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {analysisResults[ticket.ticket_id].matched_articles.map((article) => (
                                  <a
                                    key={article.title}
                                    href={article.confluence_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between gap-3 rounded-md border border-border/70 bg-surface px-3 py-2 text-sm hover:border-brand-cyan/40 hover:text-brand-cyan transition-colors"
                                  >
                                    <span className="truncate">{article.title}</span>
                                    <span className="text-xs font-mono text-muted-foreground">
                                      {Math.round(article.relevance * 100)}%
                                    </span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
