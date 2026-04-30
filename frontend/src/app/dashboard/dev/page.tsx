"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { isAuthenticated, getUser } from "@/lib/auth";
import type { DevDashboard } from "@/types";
import Navbar from "@/components/shared/Navbar";
import StatsRow from "@/components/dev/StatsRow";
import PendingDraftsTable from "@/components/dev/PendingDraftsTable";
import ActiveTicketsTable from "@/components/dev/ActiveTicketsTable";
import InsightsGrid from "@/components/dev/InsightsGrid";
import IntegrationStatus from "@/components/dev/IntegrationStatus";
import ActivityFeed from "@/components/dev/ActivityFeed";
import KnowledgeGaps from "@/components/dev/KnowledgeGaps";
import { Skeleton } from "@/components/ui/skeleton";

export default function DevDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DevDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const d = await api.getDevDashboard();
      setData(d);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch dev dashboard:", err);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    const user = getUser();
    if (user?.role === "vp_ops") {
      router.replace("/dashboard/vp");
      return;
    }
    fetchData();
  }, [router, fetchData]);

  useEffect(() => {
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient layers */}
      <div aria-hidden className="hidden dark:block riq-grid-overlay pointer-events-none fixed inset-0 z-0" />
      <div aria-hidden className="hidden dark:block riq-mesh-glow pointer-events-none fixed inset-0 z-0" />

      <Navbar />
      <main className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="riq-fade-up mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-brand-cyan">
              Dashboard · Developer
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-foreground">Developer Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Open tickets, AI analysis, and pending KB drafts
          </p>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-28 rounded-xl bg-surface" />
              <Skeleton className="h-28 rounded-xl bg-surface" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={`insight-${i}`} className="h-28 rounded-xl bg-surface" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-xl bg-surface" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Skeleton className="lg:col-span-2 h-48 rounded-xl bg-surface" />
              <Skeleton className="h-48 rounded-xl bg-surface" />
            </div>
            <Skeleton className="h-36 rounded-xl bg-surface" />
            <Skeleton className="h-48 rounded-xl bg-surface" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            <StatsRow stats={data.stats} />
            <InsightsGrid aiCoverage={data.ai_coverage} />
            <ActiveTicketsTable
              tickets={data.open_tickets}
              onRefresh={fetchData}
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <ActivityFeed feed={data.activity_feed} />
              </div>
              <IntegrationStatus status={data.integration_status} />
            </div>
            <KnowledgeGaps gaps={data.knowledge_gaps} />
            <PendingDraftsTable drafts={data.pending_drafts} onRefresh={fetchData} />
          </div>
        ) : null}
      </main>
    </div>
  );
}
