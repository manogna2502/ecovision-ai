import React, { useEffect, useState } from "react";
import { Trash2, MapPin, AlertTriangle, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDetections } from "@/lib/api";

const RISK_TO_FILL = {
  Critical: 92,
  High: 74,
  Medium: 48,
  Low: 22,
};

// Category -> a representative collection-point name, so grouping real
// detections by category reads like real bin locations rather than an
// arbitrary list.
const CATEGORY_LOCATION = {
  plastic: "Plastic Collection Point",
  paper: "Paper & Cardboard Point",
  cardboard: "Paper & Cardboard Point",
  glass: "Glass Collection Point",
  metal: "Metal Collection Point",
  trash: "General/Mixed Waste Point",
};

function fillBarColor(fill) {
  if (fill >= 75) return "bg-red-500";
  if (fill >= 50) return "bg-amber-500";
  return "bg-emerald-500";
}

function statusFromFill(fill) {
  if (fill >= 75) return { label: "Needs Pickup", style: "bg-red-500/10 text-red-600" };
  if (fill >= 50) return { label: "Filling Up", style: "bg-amber-500/10 text-amber-600" };
  return { label: "Normal", style: "bg-emerald-500/10 text-emerald-600" };
}

export function SmartBinsPage() {
  const [detections, setDetections] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getDetections(200);
        if (!cancelled) setDetections(data);
      } catch (err) {
        if (!cancelled) setError("Couldn't load detection history from the backend.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center">
        <AlertTriangle size={28} className="mb-3 text-warning" />
        <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!detections) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  if (detections.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Trash2 size={24} className="text-primary" />
        </div>
        <h1 className="text-xl font-bold">Smart Bins</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Run a few detections first - bin status here is derived from your
          real detection history, so there's nothing to show yet.
        </p>
      </div>
    );
  }

  // Group real detections by category, deriving a bin "fill level" from the
  // highest-risk detection logged in that category so far.
  const byCategory = {};
  for (const d of detections) {
    const key = d.top_label?.toLowerCase() || "trash";
    if (!byCategory[key]) byCategory[key] = [];
    byCategory[key].push(d);
  }

  const bins = Object.entries(byCategory).map(([category, items], i) => {
    const criticalCount = items.filter((d) => d.risk_level === "Critical").length;
    const highCount = items.filter((d) => d.risk_level === "High").length;
    // Fill level proxy: worst risk level seen for this category, real count-weighted
    const worstRisk = criticalCount > 0 ? "Critical" : highCount > 0 ? "High" : items.some((d) => d.risk_level === "Medium") ? "Medium" : "Low";
    const fill = Math.min(100, RISK_TO_FILL[worstRisk] + Math.min(items.length, 10));
    const status = statusFromFill(fill);

    return {
      id: `BIN-${String(i + 1).padStart(3, "0")}`,
      category,
      location: CATEGORY_LOCATION[category] || `${category[0].toUpperCase()}${category.slice(1)} Collection Point`,
      detectionCount: items.length,
      fill,
      status,
    };
  });

  const needingPickup = bins.filter((b) => b.status.label === "Needs Pickup").length;
  const avgFill = Math.round(bins.reduce((sum, b) => sum + b.fill, 0) / bins.length);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-extrabold tracking-tight">Smart Bins</h1>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          Derived from real detections
        </span>
      </div>
      <div className="mb-8 flex items-start gap-2 rounded-xl border border-border/60 bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
        <Info size={15} className="mt-0.5 shrink-0" />
        <p>
          Bins here are grouped by real waste category detections your AI has
          logged, and fill level is a proxy based on the actual risk levels
          and counts recorded per category — not a live IoT sensor reading.
          No physical fill/battery sensors are deployed yet.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Trash2 size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Categories tracked</p>
              <p className="text-xl font-bold">{bins.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <AlertTriangle size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Needs pickup now</p>
              <p className="text-xl font-bold">{needingPickup}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10">
              <Trash2 size={18} className="text-sky-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total detections logged</p>
              <p className="text-xl font-bold">{detections.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bin status by category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col divide-y divide-border/60">
            {bins.map((bin) => (
              <div
                key={bin.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Trash2 size={16} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{bin.id}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin size={11} /> {bin.location} · {bin.detectionCount} real detection
                      {bin.detectionCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="w-32">
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>Fill (proxy)</span>
                      <span>{bin.fill}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${fillBarColor(bin.fill)}`}
                        style={{ width: `${bin.fill}%` }}
                      />
                    </div>
                  </div>

                  <span
                    className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${bin.status.style}`}
                  >
                    {bin.status.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}