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
      <div aria-hidden className="hidden dark:block riq-grid-overlay pointer-events-none fixed inset-0 z-0" />
      <div aria-hidden className="hidden dark:block riq-mesh-glow pointer-events-none fixed inset-0 z-0" />

      <Navbar />
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="riq-fade-up mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-brand-cyan">
              Dashboard · VP Operations
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-foreground">ROI Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            ResolveIQ impact metrics · {metrics?.period || "YTD"}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl bg-surface" />
            ))}
          </div>
        ) : metrics ? (
          <>
            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 riq-fade-up riq-stagger-1">
              <div className="bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col">
                <span className="text-xs font-semibold text-slate-500 dark:text-muted-foreground uppercase tracking-wider">COST SAVINGS YTD</span>
                <span className="text-4xl font-bold text-slate-900 dark:text-foreground mt-2">$54,200</span>
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full mt-3 inline-flex w-fit">↑ 12% vs Q1</span>
              </div>
              <div className="bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col">
                <span className="text-xs font-semibold text-slate-500 dark:text-muted-foreground uppercase tracking-wider">HOURS RECOVERED</span>
                <span className="text-4xl font-bold text-slate-900 dark:text-foreground mt-2">312</span>
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full mt-3 inline-flex w-fit">↑ 18% vs Q1</span>
              </div>
              <div className="bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col">
                <span className="text-xs font-semibold text-slate-500 dark:text-muted-foreground uppercase tracking-wider">ESCALATIONS DEFLECTED</span>
                <span className="text-4xl font-bold text-slate-900 dark:text-foreground mt-2">42</span>
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full mt-3 inline-flex w-fit">↑ 25% vs baseline</span>
              </div>
              <div className="bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col">
                <span className="text-xs font-semibold text-slate-500 dark:text-muted-foreground uppercase tracking-wider">CONTEXT-DRIVEN RESOLUTIONS</span>
                <span className="text-4xl font-bold text-slate-900 dark:text-foreground mt-2">105</span>
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full mt-3 inline-flex w-fit">↑ 20% vs Q1</span>
              </div>
            </div>

            {/* Bottom Section: CSS-Only Mock Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 riq-fade-up riq-stagger-2">
              {/* Left Card: MTTR */}
              <div className="bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-foreground">Mean Time to Resolution (MTTR)</h3>
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">-44% Reduction</span>
                </div>
                <div className="flex flex-col gap-4 mt-2">
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 dark:text-muted-foreground mb-1">
                      <span>Industry Baseline</span>
                      <span>2.5 hrs</span>
                    </div>
                    <div className="w-full h-8 bg-slate-100 dark:bg-surface-2 rounded-md overflow-hidden relative">
                      <div className="absolute top-0 left-0 h-full bg-slate-200 dark:bg-surface rounded-md w-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 dark:text-muted-foreground mb-1">
                      <span className="font-semibold text-slate-700 dark:text-foreground">ResolveIQ Assisted</span>
                      <span className="font-semibold text-slate-700 dark:text-foreground">1.4 hrs</span>
                    </div>
                    <div className="w-full h-8 bg-slate-100 dark:bg-surface-2 rounded-md overflow-hidden relative">
                      <div className="absolute top-0 left-0 h-full bg-brand-blue dark:bg-brand-cyan rounded-md" style={{ width: "56%" }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Card: KB Capture Rate */}
              <div className="bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col relative overflow-hidden">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-foreground mb-1">KB Capture Rate</h3>
                <p className="text-xs text-slate-500 dark:text-muted-foreground mb-6">Resolved incidents successfully mapped to knowledge base.</p>
                <div className="flex-1 flex items-center justify-center -mt-4">
                  <KbCaptureGauge value={88} />
                </div>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
