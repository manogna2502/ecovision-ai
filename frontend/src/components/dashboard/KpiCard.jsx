import React from "react";
import { Card } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/ui/animated-counter";

export function KpiCard({ icon: Icon, label, value, decimals, suffix, tint = "text-primary" }) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-muted ${tint}`}>
          <Icon size={15} />
        </div>
      </div>
      <div className="text-2xl font-extrabold tracking-tight">
        <AnimatedCounter value={value} decimals={decimals} suffix={suffix} />
      </div>
    </Card>
  );
}
