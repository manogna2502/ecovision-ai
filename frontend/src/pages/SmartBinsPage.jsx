import React, { useState, useEffect } from "react";
import { Trash2, Battery, Thermometer, MapPin, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const BIN_LOCATIONS = [
  "Jubilee Hills, Sector 4",
  "Banjara Hills Main Rd",
  "Madhapur Tech Park Gate",
  "Kondapur Cross Roads",
  "Gachibowli Circle",
  "Hitech City Metro Stn",
];

function seedRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function generateBins() {
  const rand = seedRandom(42);
  return BIN_LOCATIONS.map((location, i) => {
    const fill = Math.round(rand() * 100);
    const battery = Math.round(60 + rand() * 40);
    const temp = Math.round(24 + rand() * 10);
    let status = "Normal";
    if (fill >= 85) status = "Needs Pickup";
    else if (fill >= 60) status = "Filling Up";

    return {
      id: `BIN-${String(i + 1).padStart(3, "0")}`,
      location,
      fill,
      battery,
      temp,
      status,
    };
  });
}

const STATUS_STYLES = {
  Normal: "bg-emerald-500/10 text-emerald-600",
  "Filling Up": "bg-amber-500/10 text-amber-600",
  "Needs Pickup": "bg-red-500/10 text-red-600",
};

function fillBarColor(fill) {
  if (fill >= 85) return "bg-red-500";
  if (fill >= 60) return "bg-amber-500";
  return "bg-emerald-500";
}

export function SmartBinsPage() {
  const [bins, setBins] = useState([]);

  useEffect(() => {
    setBins(generateBins());
  }, []);

  const needingPickup = bins.filter((b) => b.status === "Needs Pickup").length;
  const avgFill = bins.length
    ? Math.round(bins.reduce((sum, b) => sum + b.fill, 0) / bins.length)
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-extrabold tracking-tight">Smart Bins</h1>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          Simulated demo data
        </span>
      </div>
      <p className="mb-8 max-w-2xl text-sm text-muted-foreground">
        This view shows what live IoT bin telemetry (fill level, battery, temperature)
        would look like once physical sensors are deployed. Values below are
        simulated for demonstration — a pilot rollout would feed this from real
        hardware over MQTT/LoRaWAN.
      </p>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Trash2 size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total bins tracked</p>
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
              <Battery size={18} className="text-sky-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Average fill level</p>
              <p className="text-xl font-bold">{avgFill}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bin status</CardTitle>
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
                      <MapPin size={11} /> {bin.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="w-32">
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>Fill</span>
                      <span>{bin.fill}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${fillBarColor(bin.fill)}`}
                        style={{ width: `${bin.fill}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Battery size={13} /> {bin.battery}%
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Thermometer size={13} /> {bin.temp}°C
                  </div>

                  <span
                    className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[bin.status]}`}
                  >
                    {bin.status}
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
