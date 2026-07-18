import React from "react";
import { AlertTriangle, TrendingUp, Info, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const CONFIG = {
  Critical: { icon: AlertTriangle, tint: "text-danger bg-danger/10" },
  High: { icon: TrendingUp, tint: "text-warning bg-warning/10" },
  Medium: { icon: Info, tint: "text-secondary bg-secondary/10" },
  Low: { icon: CheckCircle2, tint: "text-accent bg-accent/10" },
};

export function AlertsPanel({ priorityBreakdown }) {
  const hasData = priorityBreakdown && priorityBreakdown.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alerts by priority</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {hasData ? (
          priorityBreakdown.map((p) => {
            const cfg = CONFIG[p.priority] || CONFIG.Medium;
            return (
              <div key={p.priority} className="flex items-center justify-between rounded-xl border border-border/60 p-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${cfg.tint}`}>
                    <cfg.icon size={15} />
                  </div>
                  <span className="text-sm font-medium">{p.priority}</span>
                </div>
                <span className="text-sm font-bold">{p.count}</span>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground">No alerts yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
