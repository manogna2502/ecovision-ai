import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Search, Bell, Sun, Moon, Menu, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/detection", label: "AI Detection" },
  { to: "/analytics", label: "Analytics" },
  { to: "/reports", label: "Reports" },
  { to: "/about", label: "About" },
];

const NOTIFICATIONS = [
  {
    id: 1,
    title: "Model warm-up complete",
    body: "The AI detection endpoint is ready for classification requests.",
    time: "Just now",
  },
  {
    id: 2,
    title: "Weekly report generated",
    body: "Your latest waste analytics report is available in Reports.",
    time: "2h ago",
  },
  {
    id: 3,
    title: "New detection logged",
    body: "A waste item was classified and added to your dashboard.",
    time: "5h ago",
  },
];

export function Navbar({ isDark, toggleTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const filteredLinks = NAV_LINKS.filter((link) =>
    link.label.toLowerCase().includes(query.toLowerCase())
  );

  function goTo(path) {
    navigate(path);
    setSearchOpen(false);
    setQuery("");
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (filteredLinks.length > 0) goTo(filteredLinks[0].to);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/25">
            <Leaf size={18} className="text-white" strokeWidth={2.3} />
          </div>
          <span className="text-lg font-bold tracking-tight">
            EcoVision <span className="text-primary">AI</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative hidden sm:block" ref={searchRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
            >
              <Search size={17} />
            </Button>

            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-border/60 bg-background p-3 shadow-xl"
                >
                  <form onSubmit={handleSearchSubmit}>
                    <input
                      ref={searchInputRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search pages…"
                      className="w-full rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm outline-none focus:border-primary/40"
                    />
                  </form>
                  <div className="mt-2 flex flex-col gap-0.5">
                    {filteredLinks.length > 0 ? (
                      filteredLinks.map((link) => (
                        <button
                          key={link.to}
                          onClick={() => goTo(link.to)}
                          className="rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          {link.label}
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-2 text-sm text-muted-foreground">
                        No pages match "{query}"
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications */}
          <div className="relative hidden sm:block" ref={notifRef}>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setNotifOpen((v) => !v)}
              aria-label="Notifications"
            >
              <Bell size={17} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-danger" />
            </Button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border/60 bg-background p-2 shadow-xl"
                >
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <p className="text-sm font-semibold">Notifications</p>
                    <span className="text-xs text-muted-foreground">
                      {NOTIFICATIONS.length} new
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {NOTIFICATIONS.map((n) => (
                      <div
                        key={n.id}
                        className="flex gap-2.5 rounded-lg px-2 py-2 hover:bg-muted"
                      >
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-tight">{n.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground leading-snug">
                            {n.body}
                          </p>
                          <p className="mt-1 text-[11px] text-muted-foreground/70">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </Button>
          <Button
            variant="default"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => navigate("/dashboard")}
          >
            Launch Dashboard
          </Button>
          <button
            className="ml-1 text-foreground lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <motion.nav
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="flex flex-col gap-1 border-t border-border/60 px-6 py-3 lg:hidden"
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3.5 py-2.5 text-sm font-medium",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </motion.nav>
      )}
    </header>
  );
}