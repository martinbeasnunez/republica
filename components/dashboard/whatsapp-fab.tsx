"use client";

import { useState } from "react";
import { MessageCircle, X, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function WhatsAppFAB() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="w-64 rounded-xl border border-border bg-card p-4 shadow-xl"
          >
            <p className="text-sm font-semibold text-foreground mb-1">
              Alertas por WhatsApp
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Estamos trabajando en un agente de WhatsApp para mantenerte informado sobre las elecciones.
            </p>
            <div className="flex items-center justify-center gap-2 w-full rounded-lg bg-muted border border-border text-muted-foreground text-sm font-medium py-2 px-4">
              <Clock className="h-4 w-4" />
              Proximamente
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300",
          expanded
            ? "bg-muted text-foreground"
            : "bg-muted-foreground/20 hover:bg-muted-foreground/30 text-muted-foreground hover:scale-105"
        )}
      >
        {expanded ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
        )}
      </button>
    </div>
  );
}
