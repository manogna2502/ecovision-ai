import React from "react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { useStats } from "@/hooks/useStats";

export function StatsSection() {
  const { stats, loading, error } = useStats();
  const hasData = stats && stats.total_detections > 0;

  const criticalCount = stats?.priority_breakdown?.find((p) => p.priority === "Critical")?.count || 0;
  const topLabel = stats?.label_breakdown?.[0]?.label;

  const STATS = [
    { value: stats?.total_detections || 0, suffix: "", label: "Real detections logged" },
    { value: stats?.avg_confidence || 0, decimals: 1, suffix: "%", label: "Avg. model confidence" },
    { value: stats?.avg_risk_score || 0, decimals: 1, suffix: "", label: "Avg. risk score" },
    { value: criticalCount, suffix: "", label: "Critical-priority items" },
  ];

  if (loading) {
    return (
      <section className="border-y border-border/60 bg-card/30 py-16 text-center text-sm text-muted-foreground">
        Loading live stats...
      </section>
    );
  }

  if (error) {
    return (
      <section className="border-y border-border/60 bg-card/30 py-16 text-center text-sm text-muted-foreground">
        Couldn't reach the backend to load live stats.
      </section>
    );
  }

  return (
    <section className="border-y border-border/60 bg-card/30">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {!hasData ? (
          <p className="text-center text-sm text-muted-foreground">
            No detections yet — head to AI Detection to run your first real scan, then this
            section fills in with your own numbers.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="bg-gradient-to-br from-primary to-secondary bg-clip-text text-3xl font-extrabold text-transparent">
                    <AnimatedCounter value={s.value} decimals={s.decimals} suffix={s.suffix} />
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-xs text-muted-foreground">
              Every number above comes straight from your Postgres database
              {topLabel ? ` — most detected waste type so far: ${topLabel}.` : "."}
            </p>
          </>
        )}
      </div>
    </section>
  );
}