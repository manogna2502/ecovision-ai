import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, Activity, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useStats } from "@/hooks/useStats";

export function InsightsSection() {
  const { stats, loading } = useStats();
  const hasData = stats && stats.total_detections > 0;

  if (loading) return null;

  const criticalCount = stats?.priority_breakdown?.find((p) => p.priority === "Critical")?.count || 0;
  const topLabel = stats?.label_breakdown?.[0];
  const secondLabel = stats?.label_breakdown?.[1];

  const insights = hasData
    ? [
        criticalCount > 0 && {
          icon: AlertTriangle,
          tint: "text-danger",
          text: `${criticalCount} detection${criticalCount === 1 ? " needs" : "s need"} critical-priority cleanup right now.`,
        },
        topLabel && {
          icon: TrendingUp,
          tint: "text-primary",
          text: `${topLabel.label} is the most common waste type detected so far, at ${topLabel.pct}% of scans.`,
        },
        {
          icon: Activity,
          tint: "text-secondary",
          text: `The model has averaged ${stats.avg_confidence}% confidence across ${stats.total_detections} real detection${stats.total_detections === 1 ? "" : "s"}.`,
        },
        secondLabel && {
          icon: Zap,
          tint: "text-violet",
          text: `${secondLabel.label} makes up ${secondLabel.pct}% of detections — worth watching if it keeps climbing.`,
        },
      ].filter(Boolean)
    : [];

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-12 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Zap size={17} />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">AI insights</h2>
      </div>

      {!hasData ? (
        <p className="text-sm text-muted-foreground">
          Insights generate automatically once you have a few real detections logged —
          run some images through AI Detection to see this section come alive.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {insights.map((ins, i) => (
              <motion.div
                key={ins.text}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                <Card className="flex h-full items-start gap-3 p-5">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted ${ins.tint}`}>
                    <ins.icon size={16} />
                  </div>
                  <p className="text-sm font-medium leading-relaxed">{ins.text}</p>
                </Card>
              </motion.div>
            ))}
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Generated from your real detection history — not sample data.
          </p>
        </>
      )}
    </section>
  );
}