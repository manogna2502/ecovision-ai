import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { AlertTriangle } from "lucide-react";
import { useStats } from "@/hooks/useStats";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { WeeklyTrendChart } from "@/components/dashboard/WeeklyTrendChart";
import { CompositionChart } from "@/components/dashboard/CompositionChart";
import { Skeleton } from "@/components/ui/skeleton";

const PRIORITY_COLORS = { Critical: "#EF4444", High: "#F59E0B", Medium: "#06B6D4", Low: "#10B981" };

export function AnalyticsPage() {
  const { stats, loading, error } = useStats();

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-72" />
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

  const priorityData = stats?.priority_breakdown || [];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Real detection history, broken down by trend, composition, and priority.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <WeeklyTrendChart data={stats?.weekly_trend || []} />
        <CompositionChart data={stats?.label_breakdown || []} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detections by cleanup priority</CardTitle>
        </CardHeader>
        <CardContent>
          {priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="priority" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid hsl(var(--border))",
                    fontSize: 13,
                    background: "hsl(var(--card))",
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {priorityData.map((d, i) => (
                    <Cell key={i} fill={PRIORITY_COLORS[d.priority] || "#2563EB"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">No data yet</p>
          )}
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground">
        Forecasting (seasonal trends, weather correlation, cost savings) needs more
        historical data than a fresh deployment has — planned once detection volume grows.
      </p>
    </div>
  );
}
