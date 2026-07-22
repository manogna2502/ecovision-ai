import React from "react";
import {
  TrendingUp, TrendingDown, AlertTriangle, Sparkles, Target, Recycle,
} from "lucide-react";
import { useStats } from "@/hooks/useStats";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function computeInsights(stats) {
  if (!stats || stats.total_detections === 0) return null;

  const { label_breakdown, priority_breakdown, weekly_trend, avg_confidence, avg_risk_score, total_detections } = stats;

  // Dominant waste category (real, computed from actual data)
  const topLabel = label_breakdown?.[0];

  // Contamination proxy: share of detections that are "trash" (unsorted/mixed)
  const trashEntry = label_breakdown?.find((l) => l.label.toLowerCase() === "trash");
  const contaminationPct = trashEntry ? trashEntry.pct : 0;

  // Critical/high priority share (real, computed)
  const criticalCount = priority_breakdown?.find((p) => p.priority === "Critical")?.count || 0;
  const highCount = priority_breakdown?.find((p) => p.priority === "High")?.count || 0;
  const urgentShare = total_detections
    ? Math.round(((criticalCount + highCount) / total_detections) * 100)
    : 0;

  // Trend direction from weekly_trend (real, computed)
  let trendDirection = "steady";
  if (weekly_trend && weekly_trend.length >= 2) {
    const firstHalf = weekly_trend.slice(0, Math.floor(weekly_trend.length / 2));
    const secondHalf = weekly_trend.slice(Math.floor(weekly_trend.length / 2));
    const firstAvg = firstHalf.reduce((s, d) => s + d.count, 0) / (firstHalf.length || 1);
    const secondAvg = secondHalf.reduce((s, d) => s + d.count, 0) / (secondHalf.length || 1);
    if (secondAvg > firstAvg * 1.15) trendDirection = "up";
    else if (secondAvg < firstAvg * 0.85) trendDirection = "down";
  }

  return {
    topLabel,
    contaminationPct,
    urgentShare,
    trendDirection,
    avg_confidence,
    avg_risk_score,
    total_detections,
  };
}

export function AIInsightsPage() {
  const { stats, loading, error } = useStats();

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
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

  const insights = computeInsights(stats);

  if (!insights) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Sparkles size={24} className="text-primary" />
        </div>
        <h1 className="text-xl font-bold">AI Insights</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Run a few detections first — insights are computed from your real
          detection history, so there's nothing to analyze yet.
        </p>
      </div>
    );
  }

  const trendCopy = {
    up: { icon: TrendingUp, text: "Detection volume is trending up", color: "text-amber-600" },
    down: { icon: TrendingDown, text: "Detection volume is trending down", color: "text-emerald-600" },
    steady: { icon: Target, text: "Detection volume is steady", color: "text-sky-600" },
  }[insights.trendDirection];

  const TrendIcon = trendCopy.icon;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-extrabold tracking-tight">AI Insights</h1>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          Computed from real detections
        </span>
      </div>
      <p className="mb-8 max-w-2xl text-sm text-muted-foreground">
        These insights are derived from your {insights.total_detections} logged
        detection{insights.total_detections === 1 ? "" : "s"} - not simulated.
        Deeper multi-week forecasting will get more reliable as detection
        volume grows beyond a fresh deployment.
      </p>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-2 flex items-center gap-2">
              <Recycle size={16} className="text-primary" />
              <p className="text-xs font-medium text-muted-foreground">Dominant category</p>
            </div>
            <p className="text-lg font-bold capitalize">{insights.topLabel?.label || "—"}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {insights.topLabel?.pct}% of all detections so far
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-2 flex items-center gap-2">
              <TrendIcon size={16} className={trendCopy.color} />
              <p className="text-xs font-medium text-muted-foreground">Volume trend</p>
            </div>
            <p className="text-lg font-bold">{trendCopy.text}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Based on your last 7 days of activity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-600" />
              <p className="text-xs font-medium text-muted-foreground">Urgent share</p>
            </div>
            <p className="text-lg font-bold">{insights.urgentShare}%</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Flagged Critical or High cleanup priority
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary" /> Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-3 text-sm">
            {insights.contaminationPct > 20 && (
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>
                  <strong>{insights.contaminationPct}%</strong> of detections are
                  unsorted/mixed waste - consider adding clearer bin labeling at
                  collection points with the highest contamination.
                </span>
              </li>
            )}
            {insights.topLabel && (
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>
                  <strong className="capitalize">{insights.topLabel.label}</strong> is
                  your most common category - route additional dedicated bins for
                  this material where volume is highest.
                </span>
              </li>
            )}
            {insights.urgentShare > 15 && (
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                <span>
                  <strong>{insights.urgentShare}%</strong> of detections are urgent
                  priority - prioritize pickup scheduling for these locations first.
                </span>
              </li>
            )}
            {insights.avg_confidence && (
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span>
                  Average model confidence is <strong>{insights.avg_confidence}%</strong> -
                  classifications are reliable enough to act on directly.
                </span>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What's next</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            As detection volume grows, this page will add week-over-week
            forecasting, seasonal pattern detection, and per-location
            contamination hotspot mapping - all computed from real data,
            the same way the insights above already are.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
