"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { useCountry } from "@/lib/config/country-context";

// ─── Types ───

interface TickerItem {
  id: string;
  message: string;
  type: "update" | "alert" | "analysis" | "verification";
  time: string;
}

const typeDotColors: Record<string, string> = {
  update: "bg-emerald",
  alert: "bg-amber",
  analysis: "bg-sky",
  verification: "bg-primary",
};

// ─── Helpers ───

function categoryToType(category: string, factCheck?: string): TickerItem["type"] {
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
  if (isNaN(date.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffH < 24) return `${diffH}h`;
  if (diffD === 1) return "ayer";
  if (diffD < 7) return `${diffD}d`;
  return `${Math.floor(diffD / 7)}sem`;
}

// ─── Adaptive learning: track user dismiss behavior ───

const COLLAPSE_KEY = "condor_ticker_collapses";
const COLLAPSE_THRESHOLD = 3; // After 3 collapses in 7 days → start collapsed
const COLLAPSE_WINDOW = 7 * 24 * 60 * 60 * 1000; // 7 days

function getCollapseData(): { count: number; ts: number } {
  try {
    const raw = localStorage.getItem(COLLAPSE_KEY);
    if (!raw) return { count: 0, ts: Date.now() };
    const data = JSON.parse(raw);
    // Reset if window expired
    if (data.ts && Date.now() - data.ts > COLLAPSE_WINDOW) {
      localStorage.removeItem(COLLAPSE_KEY);
      return { count: 0, ts: Date.now() };
    }
    return { count: data.count || 0, ts: data.ts || Date.now() };
  } catch {
    return { count: 0, ts: Date.now() };
  }
}

function recordCollapse(): void {
  try {
    const { count } = getCollapseData();
    localStorage.setItem(
      COLLAPSE_KEY,
      JSON.stringify({ count: count + 1, ts: Date.now() })
    );
  } catch {
    /* silently fail */
  }
}

function shouldStartCollapsed(): boolean {
  return getCollapseData().count >= COLLAPSE_THRESHOLD;
}

// ─── Main Component ───

export function AINotificationToast() {
  const router = useRouter();
  const country = useCountry();
  const [items, setItems] = useState<TickerItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [collapsed, setCollapsed] = useState(true); // Default collapsed until we check
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  // ── Read learned preference from localStorage ──
  useEffect(() => {
    setCollapsed(shouldStartCollapsed());
    setReady(true);
  }, []);

  // ── Fetch news from Supabase ──
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
          .eq("country_code", country.code)
          .order("created_at", { ascending: false })
          .limit(20);

        if (error || !data || data.length === 0) return;

        setItems(
          data.map((row) => ({
            id: row.id,
            message: row.title,
            type: categoryToType(row.category, row.fact_check),
            time: timeAgo(row.published_at),
          }))
        );
      } catch {
        /* silently fail */
      }
    }

    loadNews();
  }, [country.code]);

  // ── Auto-cycle headlines every 8 seconds (only when expanded) ──
  useEffect(() => {
    if (items.length === 0 || collapsed) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [items.length, collapsed]);

  const handleCollapse = useCallback(() => {
    setCollapsed(true);
    recordCollapse();
  }, []);

  const handleExpand = useCallback(() => {
    setCollapsed(false);
  }, []);

  const handleNavigate = useCallback(() => {
    router.push(`/${country.code}/noticias`);
  }, [router, country.code]);

  // Don't render until ready and we have data
  if (!ready || items.length === 0) return null;

  const current = items[currentIndex];

  // ─── Collapsed: tiny pill at bottom-right ───
  if (collapsed) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        onClick={handleExpand}
        className="fixed bottom-2 right-4 sm:right-6 lg:right-auto lg:left-[256px] z-40 flex items-center gap-1.5 rounded-full border border-border/40 bg-card/80 backdrop-blur-sm px-2.5 py-1.5 shadow-md hover:shadow-lg hover:bg-card transition-all cursor-pointer group"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse" />
        <span className="text-[10px] font-mono font-medium text-muted-foreground group-hover:text-foreground transition-colors tabular-nums">
          {items.length}
        </span>
        <ChevronUp className="h-2.5 w-2.5 text-muted-foreground/40 group-hover:text-foreground transition-colors" />
      </motion.button>
    );
  }

  // ─── Expanded: full-width bottom bar ───
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed bottom-0 left-0 right-0 lg:left-[240px] z-40"
    >
      <div className="border-t border-border/30 bg-card/90 backdrop-blur-sm px-4 sm:px-6">
        <div className="flex items-center gap-2 py-2">
          {/* Left: CONDOR label */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`h-1.5 w-1.5 rounded-full ${typeDotColors[current.type]} animate-pulse`}
            />
            <Sparkles className="h-3 w-3 text-primary/50" />
            <span className="hidden sm:inline text-[9px] font-mono font-bold tracking-wider text-muted-foreground/70">
              CONDOR
            </span>
          </div>

          {/* Separator */}
          <div className="h-3 w-px bg-border/40 shrink-0" />

          {/* Center: cycling headline — click navigates to /noticias */}
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={handleNavigate}
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={current.id + "-" + currentIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
                className="text-[11px] text-foreground/60 truncate hover:text-primary transition-colors leading-tight"
              >
                {current.message}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Right: time + collapse */}
          <span className="text-[9px] font-mono text-muted-foreground/40 shrink-0 tabular-nums">
            {current.time}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCollapse();
            }}
            className="text-muted-foreground/30 hover:text-foreground transition-colors p-0.5 shrink-0 rounded-full"
            aria-label="Minimizar noticias"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
