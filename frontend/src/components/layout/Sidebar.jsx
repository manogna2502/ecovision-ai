import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, ScanEye, Boxes, Truck, BarChart3,
  Sparkles, FileText, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { to: "/detection", icon: ScanEye, label: "AI Detection" },
  { to: "/dashboard/bins", icon: Boxes, label: "Smart Bins" },
  { to: "/dashboard/fleet", icon: Truck, label: "Fleet" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/dashboard/insights", icon: Sparkles, label: "AI Insights" },
  { to: "/reports", icon: FileText, label: "Reports" },
  { to: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  return (
    <aside className="sticky top-[61px] hidden h-[calc(100vh-61px)] w-60 shrink-0 border-r border-border/60 bg-card/30 px-3 py-6 lg:block">
      <nav className="flex flex-col gap-1">
        {ITEMS.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.to === "/dashboard"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <item.icon size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
