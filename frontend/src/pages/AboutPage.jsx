import React from "react";
import { Leaf, Target, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";

export function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary">
        <Leaf size={24} className="text-white" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight">About EcoVision AI</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        EcoVision AI is an AI-powered waste triage platform: upload a photo, get real
        computer vision classification, and see it feed straight into a live
        operations dashboard. Built for Idea2Impact 2026 (Theme 2 — Clean & Green
        Technology), with an eye toward a real deployment beyond the hackathon.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Card className="p-6">
          <Target size={20} className="mb-3 text-primary" />
          <h3 className="font-semibold">What's real today</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            A pretrained SigLIP classifier, a Postgres-backed history of every
            detection, and a dashboard that reflects that data live — no mock numbers.
          </p>
        </Card>
        <Card className="p-6">
          <Layers size={20} className="mb-3 text-secondary" />
          <h3 className="font-semibold">What's on the roadmap</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            IoT bin sensors, route optimization, a live LLM-backed assistant, and
            city-scale mapping — each needs infrastructure beyond a hackathon sprint.
          </p>
        </Card>
      </div>
    </div>
  );
}
