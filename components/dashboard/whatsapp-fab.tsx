"use client";

import { useState, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "condor_wa_subscribed";

export function WhatsAppFAB() {
  const [expanded, setExpanded] = useState(false);
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPulse, setShowPulse] = useState(true);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "true") {
      setIsSubscribed(true);
      setShowPulse(false);
    }
  }, []);

  useEffect(() => {
    if (expanded) setShowPulse(false);
  }, [expanded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const fullPhone = phone.startsWith("+") ? phone : `+51${phone.replace(/^0+/, "")}`;
      const res = await fetch("/api/whatsapp/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone, interests: ["encuestas", "noticias", "alertas", "verificacion"] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al suscribirse");

      localStorage.setItem(STORAGE_KEY, "true");
      setIsSubscribed(true);

      // Auto-close after success
      setTimeout(() => setExpanded(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="w-72 sm:w-80 rounded-xl border border-border bg-card/95 backdrop-blur-md p-4 shadow-2xl shadow-black/40"
          >
            {isSubscribed ? (
              <div className="text-center py-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12 }}
                  className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald/20"
                >
                  <Check className="h-6 w-6 text-emerald" />
                </motion.div>
                <p className="text-sm font-semibold text-foreground mb-1">
                  Listo!
                </p>
                <p className="text-xs text-muted-foreground">
                  Te avisaremos por WhatsApp cuando haya novedades electorales.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-emerald" />
                    <p className="text-sm font-semibold text-foreground">
                      Alertas electorales
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpanded(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  Encuestas, fake news y alertas directo a tu WhatsApp. Gratis.
                </p>

                {/* Phone input — single field, minimal */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                      +51
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setError(null);
                        setPhone(e.target.value.replace(/[^\d\s]/g, ""));
                      }}
                      placeholder="999 999 999"
                      className="w-full rounded-lg border border-border bg-background pl-11 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-emerald font-mono tabular-nums"
                      maxLength={12}
                      disabled={isSubmitting}
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!phone.trim() || isSubmitting}
                    className={cn(
                      "flex items-center justify-center rounded-lg px-3 text-white transition-all",
                      "bg-emerald hover:bg-emerald/90 active:scale-95",
                      "disabled:opacity-40 disabled:cursor-not-allowed"
                    )}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {error && (
                  <p className="text-[11px] text-rose">{error}</p>
                )}

                <p className="text-[10px] text-muted-foreground/50 text-center">
                  Sin spam · Cancela cuando quieras
                </p>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <div className="relative">
        {showPulse && !isSubscribed && (
          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald pulse-dot z-10" />
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300",
            expanded
              ? "bg-muted text-foreground"
              : isSubscribed
                ? "bg-emerald/20 text-emerald hover:bg-emerald/30 hover:scale-105"
                : "bg-emerald/10 hover:bg-emerald/20 text-emerald hover:scale-105"
          )}
        >
          {expanded ? (
            <X className="h-5 w-5" />
          ) : (
            <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
          )}
        </button>
      </div>
    </div>
  );
}
