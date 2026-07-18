import React from "react";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { WorkflowTimeline } from "@/components/landing/WorkflowTimeline";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { InsightsSection } from "@/components/landing/InsightsSection";

export function HomePage() {
  return (
    <>
      <Hero />
      <StatsSection />
      <ProblemSection />
      <WorkflowTimeline />
      <FeaturesSection />
      <InsightsSection />
    </>
  );
}