import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PRIORITY_VARIANT = {
  Critical: "danger",
  High: "warning",
  Medium: "secondary",
  Low: "accent",
};

export function RecentDetectionsTable({ data }) {
  const hasData = data && data.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent detections</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2.5 pr-3 font-medium">Type</th>
                  <th className="pb-2.5 pr-3 font-medium">Confidence</th>
                  <th className="pb-2.5 pr-3 font-medium">Risk</th>
                  <th className="pb-2.5 pr-3 font-medium">Priority</th>
                  <th className="pb-2.5 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.id} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5 pr-3 font-semibold capitalize">{r.top_label}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{r.top_confidence}%</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{r.risk_level}</td>
                    <td className="py-2.5 pr-3">
                      <Badge variant={PRIORITY_VARIANT[r.cleanup_priority] || "secondary"}>
                        {r.cleanup_priority}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nothing here yet — run a detection to see it show up.</p>
        )}
      </CardContent>
    </Card>
  );
}
