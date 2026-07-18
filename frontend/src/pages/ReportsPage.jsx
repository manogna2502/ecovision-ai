import React, { useState } from "react";
import { FileText, Download, AlertTriangle } from "lucide-react";
import { useStats } from "@/hooks/useStats";
import { getDetections } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ReportsPage() {
  const { stats, loading, error } = useStats();
  const [exporting, setExporting] = useState(false);

  async function exportCsv() {
    setExporting(true);
    try {
      const detections = await getDetections(500);
      const header = "id,top_label,top_confidence,risk_score,risk_level,cleanup_priority,model,created_at\n";
      const rows = detections
        .map((d) =>
          [d.id, d.top_label, d.top_confidence, d.risk_score, d.risk_level, d.cleanup_priority, d.model, d.created_at].join(",")
        )
        .join("\n");
      downloadBlob(header + rows, `ecovision-detections-${Date.now()}.csv`, "text/csv");
    } catch (err) {
      alert("Couldn't fetch detections for export — check the backend is reachable.");
    } finally {
      setExporting(false);
    }
  }

  function exportSummary() {
    if (!stats) return;
    const lines = [
      "EcoVision AI — Detection Summary Report",
      `Generated: ${new Date().toLocaleString()}`,
      "",
      `Total detections: ${stats.total_detections}`,
      `Average risk score: ${stats.avg_risk_score}`,
      `Average model confidence: ${stats.avg_confidence}%`,
      "",
      "Waste composition:",
      ...stats.label_breakdown.map((l) => `  - ${l.label}: ${l.count} (${l.pct}%)`),
      "",
      "Priority breakdown:",
      ...stats.priority_breakdown.map((p) => `  - ${p.priority}: ${p.count}`),
      "",
      "This report reflects real detections stored in the EcoVision AI database.",
    ];
    downloadBlob(lines.join("\n"), `ecovision-summary-${Date.now()}.txt`, "text/plain");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Skeleton className="h-48" />
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

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Export real detection data — these downloads are generated from your live database, not mock files.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Detection log (CSV)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Every stored detection — label, confidence, risk, priority, timestamp.
            </p>
            <Button onClick={exportCsv} disabled={exporting || !hasData}>
              <Download size={15} /> {exporting ? "Exporting..." : "Export CSV"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary report (TXT)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Totals, composition, and priority breakdown in a shareable plain-text summary.
            </p>
            <Button onClick={exportSummary} disabled={!hasData} variant="secondary">
              <FileText size={15} /> Export summary
            </Button>
          </CardContent>
        </Card>
      </div>

      {!hasData && (
        <p className="mt-6 text-sm text-muted-foreground">
          No detections yet — run a few through AI Detection first, then come back here to export.
        </p>
      )}

      <p className="mt-8 text-xs text-muted-foreground">
        PDF export and scheduled daily/weekly/monthly reports are planned — CSV and
        text summary are fully functional today and pull live from Postgres.
      </p>
    </div>
  );
}
