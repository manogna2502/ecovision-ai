import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { useTheme } from "@/hooks/useTheme";

export function MainLayout() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar isDark={isDark} toggleTheme={toggleTheme} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
