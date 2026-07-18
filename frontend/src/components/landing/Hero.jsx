import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, PlayCircle, ScanEye, ShieldCheck, Gauge, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnimatedBackground } from "./AnimatedBackground";
import { useStats } from "@/hooks/useStats";

export function Hero() {
  const navigate = useNavigate();
  const { stats, loading } = useStats();
  const hasData = stats && stats.total_detections > 0;

  const floatingCards = [
    { icon: ScanEye, label: "Total detections", value: hasData ? stats.total_detections : "—", pos: "left-0 top-6" },
    { icon: Gauge, label: "Avg. model confidence", value: hasData ? `${stats.avg_confidence}%` : "—", pos: "right-0 top-24" },
    { icon: ShieldCheck, label: "Avg. risk score", value: hasData ? stats.avg_risk_score : "—", pos: "left-6 bottom-16" },
    { icon: Database, label: "Live in Postgres", value: hasData ? "Yes" : "Awaiting data", pos: "right-6 bottom-0" },
  ];

  return (
    <section className="relative overflow-hidden">
      <AnimatedBackground />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles size={14} /> AI-powered municipal intelligence
          </div>
          <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            AI-Powered Smart{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Waste Management
            </span>{" "}
            Platform
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Transforming urban waste into actionable intelligence using artificial
            intelligence, computer vision, and predictive analytics.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => navigate("/dashboard")}>
              Launch Dashboard <ArrowRight size={17} />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/detection")}>
              <PlayCircle size={18} /> Try Live Detection
            </Button>
          </div>
          <p className="mt-8 text-xs text-muted-foreground">
            {hasData
              ? `${stats.total_detections} real detection${stats.total_detections === 1 ? "" : "s"} logged so far — every number on this page reflects your live database.`
              : "No detections yet — the numbers below will populate as soon as you run your first image through AI Detection."}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative hidden h-[440px] lg:block"
        >
          <div className="glass glow-border absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-2xl" />
          {floatingCards.map((c, i) => (
            <motion.div
              key={c.label}
              className={`absolute ${c.pos} w-52`}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
            >
              <Card className="glass p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-primary">
                    <c.icon size={17} />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">{c.label}</div>
                    <div className="text-base font-bold">{loading ? "..." : c.value}</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}