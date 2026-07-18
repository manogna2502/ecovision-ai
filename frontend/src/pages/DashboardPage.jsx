import React from "react";
import { ScanEye, AlertTriangle, TrendingUp, ShieldCheck, Gauge } from "lucide-react";
import { useStats } from "@/hooks/useStats";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { WeeklyTrendChart } from "@/components/dashboard/WeeklyTrendChart";
import { CompositionChart } from "@/components/dashboard/CompositionChart";
import { RecentDetectionsTable } from "@/components/dashboard/RecentDetectionsTable";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { AIAssistantPanel } from "@/components/dashboard/AIAssistantPanel";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardPage() {
  const { stats, loading, error } = useStats();

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Skeleton className="h-72 lg:col-span-2" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center">
        <AlertTriangle size={28} className="mb-3 text-warning" />
        <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  const hasData = stats && stats.total_detections > 0;
  const priorityCount = (p) => stats?.priority_breakdown?.find((x) => x.priority === p)?.count || 0;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Operations overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live data from every detection run through EcoVision AI — not sample numbers.
        </p>
      </div>

      {!hasData && (
        <div className="mb-8 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No detections yet. Run an image through AI Detection to populate this dashboard with real data.
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        <KpiCard icon={ScanEye} label="Total detections" value={stats?.total_detections || 0} tint="text-primary" />
        <KpiCard icon={AlertTriangle} label="Critical priority" value={priorityCount("Critical")} tint="text-danger" />
        <KpiCard icon={TrendingUp} label="High priority" value={priorityCount("High")} tint="text-warning" />
        <KpiCard icon={ShieldCheck} label="Avg. risk score" value={stats?.avg_risk_score || 0} decimals={1} tint="text-violet" />
        <KpiCard icon={Gauge} label="Avg. confidence" value={stats?.avg_confidence || 0} decimals={1} suffix="%" tint="text-secondary" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeeklyTrendChart data={stats?.weekly_trend || []} />
        </div>
        <CompositionChart data={stats?.label_breakdown || []} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentDetectionsTable data={stats?.recent || []} />
        </div>
        <AlertsPanel priorityBreakdown={stats?.priority_breakdown || []} />
      </div>

      <AIAssistantPanel />
    </div>
  );
}
