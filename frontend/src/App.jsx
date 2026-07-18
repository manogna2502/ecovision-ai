import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { HomePage } from "@/pages/HomePage";
import { DashboardPage } from "@/pages/DashboardPage";
import { DetectionPage } from "@/pages/DetectionPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { AboutPage } from "@/pages/AboutPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public marketing pages */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>

        {/* App pages, with sidebar */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/detection" element={<DetectionPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route
            path="/dashboard/bins"
            element={
              <PlaceholderPage
                title="Smart Bins"
                description="IoT bin telemetry (fill %, battery, temperature) needs physical sensors — planned once a pilot deployment is in place."
              />
            }
          />
          <Route
            path="/dashboard/fleet"
            element={
              <PlaceholderPage
                title="Fleet Management"
                description="Live vehicle tracking and route ETAs need a GPS/telematics integration — on the roadmap, not wired up yet."
              />
            }
          />
          <Route
            path="/dashboard/insights"
            element={
              <PlaceholderPage
                title="AI Insights"
                description="Deeper forecasting insights need more historical detection volume than a fresh deployment has yet."
              />
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <PlaceholderPage
                title="Settings"
                description="Account, notification, and integration settings — coming as the platform grows beyond a single-user demo."
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
