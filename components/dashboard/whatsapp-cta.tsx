"use client";

import { useState, useEffect } from "react";
import { MessageCircle, ArrowRight, Loader2, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCountry } from "@/lib/config/country-context";

const STORAGE_KEY = "condor_wa_subscribed";
const DISMISSED_KEY = "condor_wa_dismissed";

/**
 * Contextual WhatsApp nudge — appears inline after the "value moment"
 * of each page. Slim, non-invasive, with per-page messaging.
 *
 * Usage: <WhatsAppCTA context="encuestas" />
 *
 * Behavior:
 * - Returns null if already subscribed or dismissed
 * - Shows contextual message based on the page
 * - Inline phone input, one-tap subscribe
 * - Disappears permanently after subscribe or dismiss
 */

const CONTEXTS: Record<string, { hook: string; detail: string }> = {
  encuestas: {
    hook: "¿Quieres saber cuando cambien las encuestas?",
    detail: "Te avisamos por WhatsApp cada vez que hay datos nuevos.",
  },
  noticias: {
    hook: "No te pierdas ninguna noticia electoral",
    detail: "Alertas de noticias verificadas directo a tu celular.",
  },
  verificador: {
    hook: "Detectamos fake news todos los días",
    detail: "Recibe alertas cuando identifiquemos desinformación.",
  },
  planes: {
    hook: "¿Quieres saber cuando un candidato actualice su plan?",
    detail: "Te notificamos cambios en propuestas de gobierno.",
  },
  pilares: {
    hook: "Los indicadores del país cambian cada semana",
    detail: "Recibe actualizaciones sobre los pilares del desarrollo.",
  },
  "en-vivo": {
    hook: "Cobertura en vivo directo a tu WhatsApp",
    detail: "Resultados y tendencias en tiempo real el día de la elección.",
  },
  candidatos: {
    hook: "Sigue la carrera electoral de cerca",
    detail: "Te avisamos cuando haya cambios en encuestas y propuestas.",
  },
  quiz: {
    hook: "¿Quieres resultados más completos?",
    detail: "Recibe análisis personalizados según tu perfil electoral.",
  },
  dashboard: {
    hook: "Mantente informado sin esfuerzo",
    detail: "Resumen electoral semanal directo a tu WhatsApp.",
  },
  default: {
    hook: "Alertas electorales en tu WhatsApp",
    detail: "Encuestas, noticias verificadas y fake news — gratis.",
  },
};

export function WhatsAppCTA({ context = "default" }: { context?: string }) {
  const country = useCountry();
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem(STORAGE_KEY) === "true") setIsSubscribed(true);
    if (localStorage.getItem(DISMISSED_KEY) === "true") setIsDismissed(true);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(DISMISSED_KEY, "true");
  };

  const handleSubscribe = async () => {
    if (!phone.trim() || isSubmitting) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const fullPhone = phone.startsWith("+")
        ? phone
        : `${country.phonePrefix}${phone.replace(/^0+/, "")}`;
      const res = await fetch("/api/whatsapp/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: fullPhone,
          interests: ["encuestas", "noticias", "alertas", "verificacion"],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      localStorage.setItem(STORAGE_KEY, "true");
      setIsSubscribed(true);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al suscribirse");
    } finally {
      setIsSubmitting(false);
    }
  };

  // SSR / already handled
  if (!mounted || isSubscribed || isDismissed) return null;

  const { hook, detail } = CONTEXTS[context] || CONTEXTS.default;

  return (
    <AnimatePresence>
      {showSuccess ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="rounded-xl border border-emerald/20 bg-emerald/5 p-3 flex items-center gap-3"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald/20 flex-shrink-0">
            <Check className="h-4 w-4 text-emerald" />
          </div>
          <p className="text-xs text-foreground">
            <span className="font-semibold">Listo!</span>{" "}
            <span className="text-muted-foreground">
              Te avisaremos por WhatsApp cuando haya novedades.
            </span>
          </p>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-emerald/20 bg-gradient-to-r from-emerald/5 via-emerald/3 to-transparent p-3 sm:p-4"
        >
          <div className="flex flex-col gap-3">
            {/* Top row — message + dismiss */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <MessageCircle className="h-4 w-4 text-emerald flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground leading-tight">
                    {hook}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {detail}
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-muted-foreground/40 hover:text-muted-foreground transition-colors flex-shrink-0 p-0.5"
                aria-label="Cerrar"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Bottom row — input + button */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-mono">
                  {country.phonePrefix}
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setError(null);
                    setPhone(e.target.value.replace(/[^\d\s]/g, ""));
                  }}
                  placeholder="999 999 999"
                  className={cn(
                    "w-full rounded-lg border bg-background pl-10 pr-3 py-2 text-xs text-foreground",
                    "placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-emerald",
                    "font-mono tabular-nums",
                    error ? "border-rose/50" : "border-border"
                  )}
                  maxLength={12}
                  disabled={isSubmitting}
                  onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                />
              </div>
              <button
                onClick={handleSubscribe}
                disabled={!phone.trim() || isSubmitting}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-white transition-all",
                  "bg-emerald hover:bg-emerald/90 active:scale-[0.98]",
                  "disabled:opacity-40 disabled:cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    Avisar
                    <ArrowRight className="h-3 w-3" />
                  </>
                )}
              </button>
            </div>

            {error && (
              <p className="text-[10px] text-rose -mt-1">{error}</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
