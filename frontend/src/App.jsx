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
import { SmartBinsPage } from "@/pages/SmartBinsPage";
import { FleetPage } from "@/pages/FleetPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { AIInsightsPage } from "@/pages/AIInsightsPage";

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
          <Route path="/dashboard/bins" element={<SmartBinsPage />} />
          <Route path="/dashboard/fleet" element={<FleetPage />} />
          <Route path="/dashboard/insights" element={<AIInsightsPage />} />
          <Route path="/dashboard/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}