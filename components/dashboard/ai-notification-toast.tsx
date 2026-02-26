"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, MessageCircle, Send, Loader2 } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

interface ToastNotification {
  id: string;
  message: string;
  type: "update" | "alert" | "analysis" | "verification" | "cta";
  time: string;
}

const typeStyles: Record<string, string> = {
  update: "border-emerald/30",
  alert: "border-amber/30",
  analysis: "border-sky/30",
  verification: "border-primary/30",
  cta: "border-emerald/40",
};

const typeDotColors: Record<string, string> = {
  update: "bg-emerald",
  alert: "bg-amber",
  analysis: "bg-sky",
  verification: "bg-primary",
  cta: "bg-emerald",
};

function categoryToType(category: string, factCheck?: string): ToastNotification["type"] {
  if (factCheck === "false" || factCheck === "questionable") return "verification";
  switch (category) {
    case "encuestas": return "alert";
    case "propuestas":
    case "planes": return "analysis";
    case "debate":
    case "legal": return "alert";
    default: return "update";
  }
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin}m`;
  if (diffH < 24) return `hace ${diffH}h`;
  if (diffD === 1) return "ayer";
  if (diffD < 7) return `hace ${diffD}d`;
  return `hace ${Math.floor(diffD / 7)}sem`;
}

const CTA_AFTER_N_NEWS = 2; // Show CTA after 2 news toasts
const STORAGE_KEY = "condor_wa_subscribed";
const CTA_DISMISSED_KEY = "condor_wa_toast_cta_dismissed";

// ─── Inline WhatsApp CTA Toast ───
function WhatsAppCTAToast({ onDismiss }: { onDismiss: () => void }) {
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
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
      if (!res.ok) throw new Error(data.error || "Error");
      localStorage.setItem(STORAGE_KEY, "true");
      setDone(true);
      setTimeout(onDismiss, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="text-center py-2">
        <p className="text-sm font-semibold text-emerald mb-0.5">Listo!</p>
        <p className="text-[11px] text-muted-foreground">
          Te enviaremos alertas electorales por WhatsApp
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {/* Headline — sell the benefit */}
      <div>
        <p className="text-[13px] font-semibold text-foreground leading-tight">
          Estas noticias directo a tu WhatsApp
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Encuestas, fake news y alertas antes que nadie
        </p>
      </div>

      {/* Phone input + send */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-mono">
            +51
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              setError(null);
              setPhone(e.target.value.replace(/[^\d\s]/g, ""));
            }}
            placeholder="Tu numero"
            className="w-full rounded-lg border border-emerald/30 bg-background/80 pl-10 pr-2 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-emerald font-mono tabular-nums"
            maxLength={12}
            disabled={isSubmitting}
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!phone.trim() || isSubmitting}
          className="flex items-center gap-1.5 rounded-lg bg-emerald px-3.5 text-sm font-semibold text-white transition-all hover:bg-emerald/90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Activar</span>
            </>
          )}
        </button>
      </div>
      {error && <p className="text-[10px] text-rose">{error}</p>}

      {/* Trust signals */}
      <div className="flex items-center justify-center gap-3 text-[9px] text-muted-foreground/60">
        <span>100% gratis</span>
        <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/30" />
        <span>0 spam</span>
        <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/30" />
        <span>Cancela con un mensaje</span>
      </div>
    </div>
  );
}

// ─── Main Toast Component ───
export function AINotificationToast() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  const [current, setCurrent] = useState<ToastNotification | null>(null);
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const [ctaDismissedForever, setCtaDismissedForever] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const newsShownCount = useRef(0);
  const loaded = useRef(false);

  // Detect mobile vs desktop for toast animation direction
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Check if already subscribed or CTA was dismissed
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "true") {
      setCtaDismissedForever(true);
    }
    const ctaDismissed = localStorage.getItem(CTA_DISMISSED_KEY);
    if (ctaDismissed) {
      const elapsed = Date.now() - parseInt(ctaDismissed);
      if (elapsed < 3 * 24 * 60 * 60 * 1000) { // 3 day cooldown
        setCtaDismissedForever(true);
      }
    }
  }, []);

  // Fetch real news
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    async function loadNews() {
      try {
        const supabase = getSupabaseBrowser();
        if (!supabase) return;

        const { data, error } = await supabase
          .from("news_articles")
          .select("id, title, source, category, fact_check, published_at, source_url, is_breaking")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(20);

        if (error || !data || data.length === 0) return;

        const mapped: ToastNotification[] = data.map((row) => ({
          id: row.id,
          message: row.title,
          type: categoryToType(row.category, row.fact_check),
          time: timeAgo(row.published_at),
        }));

        setNotifications(mapped);
      } catch {
        // Silently fail
      }
    }

    loadNews();
  }, []);

  const showNext = useCallback(() => {
    if (notifications.length === 0) return;

    // After N news toasts, show CTA (if not already subscribed/dismissed)
    if (
      newsShownCount.current >= CTA_AFTER_N_NEWS &&
      !ctaDismissedForever &&
      !showCTA
    ) {
      setShowCTA(true);
      setCurrent({
        id: "cta",
        message: "",
        type: "cta",
        time: "",
      });
      setDismissed(false);
      return;
    }

    const notif = notifications[index % notifications.length];
    setCurrent(notif);
    setDismissed(false);
    setIndex((prev) => prev + 1);
    newsShownCount.current += 1;
  }, [notifications, index, ctaDismissedForever, showCTA]);

  // Initial delay
  useEffect(() => {
    if (notifications.length === 0) return;
    const timer = setTimeout(() => showNext(), 6000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications]);

  // Auto-dismiss news toasts after 6s (CTA stays longer — 15s)
  useEffect(() => {
    if (!current || dismissed) return;
    const duration = current.type === "cta" ? 25000 : 6000;
    const timer = setTimeout(() => setDismissed(true), duration);
    return () => clearTimeout(timer);
  }, [current, dismissed]);

  // Show next after dismiss
  useEffect(() => {
    if (!dismissed) return;
    const timer = setTimeout(() => showNext(), 15000);
    return () => clearTimeout(timer);
  }, [dismissed, showNext]);

  const handleDismissCTA = useCallback(() => {
    setDismissed(true);
    setShowCTA(false);
    setCtaDismissedForever(true);
    localStorage.setItem(CTA_DISMISSED_KEY, String(Date.now()));
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 left-4 sm:bottom-auto sm:top-4 sm:left-auto z-50 sm:max-w-sm pointer-events-none">
      <AnimatePresence mode="wait">
        {current && !dismissed && (
          <motion.div
            key={current.id + "-" + index}
            initial={{ opacity: 0, y: isMobile ? 30 : -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isMobile ? 20 : -20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={`pointer-events-auto rounded-xl border bg-card/95 backdrop-blur-md ${typeStyles[current.type]} ${current.type === "cta" ? "p-4 sm:p-5" : "p-3 sm:p-4"} shadow-2xl shadow-black/50`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${typeDotColors[current.type]}`} />
                <div className="flex items-center gap-1.5">
                  {current.type === "cta" ? (
                    <MessageCircle className="h-3 w-3 text-emerald" />
                  ) : (
                    <Sparkles className="h-3 w-3 text-primary" />
                  )}
                  <span className="text-[10px] font-mono font-bold tracking-wider text-foreground/90">
                    CONDOR AI
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  current.type === "cta" ? handleDismissCTA() : setDismissed(true);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Content — news toasts are clickable, navigate to /noticias */}
            {current.type === "cta" ? (
              <WhatsAppCTAToast onDismiss={handleDismissCTA} />
            ) : (
              <div
                className="cursor-pointer group"
                onClick={() => {
                  setDismissed(true);
                  router.push("/noticias");
                }}
              >
                <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed line-clamp-2 group-hover:text-primary transition-colors">
                  {current.message}
                </p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[9px] text-primary/70 group-hover:text-primary transition-colors">
                    Ver noticias →
                  </span>
                  <span className="text-[9px] font-mono text-muted-foreground/60">
                    {current.time}
                  </span>
                </div>
              </div>
            )}

            {/* Progress bar */}
            <motion.div
              className={`h-0.5 rounded-full mt-2 ${typeDotColors[current.type]}`}
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: current.type === "cta" ? 25 : 6, ease: "linear" }}
              style={{ opacity: 0.4 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
