import React, { useState } from "react";
import { Sun, Moon, Bell, User, Globe, Check, Database } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

function Toggle({ checked, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-muted"
      }`}
      aria-label={label}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();
  const [notifDetections, setNotifDetections] = useState(true);
  const [notifReports, setNotifReports] = useState(true);
  const [notifCritical, setNotifCritical] = useState(true);
  const [language, setLanguage] = useState("English");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account, appearance, and notification preferences.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={16} /> Account
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-lg font-bold text-white">
              M
            </div>
            <div>
              <p className="text-sm font-semibold">Manogna Shanigarapu</p>
              <p className="text-xs text-muted-foreground">
                EcoVision AI · Demo workspace
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isDark ? <Moon size={16} /> : <Sun size={16} />} Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Dark mode</p>
                <p className="text-xs text-muted-foreground">
                  Switch between light and dark theme.
                </p>
              </div>
              <Toggle checked={isDark} onChange={toggleTheme} label="Dark mode" />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell size={16} /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">New detections</p>
                <p className="text-xs text-muted-foreground">
                  Get notified when a new waste item is classified.
                </p>
              </div>
              <Toggle
                checked={notifDetections}
                onChange={setNotifDetections}
                label="New detections"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Weekly reports</p>
                <p className="text-xs text-muted-foreground">
                  Receive a summary report every week.
                </p>
              </div>
              <Toggle
                checked={notifReports}
                onChange={setNotifReports}
                label="Weekly reports"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Critical risk alerts</p>
                <p className="text-xs text-muted-foreground">
                  Immediate alert when a critical-risk item is detected.
                </p>
              </div>
              <Toggle
                checked={notifCritical}
                onChange={setNotifCritical}
                label="Critical risk alerts"
              />
            </div>
          </CardContent>
        </Card>

        {/* Language / Region */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe size={16} /> Language
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {["English", "Telugu", "Hindi"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
                    language === lang
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/60 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database size={16} /> Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Detection history</p>
                <p className="text-xs text-muted-foreground">
                  All detections are stored in the connected database and
                  power your Analytics and Reports pages.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="min-w-32">
            {saved ? (
              <span className="flex items-center gap-1.5">
                <Check size={16} /> Saved
              </span>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
