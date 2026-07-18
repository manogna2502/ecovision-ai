import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

const SAMPLE_QUESTIONS = [
  "Which bins require immediate pickup?",
  "Predict tomorrow's waste volume.",
  "Show me high-risk zones.",
];

export function AIAssistantPanel() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-xl shadow-primary/30"
      >
        <Sparkles size={22} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            className="fixed bottom-24 right-6 z-40 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border/60 p-4">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <span className="font-semibold">EcoVision AI Assistant</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={17} />
              </button>
            </div>
            <div className="max-h-72 space-y-3 overflow-y-auto p-4">
              <div className="flex gap-2 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
                <Info size={14} className="mt-0.5 shrink-0" />
                <span>
                  This panel isn't connected to a live language model yet — wiring it up
                  needs a backend endpoint with your own LLM API key. Try the sample
                  questions below to see the intended flow.
                </span>
              </div>
              {SAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  className="w-full rounded-xl border border-border/60 p-3 text-left text-sm hover:bg-muted"
                >
                  {q}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-border/60 p-3">
              <input
                type="text"
                placeholder="Ask EcoVision AI..."
                disabled
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm disabled:opacity-60"
              />
              <Button size="icon" disabled>
                <Send size={15} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
