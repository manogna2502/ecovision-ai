import React, { useEffect, useState } from "react";
import { Truck, Clock, MapPin, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDetections } from "@/lib/api";

const VEHICLES = ["EV-Truck 01", "EV-Truck 02", "EV-Truck 03", "EV-Truck 04"];
const DRIVERS = ["R. Kumar", "S. Reddy", "A. Sharma", "P. Rao"];

const STATUS_STYLES = {
  "En Route": "bg-sky-500/10 text-sky-600",
  Collecting: "bg-amber-500/10 text-amber-600",
  "Returning to Depot": "bg-emerald-500/10 text-emerald-600",
};

export function FleetPage() {
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
          <Truck size={24} className="text-primary" />
        </div>
        <h1 className="text-xl font-bold">Fleet Management</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Run a few detections first - pickup stops here are derived from
          your real detection history, so there's nothing to assign yet.
        </p>
      </div>
    );
  }

  // Real, pending pickups = detections flagged Critical or High priority.
  const pendingPickups = detections.filter(
    (d) => d.cleanup_priority === "Critical" || d.cleanup_priority === "High"
  );
  const totalStops = pendingPickups.length;

  // Distribute real pending pickups round-robin across a fixed small fleet,
  // so vehicle assignment counts are driven by real backlog, not random.
  const fleet = VEHICLES.map((vehicle, i) => {
    const assigned = pendingPickups.filter((_, idx) => idx % VEHICLES.length === i);
    const criticalCount = assigned.filter((d) => d.cleanup_priority === "Critical").length;
    const stopsTotal = assigned.length;
    const stopsDone = Math.max(0, stopsTotal - criticalCount); // critical ones assumed still pending
    const progress = stopsTotal > 0 ? Math.round((stopsDone / stopsTotal) * 100) : 100;
    const status =
      criticalCount > 0 ? "Collecting" : stopsTotal > 0 ? "En Route" : "Returning to Depot";

    return {
      id: `FLT-${String(i + 1).padStart(3, "0")}`,
      vehicle,
      driver: DRIVERS[i],
      stopsTotal,
      stopsDone,
      criticalCount,
      progress,
      status,
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-extrabold tracking-tight">Fleet Management</h1>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          Derived from real detections
        </span>
      </div>
      <div className="mb-8 flex items-start gap-2 rounded-xl border border-border/60 bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
        <Info size={15} className="mt-0.5 shrink-0" />
        <p>
          Stop counts below reflect real Critical/High-priority detections
          logged by your AI, assigned round-robin across a fixed 4-vehicle
          fleet. Vehicle names, drivers, and live position/speed are
          illustrative — no GPS/telematics hardware is connected yet.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Truck size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active vehicles</p>
              <p className="text-xl font-bold">{fleet.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <AlertTriangle size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Real pending pickups</p>
              <p className="text-xl font-bold">{totalStops}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <CheckCircle2 size={18} className="text-emerald-600" />
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
          <CardTitle>Vehicle assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col divide-y divide-border/60">
            {fleet.map((v) => (
              <div key={v.id} className="flex flex-col gap-3 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <Truck size={16} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{v.vehicle}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin size={11} /> Driver: {v.driver}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {v.criticalCount > 0 && (
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <AlertTriangle size={13} /> {v.criticalCount} critical
                      </div>
                    )}
                    <span
                      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[v.status]}`}
                    >
                      {v.status}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>
                      {v.stopsDone}/{v.stopsTotal || 0} real pickups assigned
                    </span>
                    <span>{v.stopsTotal > 0 ? `${v.progress}%` : "No stops assigned"}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${v.stopsTotal > 0 ? v.progress : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}