import React from "react";
import { motion } from "framer-motion";
import { Cpu, Activity, Brain, ScanEye, Route, BarChart3, FileCheck } from "lucide-react";

const STEPS = [
  { icon: Cpu, title: "Smart bin sensors", desc: "Fill-level and status data collected at the source." },
  { icon: Activity, title: "Real-time monitoring", desc: "Live status streamed into the operations dashboard." },
  { icon: Brain, title: "AI prediction", desc: "Model forecasts fill trajectory and overflow risk." },
  { icon: ScanEye, title: "Waste classification", desc: "Computer vision identifies material type from photos." },
  { icon: Route, title: "Route optimization", desc: "Collection routes recalculated around actual need." },
  { icon: BarChart3, title: "Analytics", desc: "Trends, composition, and risk surfaced for planners." },
  { icon: FileCheck, title: "Automated reports", desc: "Shareable summaries generated for stakeholders." },
];

export function WorkflowTimeline() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-14 max-w-2xl">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">How EcoVision AI works</h2>
        <p className="mt-3 text-muted-foreground">
          From sensor to decision — each stage feeds the next.
        </p>
      </div>
      <div className="relative">
        <div className="absolute left-5 top-0 h-full w-px bg-border md:left-1/2" />
        <div className="space-y-10">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45 }}
              className={`relative flex items-center gap-6 md:w-1/2 ${
                i % 2 === 0 ? "md:pr-10" : "md:ml-auto md:pl-10"
              }`}
            >
              <div className="absolute -left-0 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/30 md:left-auto md:static">
                <step.icon size={17} />
              </div>
              <div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
