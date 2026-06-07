"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Zap, ExternalLink } from "lucide-react";
import type { NewsArticle } from "@/lib/data/news";
import { useCountry } from "@/lib/config/country-context";

interface FlashResultsProps {
  articles: NewsArticle[];
}

export function FlashResults({ articles }: FlashResultsProps) {
  const country = useCountry();

  // Etiqueta según país: en Colombia se habla de "preconteo" / "resultados preliminares".
  // En Perú la frase popular es "flash electoral / boca de urna".
  const sectionLabel = country.code === "co"
    ? "Preconteo · Resultados Preliminares"
    : "Flash Electoral · Boca de Urna";

  // Find articles about preliminary results, exit polls, vote counts.
  // CRITICAL: only show items from the last 24h — this block is for "live" /
  // "election-day" coverage, not for week-old poll narratives. Without the
  // recency filter we'd surface stuff like "a 14 días de las elecciones",
  // which is exactly the opposite of what this band promises.
  const resultArticles = useMemo(() => {
    const RECENCY_MS = 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - RECENCY_MS;
    const keywords = [
      // Genéricos
      "exit poll", "resultados preliminares", "pasan a segunda vuelta", "irían a segunda vuelta",
      // PE-ish
      "boca de urna", "flash electoral", "conteo rápido", "resultados a boca",
      // CO-ish
      "preconteo", "boletín de la registraduría", "boletín registraduría", "registraduría informa",
      "sondeo a pie de urna", "encuesta a boca de urna",
    ];
    return articles.filter((a) => {
      // 1. Must be recent — `a.time` is the ISO of real publication (or DB
      //    insertion as fallback). This block is for live-day coverage, not
      //    week-old narratives.
      const stamp = a.time ? new Date(a.time).getTime() : NaN;
      if (!Number.isFinite(stamp) || stamp < cutoff) return false;
      // 2. Must match a live-results keyword
      const text = `${a.title} ${a.summary || ""}`.toLowerCase();
      return keywords.some((kw) => text.includes(kw));
    }).slice(0, 4);
  }, [articles]);

  if (resultArticles.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border-2 border-rose/30 bg-gradient-to-br from-rose-50 to-card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 bg-rose/5 border-b border-rose/10">
        <Zap className="h-5 w-5 text-rose" />
        <span className="text-sm font-black text-rose uppercase tracking-wider">{sectionLabel}</span>
        <span className="h-2 w-2 rounded-full bg-rose pulse-dot" />
      </div>

      {/* Results articles */}
      <div className="divide-y divide-border">
        {resultArticles.map((article, i) => {
          // Clean title — remove source suffix
          const title = article.title.replace(/\s*[-–—]\s*[A-ZÁ-Ú][a-záéíóú\s]+$/, "").trim();

          return (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {article.sourceUrl ? (
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 px-5 py-3 hover:bg-rose/5 transition-colors group"
                >
                  <span className="flex-shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-rose" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-rose transition-colors leading-snug">
                      {title}
                    </p>
                    <span className="text-[10px] text-rose/70 font-medium mt-1 inline-block">
                      {article.source}
                    </span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                </a>
              ) : (
                <div className="flex items-start gap-3 px-5 py-3">
                  <span className="flex-shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-rose" />
                  <div>
                    <p className="text-sm font-medium text-foreground leading-snug">{title}</p>
                    <span className="text-[10px] text-rose/70 font-medium mt-1 inline-block">{article.source}</span>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Footer — pollsters de referencia del país */}
      <div className="px-5 py-2 border-t border-rose/10 bg-rose/5">
        <p className="text-[9px] text-muted-foreground/50 font-mono">
          Fuentes: {country.pollsters.slice(0, 3).join(", ")} · Resultados preliminares no oficiales
        </p>
      </div>
    </motion.div>
  );
}
