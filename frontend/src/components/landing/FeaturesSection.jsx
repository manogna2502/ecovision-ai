import React from "react";
import { motion } from "framer-motion";
import {
  ScanEye, Radar, Gauge, Route, Wind, MessageSquareText,
  Radio, Thermometer, BarChart3, Bell, ClipboardList, Map,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  { icon: ScanEye, title: "AI waste classification", desc: "SigLIP computer vision model identifies waste type from a photo in real time.", status: "live" },
  { icon: Radar, title: "Illegal dump detection", desc: "Photo reports triaged automatically and flagged by risk.", status: "live" },
  { icon: Gauge, title: "Risk & priority scoring", desc: "Every detection gets a transparent, rule-based risk score.", status: "live" },
  { icon: BarChart3, title: "Live operations dashboard", desc: "Real detection history, trends, and composition — not sample data.", status: "live" },
  { icon: ClipboardList, title: "Downloadable AI reports", desc: "Generate a shareable summary per detection or time range.", status: "live" },
  { icon: Bell, title: "Real-time alerts", desc: "Critical and high-priority detections surfaced immediately.", status: "live" },
  { icon: Radio, title: "IoT smart bin monitoring", desc: "Fill-level and battery telemetry from physical bin sensors.", status: "planned" },
  { icon: Route, title: "Dynamic route optimization", desc: "Collection routes recalculated from live fill data.", status: "planned" },
  { icon: Thermometer, title: "Methane monitoring", desc: "Gas sensors flag decomposition risk before it becomes hazardous.", status: "planned" },
  { icon: Wind, title: "Carbon footprint tracking", desc: "Emissions saved from optimized collection, tracked over time.", status: "planned" },
  { icon: Map, title: "Waste heatmaps", desc: "Geographic density view of dumping and collection activity.", status: "planned" },
  { icon: MessageSquareText, title: "Citizen complaint portal", desc: "Public-facing reporting flow feeding directly into the queue.", status: "planned" },
];

export function FeaturesSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-12 max-w-2xl">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">What's built, what's next</h2>
        <p className="mt-3 text-muted-foreground">
          Every "Live" feature here is wired to a real model and a real database —
          not a mockup. "Planned" items are the roadmap beyond the hackathon.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
          >
            <Card className="h-full p-6 transition-transform hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon size={19} />
                </div>
                <Badge variant={f.status === "live" ? "accent" : "outline"}>
                  {f.status === "live" ? "Live" : "Planned"}
                </Badge>
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
