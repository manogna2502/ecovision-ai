import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { useTheme } from "@/hooks/useTheme";

export function DashboardLayout() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar isDark={isDark} toggleTheme={toggleTheme} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
