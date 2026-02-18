"use client";

import { useState, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Check,
  Users,
  Bell,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const STORAGE_KEY_SUBSCRIBED = "condor_wa_subscribed";
const STORAGE_KEY_COUNT = "condor_wa_count";
const SEED_COUNT = 847;

const INTEREST_OPTIONS = [
  { id: "encuestas", label: "Encuestas y sondeos", emoji: "📊" },
  { id: "noticias", label: "Noticias de ultima hora", emoji: "🔴" },
  { id: "alertas", label: "Alertas de candidatos", emoji: "👤" },
  { id: "verificacion", label: "Verificaciones de hechos", emoji: "✅" },
];

export function WhatsAppFAB() {
  const [expanded, setExpanded] = useState(false);
  const [phone, setPhone] = useState("");
  const [interests, setInterests] = useState<string[]>([
    "encuestas",
    "noticias",
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(SEED_COUNT);
  const [error, setError] = useState<string | null>(null);
  const [showPulse, setShowPulse] = useState(true);

  // Load subscription state from localStorage
  useEffect(() => {
    const subscribed = localStorage.getItem(STORAGE_KEY_SUBSCRIBED);
    if (subscribed === "true") {
      setIsSubscribed(true);
    }
    const count = localStorage.getItem(STORAGE_KEY_COUNT);
    setSubscriberCount(count ? parseInt(count) : SEED_COUNT);
  }, []);

  // Hide pulse after first expand
  useEffect(() => {
    if (expanded) setShowPulse(false);
  }, [expanded]);

  const toggleInterest = (id: string) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

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
        body: JSON.stringify({ phone: fullPhone, interests }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al suscribirse");
      }

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY_SUBSCRIBED, "true");
      // Use real count from Supabase if available, add seed for social proof
      const newCount = data.subscriberCount
        ? data.subscriberCount + SEED_COUNT
        : subscriberCount + 1;
      localStorage.setItem(STORAGE_KEY_COUNT, String(newCount));
      setSubscriberCount(newCount);
      setIsSubscribed(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al procesar suscripcion"
      );
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
              /* ─── Success State ─── */
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
                  Ya estas suscrito!
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  CONDOR AI te mantendra informado por WhatsApp sobre las
                  elecciones Peru 2026.
                </p>
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span className="tabular-nums">
                    {subscriberCount.toLocaleString()}
                  </span>
                  <span>suscritos</span>
                </div>
              </div>
            ) : (
              /* ─── Subscription Form ─── */
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Header */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Bell className="h-4 w-4 text-emerald" />
                    <p className="text-sm font-semibold text-foreground">
                      Alertas por WhatsApp
                    </p>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Recibe actualizaciones electorales directo a tu celular.
                    Gratis.
                  </p>
                </div>

                {/* Phone input */}
                <div className="relative">
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
                    className="w-full rounded-lg border border-border bg-background pl-11 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary font-mono tabular-nums"
                    maxLength={12}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Interest checkboxes */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    Que quieres recibir?
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {INTEREST_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleInterest(opt.id)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[11px] transition-all text-left",
                          interests.includes(opt.id)
                            ? "border-primary/40 bg-primary/10 text-foreground"
                            : "border-border bg-background/50 text-muted-foreground hover:border-border hover:bg-muted/50"
                        )}
                      >
                        <span className="text-xs">{opt.emoji}</span>
                        <span className="leading-tight">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <p className="text-[11px] text-rose">{error}</p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!phone.trim() || interests.length === 0 || isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald/90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Suscribiendo...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Suscribirme gratis
                    </>
                  )}
                </button>

                {/* Social proof */}
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/70">
                  <Users className="h-3 w-3" />
                  <span className="font-mono tabular-nums">
                    {subscriberCount.toLocaleString()}
                  </span>
                  <span>personas ya se unieron</span>
                </div>
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
