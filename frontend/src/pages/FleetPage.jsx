import React, { useState, useEffect } from "react";
import { Truck, Clock, Gauge, MapPin, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ROUTES = [
  { vehicle: "EV-Truck 01", route: "Route A - Jubilee Hills Loop", driver: "R. Kumar" },
  { vehicle: "EV-Truck 02", route: "Route B - Banjara Hills Loop", driver: "S. Reddy" },
  { vehicle: "EV-Truck 03", route: "Route C - Madhapur Corridor", driver: "A. Sharma" },
  { vehicle: "EV-Truck 04", route: "Route D - Gachibowli Circuit", driver: "P. Rao" },
];

function seedRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function generateFleet() {
  const rand = seedRandom(7);
  const statuses = ["En Route", "Collecting", "Returning to Depot"];
  return ROUTES.map((r, i) => {
    const progress = Math.round(20 + rand() * 75);
    const eta = Math.round(8 + rand() * 40);
    const speed = Math.round(18 + rand() * 22);
    const status = statuses[Math.floor(rand() * statuses.length)];
    const stopsDone = Math.round(3 + rand() * 8);
    const stopsTotal = stopsDone + Math.round(1 + rand() * 5);

    return {
      id: `FLT-${String(i + 1).padStart(3, "0")}`,
      ...r,
      progress,
      eta,
      speed,
      status,
      stopsDone,
      stopsTotal,
    };
  });
}

const STATUS_STYLES = {
  "En Route": "bg-sky-500/10 text-sky-600",
  Collecting: "bg-amber-500/10 text-amber-600",
  "Returning to Depot": "bg-emerald-500/10 text-emerald-600",
};

export function FleetPage() {
  const [fleet, setFleet] = useState([]);

  useEffect(() => {
    setFleet(generateFleet());
  }, []);

  const activeVehicles = fleet.length;
  const totalStopsToday = fleet.reduce((sum, f) => sum + f.stopsTotal, 0);
  const avgEta = fleet.length
    ? Math.round(fleet.reduce((sum, f) => sum + f.eta, 0) / fleet.length)
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-extrabold tracking-tight">Fleet Management</h1>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          Simulated demo data
        </span>
      </div>
      <p className="mb-8 max-w-2xl text-sm text-muted-foreground">
        This view shows what live vehicle tracking and route ETAs would look
        like with a GPS/telematics integration. Values below are simulated —
        a production rollout would feed this from onboard GPS units in
        real time.
      </p>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Truck size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active vehicles</p>
              <p className="text-xl font-bold">{activeVehicles}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <CheckCircle2 size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Stops planned today</p>
              <p className="text-xl font-bold">{totalStopsToday}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10">
              <Clock size={18} className="text-sky-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Average ETA</p>
              <p className="text-xl font-bold">{avgEta} min</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle status</CardTitle>
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
                        <MapPin size={11} /> {v.route} • {v.driver}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Gauge size={13} /> {v.speed} km/h
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={13} /> ETA {v.eta} min
                    </div>
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
                      {v.stopsDone}/{v.stopsTotal} stops complete
                    </span>
                    <span>{v.progress}% of route</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${v.progress}%` }}
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
