"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  User,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  LayoutDashboard,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Candidate } from "@/lib/data/candidates";
import { type NewsArticle } from "@/lib/data/news";
import { type FactCheck } from "@/lib/data/fact-checks";
import { WhatsAppCTA } from "@/components/dashboard/whatsapp-cta";
import { useAnalytics } from "@/hooks/use-analytics";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCountry } from "@/lib/config/country-context";
import DashboardClient from "./dashboard-client";

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT — TOGGLE LIGHT / FULL
   ═══════════════════════════════════════════════════════════════════════════ */

type DashboardMode = "light" | "full";

interface HomeClientProps {
  candidates: Candidate[];
  topCandidates: Candidate[];
  articles: NewsArticle[];
  factChecks: FactCheck[];
}

export default function HomeClient({
  candidates,
  topCandidates,
  articles,
  factChecks,
}: HomeClientProps) {
  const { trackEvent } = useAnalytics();
  const country = useCountry();
  const scrollRef = useRef<HTMLDivElement>(null);

  const defaultMode: DashboardMode = country.code === "co" ? "full" : "light";
  const [mode, setMode] = useState<DashboardMode>(defaultMode);
  const [mounted, setMounted] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`condor-dashboard-mode-${country.code}`) as DashboardMode | null;
    if (saved === "light" || saved === "full") setMode(saved);
    setMounted(true);
  }, [country.code]);

  // Persist to localStorage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(`condor-dashboard-mode-${country.code}`, mode);
  }, [mode, mounted]);

  const handleToggle = (newMode: DashboardMode) => {
    setMode(newMode);
    trackEvent("click", "dashboard_mode_toggle", { mode: newMode });
  };

  return (
    <div className="space-y-6">
      {/* Toggle pill */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center rounded-full border border-border bg-muted/50 p-0.5">
          <button
            onClick={() => handleToggle("light")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
              mode === "light"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Zap className="h-3.5 w-3.5" />
            Resumen
          </button>
          <button
            onClick={() => handleToggle("full")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
              mode === "full"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Dashboard
          </button>
        </div>
      </div>

      {/* Content based on mode */}
      <AnimatePresence mode="wait">
        {mode === "light" ? (
          <motion.div
            key="light"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            <EncuestasBlock candidates={topCandidates} />
            <ConocelosBlock
              candidates={topCandidates}
              scrollRef={scrollRef}
              trackEvent={trackEvent}
            />
            <QuizCTABlock trackEvent={trackEvent} />
            <NoticiasBlock articles={articles.slice(0, 3)} />
            <WhatsAppCTA context="default" />
          </motion.div>
        ) : (
          <motion.div
            key="full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <DashboardClient
              candidates={candidates}
              topCandidates={topCandidates}
              articles={articles}
              factChecks={factChecks}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BLOQUE 1: ¿QUIÉN VA GANANDO?
   ═══════════════════════════════════════════════════════════════════════════ */

function EncuestasBlock({ candidates }: { candidates: Candidate[] }) {
  const country = useCountry();
  const maxPoll = candidates[0]?.pollAverage || 15;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-lg font-bold text-foreground mb-1">
        ¿Quién va ganando?
      </h2>
      <p className="text-xs text-muted-foreground mb-4">
        Promedio {country.pollsters.slice(0, 4).join(", ")}
      </p>

      <div className="space-y-3">
        {candidates.map((candidate, index) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
          >
            <Link
              href={`/${country.code}/candidatos/${candidate.slug}`}
              className="flex items-center gap-3 group"
            >
              {/* Photo circle */}
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 overflow-hidden"
                style={{
                  backgroundColor: candidate.partyColor + "20",
                  borderColor: candidate.partyColor,
                }}
              >
                {candidate.photo && (candidate.photo.startsWith("http") || candidate.photo.startsWith("/")) ? (
                  <img
                    src={candidate.photo}
                    alt={candidate.shortName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User
                    className="h-5 w-5"
                    style={{ color: candidate.partyColor }}
                  />
                )}
              </div>

              {/* Name + bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {candidate.shortName}
                  </span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="font-mono text-sm font-bold tabular-nums">
                      {candidate.pollAverage.toFixed(1)}%
                    </span>
                    {candidate.pollTrend === "up" && (
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    )}
                    {candidate.pollTrend === "down" && (
                      <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
                    )}
                    {candidate.pollTrend === "stable" && (
                      <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                </div>
                {/* Animated bar */}
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: candidate.partyColor }}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(candidate.pollAverage / maxPoll) * 100}%`,
                    }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.08 + 0.2,
                    }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground mt-0.5 block">
                  {candidate.party}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BLOQUE 2: CONÓCELOS EN 30 SEGUNDOS
   ═══════════════════════════════════════════════════════════════════════════ */

function ConocelosBlock({
  candidates,
  scrollRef,
  trackEvent,
}: {
  candidates: Candidate[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  trackEvent: (
    event: string,
    target: string,
    metadata?: Record<string, unknown>
  ) => void;
}) {
  const country = useCountry();
  return (
    <section>
      <h2 className="text-lg font-bold text-foreground mb-1">
        Conócelos en 30 segundos
      </h2>
      <p className="text-xs text-muted-foreground mb-4">
        Desliza para ver a los candidatos →
      </p>

      <div
        ref={scrollRef}
        className="-mx-4 px-4 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {candidates.map((candidate, index) => {
          const starProposal = candidate.keyProposals[0];
          return (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.08 }}
            >
              <Link
                href={`/${country.code}/candidatos/${candidate.slug}`}
                onClick={() =>
                  trackEvent("click", "resumen_candidate_card", {
                    candidate: candidate.slug,
                  })
                }
                className="block w-56 flex-shrink-0 snap-start rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md active:scale-[0.98]"
              >
                {/* Top color band */}
                <div
                  className="h-1 w-full rounded-full mb-3"
                  style={{ backgroundColor: candidate.partyColor }}
                />

                {/* Photo + name */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full border-2 overflow-hidden flex-shrink-0"
                    style={{
                      backgroundColor: candidate.partyColor + "20",
                      borderColor: candidate.partyColor,
                    }}
                  >
                    {candidate.photo && (candidate.photo.startsWith("http") || candidate.photo.startsWith("/")) ? (
                      <img
                        src={candidate.photo}
                        alt={candidate.shortName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User
                        className="h-6 w-6"
                        style={{ color: candidate.partyColor }}
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {candidate.shortName}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {candidate.party}
                    </p>
                  </div>
                </div>

                {/* Star proposal */}
                {starProposal && (
                  <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                    💡 {starProposal.title}
                  </p>
                )}

                {/* "Ver mas" link hint */}
                <div className="flex items-center gap-1 mt-3 text-xs font-medium text-primary">
                  Ver perfil
                  <ChevronRight className="h-3 w-3" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BLOQUE 3: ¿NO SABES POR QUIÉN VOTAR?
   ═══════════════════════════════════════════════════════════════════════════ */

function QuizCTABlock({
  trackEvent,
}: {
  trackEvent: (
    event: string,
    target: string,
    metadata?: Record<string, unknown>
  ) => void;
}) {
  const country = useCountry();
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Link
        href={`/${country.code}/quiz`}
        onClick={() => trackEvent("click", "resumen_quiz_cta")}
        className="block"
      >
        <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/5 p-6 text-center transition-all hover:border-primary/40 hover:shadow-lg active:scale-[0.99]">
          <div className="text-4xl mb-3">🗳️</div>
          <h2 className="text-lg font-bold text-foreground mb-2">
            ¿No sabes por quién votar?
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Responde 10 preguntas y descubre con quién coincides
          </p>
          <Button size="lg" className="w-full text-base font-semibold">
            Hacer el quiz
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </Link>
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BLOQUE 4: ¿QUÉ PASÓ HOY?
   ═══════════════════════════════════════════════════════════════════════════ */

const factCheckConfig: Record<
  string,
  { label: string; className: string; Icon: typeof ShieldCheck }
> = {
  verified: {
    label: "Verificado",
    className: "text-emerald-600 bg-emerald-50 border-emerald-200",
    Icon: ShieldCheck,
  },
  questionable: {
    label: "Cuestionable",
    className: "text-amber-600 bg-amber-50 border-amber-200",
    Icon: AlertTriangle,
  },
  false: {
    label: "Falso",
    className: "text-rose-600 bg-rose-50 border-rose-200",
    Icon: AlertTriangle,
  },
};

function NoticiasBlock({ articles }: { articles: NewsArticle[] }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <span className="h-2 w-2 rounded-full bg-rose-500 pulse-dot" />
        <h2 className="text-lg font-bold text-foreground">¿Qué pasó hoy?</h2>
      </div>

      <div className="space-y-3">
        {articles.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            {article.sourceUrl ? (
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/50"
              >
                <NewsItemContent article={article} />
              </a>
            ) : (
              <div className="rounded-xl border border-border bg-card p-4">
                <NewsItemContent article={article} />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {articles.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No hay noticias recientes
        </p>
      )}
    </section>
  );
}

function NewsItemContent({ article }: { article: NewsArticle }) {
  const config = article.factCheck
    ? factCheckConfig[article.factCheck]
    : null;

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </p>
        <p className="text-[11px] text-muted-foreground mt-1">
          {article.source} · {article.time}
        </p>
      </div>
      {config && (
        <Badge
          variant="outline"
          className={cn(
            "flex-shrink-0 text-[10px] gap-1 border",
            config.className
          )}
        >
          <config.Icon className="h-3 w-3" />
          {config.label}
        </Badge>
      )}
    </div>
  );
}
