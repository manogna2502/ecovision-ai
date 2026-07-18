import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const LABEL_COLORS = {
  plastic: "#2563EB",
  cardboard: "#F59E0B",
  paper: "#CBD5E1",
  metal: "#8B5CF6",
  glass: "#06B6D4",
  trash: "#EF4444",
};

export function CompositionChart({ data }) {
  const hasData = data && data.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Waste composition</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data} dataKey="pct" nameKey="label" innerRadius={54} outerRadius={80} paddingAngle={3}>
                  {data.map((d, i) => (
                    <Cell key={i} fill={LABEL_COLORS[d.label?.toLowerCase()] || "#2563EB"} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid hsl(var(--border))",
                    fontSize: 13,
                    background: "hsl(var(--card))",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              {data.map((d) => (
                <div key={d.label} className="flex items-center gap-1.5 text-xs capitalize text-muted-foreground">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: LABEL_COLORS[d.label?.toLowerCase()] || "#2563EB" }}
                  />
                  {d.label} {d.pct}%
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">
            No data yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}
