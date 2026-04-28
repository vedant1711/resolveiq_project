"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { isAuthenticated, getUser } from "@/lib/auth";
import { VPMetrics } from "@/types";
import Navbar from "@/components/shared/Navbar";
import MetricCard from "@/components/vp/MetricCard";
import MttrChart from "@/components/vp/MttrChart";
import KbCaptureGauge from "@/components/vp/KbCaptureGauge";
import ActionCenter from "@/components/vp/ActionCenter";
import { Skeleton } from "@/components/ui/skeleton";

export default function VPDashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<VPMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    const user = getUser();
    if (user?.role !== "vp_ops") {
      router.replace("/dashboard/dev");
      return;
    }

    api.getVPDashboard().then((data) => {
      setMetrics(data);
      setLoading(false);
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient layers */}
      <div aria-hidden className="riq-grid-overlay pointer-events-none fixed inset-0 z-0" />
      <div aria-hidden className="riq-mesh-glow pointer-events-none fixed inset-0 z-0" />

      <Navbar />
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="riq-fade-up mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand-cyan">
              Dashboard · VP Operations
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">ROI Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            ResolveIQ impact metrics · {metrics?.period || "YTD"}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl bg-surface" />
            ))}
            {[...Array(2)].map((_, i) => (
              <Skeleton key={`mid-${i}`} className="h-28 rounded-xl bg-surface" />
            ))}
            <Skeleton className="md:col-span-3 h-56 rounded-xl bg-surface" />
            <Skeleton className="md:col-span-2 h-72 rounded-xl bg-surface" />
            <Skeleton className="h-72 rounded-xl bg-surface" />
          </div>
        ) : metrics ? (
          <>
            {/* Metric cards */}
            <div className="riq-fade-up riq-stagger-1 grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <MetricCard
                label="Total Hours Saved"
                value={metrics.total_hours_saved.toString()}
                unit="hrs"
                icon="clock"
                tone="cyan"
              />
              <MetricCard
                label="Cost Savings"
                value={metrics.dollars_saved.toLocaleString()}
                prefix="$"
                icon="dollar"
                tone="cyan"
              />
              <MetricCard
                label="Team Capacity"
                value={`${metrics.team_size} engineers`}
                subtext={`@ $${metrics.avg_hourly_rate}/hr avg`}
                icon="team"
                tone="blue"
              />
            </div>

            <div className="riq-fade-up riq-stagger-2 grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <MetricCard
                label="Time Spent Searching"
                value={`${metrics.time_spent_searching_hours}`}
                unit="hrs"
                subtext="Personal time saved"
                icon="clock"
                tone="cyan"
              />
              <MetricCard
                label="Articles Contributed"
                value={`${metrics.articles_contributed}`}
                subtext="Human-in-the-loop validation"
                icon="team"
                tone="blue"
              />
            </div>

            <div className="riq-fade-up riq-stagger-3 mb-6">
              <ActionCenter drafts={metrics.drafts_pending_review} />
            </div>

            {/* Charts row */}
            <div className="riq-fade-up riq-stagger-4 grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-3">
                <MttrChart data={metrics.mttr_trend} />
              </div>
              <div className="md:col-span-2">
                <KbCaptureGauge value={metrics.kb_capture_rate} />
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
