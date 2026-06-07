"use client";

import { motion } from "framer-motion";
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Sparkles,
  Newspaper,
} from "lucide-react";
import Link from "next/link";
import { useCountry } from "@/lib/config/country-context";

interface BriefingData {
  editorial_summary: string;
  briefing_date: string;
  top_stories: Array<{
    title: string;
    summary: string;
    source: string;
    impact_score: number;
  }>;
  poll_movements: Array<{
    candidate: string;
    previous: number;
    current: number;
    direction: "up" | "down" | "stable";
  }> | null;
}

interface AnalisisClientProps {
  briefing: BriefingData;
  prevDate: string | null;
  nextDate: string | null;
}

export default function AnalisisClient({
  briefing,
  prevDate,
  nextDate,
}: AnalisisClientProps) {
  const country = useCountry();

  const dateFormatted = new Date(briefing.briefing_date + "T12:00:00").toLocaleDateString(
    "es-PE",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  );

  // Split editorial into paragraphs
  const paragraphs = briefing.editorial_summary
    .split("\n")
    .filter((p) => p.trim().length > 0);

  const movements = briefing.poll_movements || [];
  const stories = briefing.top_stories || [];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Link
          href={`/${country.code}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <span className="text-xs font-mono uppercase tracking-wider text-primary font-semibold">
            Análisis CONDOR AI
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
          Análisis electoral — {dateFormatted}
        </h1>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{dateFormatted}</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            <span>Generado por CONDOR Brain</span>
          </div>
        </div>
      </motion.header>

      {/* Editorial content — THE SEO CONTENT */}
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border-l-4 border-primary pl-6 space-y-4"
      >
        {paragraphs.map((p, i) => (
          <p
            key={i}
            className={
              i === 0
                ? "text-lg sm:text-xl font-semibold text-foreground leading-snug"
                : "text-base text-muted-foreground leading-relaxed"
            }
          >
            {p}
          </p>
        ))}
      </motion.article>

      {/* Poll movements */}
      {movements.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-5 sm:p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-sky" />
            <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground font-medium">
              Movimientos en encuestas
            </h2>
          </div>
          <div className="space-y-3">
            {movements.map((m) => {
              const diff = m.current - m.previous;
              const diffStr = diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
              return (
                <div key={m.candidate} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{m.candidate}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {m.previous.toFixed(1)}% → {m.current.toFixed(1)}%
                    </span>
                    <span
                      className={`text-sm font-mono font-bold ${
                        m.direction === "up"
                          ? "text-emerald"
                          : m.direction === "down"
                            ? "text-rose"
                            : "text-muted-foreground"
                      }`}
                    >
                      {diffStr}pp
                    </span>
                    {m.direction === "up" && <TrendingUp className="h-4 w-4 text-emerald" />}
                    {m.direction === "down" && <TrendingDown className="h-4 w-4 text-rose" />}
                    {m.direction === "stable" && <Minus className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* Top stories */}
      {stories.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-5 sm:p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Newspaper className="h-4 w-4 text-rose" />
            <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground font-medium">
              Noticias que marcaron el día
            </h2>
          </div>
          <div className="space-y-4">
            {stories.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-sm text-primary font-bold mt-0.5 flex-shrink-0">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.summary}</p>
                  <p className="text-xs text-primary mt-1">{s.source}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Navigation between dates */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-between pt-4 border-t border-border"
      >
        {prevDate ? (
          <Link
            href={`/${country.code}/analisis/${prevDate}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            {new Date(prevDate + "T12:00:00").toLocaleDateString("es-PE", {
              day: "numeric",
              month: "short",
            })}
          </Link>
        ) : (
          <div />
        )}

        <Link
          href={`/${country.code}`}
          className="text-xs text-primary font-medium hover:text-primary/80 transition-colors"
        >
          Ir al inicio
        </Link>

        {nextDate ? (
          <Link
            href={`/${country.code}/analisis/${nextDate}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {new Date(nextDate + "T12:00:00").toLocaleDateString("es-PE", {
              day: "numeric",
              month: "short",
            })}
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <div />
        )}
      </motion.nav>

      {/* Disclaimer */}
      <div className="text-center pb-6">
        <p className="text-xs text-muted-foreground/50">
          Análisis generado automáticamente por CONDOR Brain · IA que monitorea{" "}
          {country.pollsters.slice(0, 3).join(", ")} y{" "}
          {country.mediaSources.slice(0, 3).map((s) => s.name).join(", ")}
        </p>
      </div>
    </div>
  );
}
