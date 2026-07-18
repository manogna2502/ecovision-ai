import React from "react";
import { Leaf, Github, Linkedin } from "lucide-react";

const COLUMNS = [
  { title: "Product", links: ["Dashboard", "AI Detection", "Analytics", "Reports"] },
  { title: "Resources", links: ["Documentation", "API", "GitHub"] },
  { title: "Company", links: ["About", "Contact", "Privacy", "Terms"] },
];

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                <Leaf size={16} className="text-white" />
              </div>
              <span className="font-bold">EcoVision AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered waste intelligence for cities that want to act before problems compound.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="#" className="text-muted-foreground hover:text-foreground"><Github size={18} /></a>
              <a href="#" className="text-muted-foreground hover:text-foreground"><Linkedin size={18} /></a>
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-semibold">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} EcoVision AI. Built for Idea2Impact 2026.
        </div>
      </div>
    </footer>
  );
}
