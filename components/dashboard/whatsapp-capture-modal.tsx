"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCountry } from "@/lib/config/country-context";
import {
  X,
  Send,
  Loader2,
  Check,
  Zap,
  TrendingUp,
  Shield,
  Bell,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY_SUBSCRIBED = "condor_wa_subscribed";
const STORAGE_KEY_DISMISSED = "condor_wa_modal_dismissed";
const STORAGE_KEY_VIEWS = "condor_wa_view_count";
const SEED_COUNT = 847;

// Trigger rules:
// - Show after 3rd page view in session (user is engaged)
// - Don't show if already subscribed
// - Don't show if dismissed in last 3 days
// - After dismiss, show again after 5 more page views
const VIEWS_FIRST_TRIGGER = 3;
const VIEWS_RETRIGGER = 5;
const DISMISS_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

export function WhatsAppCaptureModal() {
  const country = useCountry();
  const [show, setShow] = useState(false);
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriberCount, setSubscriberCount] = useState(SEED_COUNT);

  useEffect(() => {
    // Don't run on server
    if (typeof window === "undefined") return;

    // Already subscribed? Never show
    if (localStorage.getItem(STORAGE_KEY_SUBSCRIBED) === "true") return;

    // Check dismiss cooldown
    const dismissedAt = localStorage.getItem(STORAGE_KEY_DISMISSED);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt);
      if (elapsed < DISMISS_COOLDOWN_MS) return;
    }

    // Increment view count
    const currentViews = parseInt(sessionStorage.getItem(STORAGE_KEY_VIEWS) || "0") + 1;
    sessionStorage.setItem(STORAGE_KEY_VIEWS, String(currentViews));

    // Determine if we should show
    const dismissCount = parseInt(localStorage.getItem("condor_wa_dismiss_count") || "0");
    const threshold = VIEWS_FIRST_TRIGGER + dismissCount * VIEWS_RETRIGGER;

    if (currentViews >= threshold) {
      // Small delay so it doesn't feel jarring
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Load subscriber count
  useEffect(() => {
    const count = localStorage.getItem("condor_wa_count");
    if (count) setSubscriberCount(parseInt(count));
  }, []);

  const handleDismiss = useCallback(() => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY_DISMISSED, String(Date.now()));
    const dismissCount = parseInt(localStorage.getItem("condor_wa_dismiss_count") || "0");
    localStorage.setItem("condor_wa_dismiss_count", String(dismissCount + 1));
  }, []);

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
      if (!res.ok) throw new Error(data.error || "Error al suscribirse");

      localStorage.setItem(STORAGE_KEY_SUBSCRIBED, "true");
      const newCount = data.subscriberCount
        ? data.subscriberCount + SEED_COUNT
        : subscriberCount + 1;
      localStorage.setItem("condor_wa_count", String(newCount));
      setSubscriberCount(newCount);
      setIsSubscribed(true);

      // Auto-close after success
      setTimeout(() => setShow(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al procesar suscripcion"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[15%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-[61]"
          >
            <div className="relative rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden">
              {/* Top accent */}
              <div className="h-1 w-full bg-gradient-to-r from-emerald via-primary to-emerald" />

              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors z-10"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              <div className="p-5 sm:p-6">
                {isSubscribed ? (
                  /* ─── Success ─── */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 12 }}
                      className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald/20"
                    >
                      <Check className="h-8 w-8 text-emerald" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-foreground">
                      Bienvenido al club!
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Ahora tienes un agente de IA trabajando para ti.
                      Te vamos a mantener informado.
                    </p>
                    <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span className="font-mono tabular-nums">
                        {subscriberCount.toLocaleString()}
                      </span>
                      <span>personas ya estan adentro</span>
                    </div>
                  </motion.div>
                ) : (
                  /* ─── Capture Form ─── */
                  <>
                    {/* Header — value proposition */}
                    <div className="mb-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-5 w-5 text-emerald" />
                        <h3 className="text-base sm:text-lg font-bold text-foreground">
                          Tu agente electoral con IA
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Un asistente que monitorea todo por ti y te avisa solo lo importante.
                        <span className="text-foreground font-medium"> Gratis.</span>
                      </p>
                    </div>

                    {/* Value pills */}
                    <div className="grid grid-cols-2 gap-2 mb-5">
                      {[
                        {
                          icon: TrendingUp,
                          text: "Encuestas al instante",
                          sub: "Antes que los medios",
                        },
                        {
                          icon: Shield,
                          text: "Fake news detectadas",
                          sub: "IA verifica por ti",
                        },
                        {
                          icon: Bell,
                          text: "Alertas personalizadas",
                          sub: "Solo lo que te importa",
                        },
                        {
                          icon: Zap,
                          text: "Resumen semanal",
                          sub: "Todo en 2 minutos",
                        },
                      ].map(({ icon: Icon, text, sub }) => (
                        <div
                          key={text}
                          className="flex items-start gap-2 rounded-lg border border-border/50 bg-muted/30 p-2.5"
                        >
                          <Icon className="h-4 w-4 text-emerald flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[11px] font-medium text-foreground leading-tight">
                              {text}
                            </p>
                            <p className="text-[10px] text-muted-foreground leading-tight">
                              {sub}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Phone input */}
                    <div className="space-y-3">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-mono">
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
                          className="w-full rounded-xl border border-border bg-background pl-12 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-emerald/50 focus:border-emerald font-mono tabular-nums"
                          maxLength={12}
                          disabled={isSubmitting}
                          autoFocus
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleSubscribe()
                          }
                        />
                      </div>

                      {error && (
                        <p className="text-xs text-rose text-center">
                          {error}
                        </p>
                      )}

                      <button
                        onClick={handleSubscribe}
                        disabled={!phone.trim() || isSubmitting}
                        className={cn(
                          "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all",
                          "bg-emerald hover:bg-emerald/90 active:scale-[0.98]",
                          "disabled:opacity-40 disabled:cursor-not-allowed"
                        )}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Activando agente...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Activar mi agente gratis
                          </>
                        )}
                      </button>
                    </div>

                    {/* Social proof + trust */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
                        <Users className="h-3 w-3" />
                        <span className="font-mono tabular-nums">
                          {subscriberCount.toLocaleString()}
                        </span>
                        <span>ya activaron</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground/50">
                        Sin spam • Cancela cuando quieras
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
