"use client";

import { useState, useEffect, useCallback } from "react";
import { CandidateRanking } from "@/components/dashboard/candidate-ranking";
import { PollTrendChart } from "@/components/charts/poll-trend-chart";
import { NewsTicker } from "@/components/dashboard/news-ticker";
import { WhatsAppCTA } from "@/components/dashboard/whatsapp-cta";
import { AIHero } from "@/components/home/ai-hero";
import { AIPromptBar } from "@/components/home/ai-prompt-bar";
import { AICapabilitiesGrid } from "@/components/home/ai-capabilities-grid";
import { ElectionCountdownStrip } from "@/components/home/election-countdown-strip";
import {
  Dice6,
  FileText,
  Play,
  Activity,
  ArrowRight,
  Shield,
  TrendingUp,
  Trophy,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { type Candidate } from "@/lib/data/candidates";
import { type NewsArticle } from "@/lib/data/news";
import { type FactCheck } from "@/lib/data/fact-checks";
import { runSimulation, DEFAULT_CONFIG, type SimulationResult } from "@/lib/data/simulador";
import { cn } from "@/lib/utils";

interface DashboardClientProps {
  candidates: Candidate[];
  topCandidates: Candidate[];
  articles: NewsArticle[];
  factChecks: FactCheck[];
}

export default function DashboardClient({ candidates, topCandidates, articles, factChecks }: DashboardClientProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* === SECTION 1: AI Hero === */}
      <AIHero />

      {/* === SECTION 2: AI Prompt Bar === */}
      <AIPromptBar />

      {/* === SECTION 3: AI Capabilities Grid === */}
      <AICapabilitiesGrid />

      {/* === SECTION 4: Quick Actions — herramientas para decidir === */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <QuickAction
          href="/quiz"
          title="¿A quien votar?"
          description="Descubre tu candidato ideal"
          gradient="from-primary/20 to-purple-500/20"
        />
        <QuickAction
          href="/planes/comparar"
          title="Comparar planes"
          description="Propuestas lado a lado"
          gradient="from-amber/20 to-orange-500/20"
        />
        <QuickAction
          href="/candidatos/comparar"
          title="Comparar candidatos"
          description="Perfil vs perfil"
          gradient="from-sky/20 to-cyan-500/20"
        />
        <QuickAction
          href="/verificador"
          title="Verificar noticia"
          description="¿Es verdad o falso?"
          gradient="from-emerald/20 to-green-500/20"
        />
      </div>

      {/* === SECTION 5: Election Strip === */}
      <ElectionCountdownStrip />

      {/* === SECTION 6+7: Feature Highlights + Analytics (unified grid) === */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Row 1: Simulador + Verificador (cols 1-2), Planes spans rows (col 3) */}
        <SimuladorHighlight candidates={candidates} />
        <VerificadorHighlight factChecks={factChecks} />
        <div className="lg:row-span-2">
          <PlanesHighlight topCandidates={topCandidates} />
        </div>

        {/* Row 2: Intención de Voto below Simulador+Verificador (cols 1-2) */}
        <div className="lg:col-span-2">
          <PollTrendChart candidates={candidates.filter(c => c.pollAverage > 0)} />
        </div>
      </div>

      {/* === SECTION 7: Ranking + News === */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <CandidateRanking candidates={candidates.filter(c => c.pollAverage > 0)} />
        </div>
        <div className="space-y-6">
          <NewsTicker articles={articles} />
          <WhatsAppCTA context="dashboard" />
        </div>
      </div>
    </div>
  );
}

// ─── SIMULADOR HIGHLIGHT ───

function SimuladorHighlight({ candidates }: { candidates: Candidate[] }) {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleQuickSim = useCallback(() => {
    setIsRunning(true);
    setTimeout(() => {
      const simResult = runSimulation({ ...DEFAULT_CONFIG, numSimulations: 5000 }, candidates);
      setResult(simResult);
      setIsRunning(false);
    }, 600);
  }, [candidates]);

  const topThree = result
    ? [...result.candidates].sort((a, b) => b.winProbability - a.winProbability).slice(0, 3)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="bg-card border-border overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary via-purple-500 to-transparent" />
        <CardContent className="p-4 sm:p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Dice6 className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground">Simulador Electoral</h3>
              <p className="text-[10px] text-muted-foreground font-mono">MONTE CARLO</p>
            </div>
            <Badge variant="secondary" className="text-[9px] font-mono">NEW</Badge>
          </div>

          {!result ? (
            <div className="flex-1 flex flex-col items-center justify-center py-4 sm:py-6">
              <p className="text-xs text-muted-foreground text-center mb-4">
                Ejecuta 5,000 simulaciones para proyectar quien ganaria hoy
              </p>
              <Button
                onClick={handleQuickSim}
                disabled={isRunning}
                size="sm"
                className="gap-2 font-mono text-xs"
              >
                {isRunning ? (
                  <>
                    <Activity className="h-3.5 w-3.5 animate-pulse" />
                    SIMULANDO...
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    SIMULAR AHORA
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex-1 space-y-3">
              {topThree?.map((c, i) => (
                <div key={c.candidateId} className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground w-4 tabular-nums">
                    {i === 0 ? <Trophy className="h-3.5 w-3.5 text-amber" /> : `${i + 1}.`}
                  </span>
                  <div
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: c.partyColor }}
                  />
                  <span className="text-xs text-foreground flex-1 truncate">
                    {c.shortName}
                  </span>
                  <span className="font-mono text-xs font-bold tabular-nums text-foreground">
                    {c.winProbability.toFixed(1)}%
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-border">
                <p className="text-[10px] text-muted-foreground font-mono">
                  {result.totalSimulations.toLocaleString()} simulaciones ejecutadas
                </p>
              </div>
            </div>
          )}

          <Link href="/simulador" className="mt-3">
            <Button variant="ghost" size="sm" className="w-full gap-2 text-xs text-muted-foreground hover:text-primary">
              Ver simulador completo
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── VERIFICADOR HIGHLIGHT ───

const VERDICT_STYLES: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
  VERDADERO: { color: "text-emerald", icon: CheckCircle2 },
  PARCIALMENTE_VERDADERO: { color: "text-sky", icon: AlertTriangle },
  ENGANOSO: { color: "text-amber", icon: AlertTriangle },
  FALSO: { color: "text-rose", icon: XCircle },
  NO_VERIFICABLE: { color: "text-muted-foreground", icon: AlertTriangle },
};

function VerificadorHighlight({ factChecks }: { factChecks: FactCheck[] }) {
  // Pick up to 3 recent fact-checks, prioritizing variety of verdicts
  const displayChecks = pickDiverseChecks(factChecks, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-card border-border overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-emerald via-sky to-transparent" />
        <CardContent className="p-4 sm:p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald/10">
              <ShieldCheck className="h-4 w-4 text-emerald" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground">Verificador</h3>
              <p className="text-[10px] text-muted-foreground font-mono">FACT-CHECK IA</p>
            </div>
            <Badge variant="secondary" className="text-[9px] font-mono">LIVE</Badge>
          </div>

          <p className="text-xs text-muted-foreground mb-3">
            Verifica cualquier afirmacion electoral con IA en tiempo real
          </p>

          {/* Real fact-checks from DB */}
          <div className="flex-1 space-y-2.5">
            {displayChecks.length > 0 ? (
              displayChecks.map((fc) => {
                const style = VERDICT_STYLES[fc.verdict] || VERDICT_STYLES.NO_VERIFICABLE;
                const Icon = style.icon;
                return (
                  <div key={fc.id} className="flex items-start gap-2.5 rounded-lg border border-border p-2.5">
                    <Icon className={cn("h-4 w-4 flex-shrink-0 mt-0.5", style.color)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-foreground line-clamp-1">&ldquo;{fc.claim}&rdquo;</p>
                      <p className={cn("text-[10px] font-mono font-bold mt-0.5", style.color)}>
                        {fc.verdict.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-[11px] text-muted-foreground/60 italic py-4 text-center">
                Sin verificaciones recientes
              </p>
            )}
          </div>

          <Link href="/verificador" className="mt-3">
            <Button variant="ghost" size="sm" className="w-full gap-2 text-xs text-muted-foreground hover:text-primary">
              Verificar una afirmacion
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/** Pick up to N fact-checks with maximum verdict diversity */
function pickDiverseChecks(checks: FactCheck[], n: number): FactCheck[] {
  if (checks.length <= n) return checks;

  // Group by verdict
  const byVerdict = new Map<string, FactCheck[]>();
  for (const fc of checks) {
    const arr = byVerdict.get(fc.verdict) || [];
    arr.push(fc);
    byVerdict.set(fc.verdict, arr);
  }

  // Priority order: FALSO first (most interesting), then ENGANOSO, VERDADERO, others
  const priorityOrder = ["FALSO", "ENGANOSO", "PARCIALMENTE_VERDADERO", "VERDADERO", "NO_VERIFICABLE"];
  const picked: FactCheck[] = [];
  const usedVerdicts = new Set<string>();

  // First pass: one of each verdict type
  for (const verdict of priorityOrder) {
    if (picked.length >= n) break;
    const arr = byVerdict.get(verdict);
    if (arr && arr.length > 0) {
      picked.push(arr[0]);
      usedVerdicts.add(verdict);
    }
  }

  // Second pass: fill remaining with most recent
  if (picked.length < n) {
    for (const fc of checks) {
      if (picked.length >= n) break;
      if (!picked.some((p) => p.id === fc.id)) {
        picked.push(fc);
      }
    }
  }

  return picked.slice(0, n);
}

// ─── PLANES HIGHLIGHT ───

function PlanesHighlight({ topCandidates }: { topCandidates: Candidate[] }) {
  const categories = [
    { key: "economia", label: "Economia", icon: TrendingUp, color: "text-emerald" },
    { key: "seguridad", label: "Seguridad", icon: Shield, color: "text-rose" },
    { key: "salud", label: "Salud", icon: Activity, color: "text-sky" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="h-full"
    >
      <Card className="bg-card border-border overflow-hidden h-full">
        <div className="h-1 w-full bg-gradient-to-r from-amber via-amber/50 to-transparent" />
        <CardContent className="p-4 sm:p-5 flex flex-col h-[calc(100%-0.25rem)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber/10">
              <FileText className="h-4 w-4 text-amber" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground">Planes de Gobierno</h3>
              <p className="text-[10px] text-muted-foreground font-mono">PROPUESTAS CLAVE</p>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            {categories.map(({ key, label, icon: Icon, color }) => (
              <div key={key}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Icon className={cn("h-3 w-3", color)} />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    {label}
                  </span>
                </div>
                <div className="space-y-1">
                  {topCandidates.map((c) => {
                    const proposal = c.keyProposals.find((p) => p.category === key);
                    if (!proposal) return null;
                    return (
                      <Link key={c.id} href={`/candidatos/${c.slug}`}>
                        <div className="group flex items-start gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-accent/50">
                          <div
                            className="mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: c.partyColor }}
                          />
                          <div className="min-w-0">
                            <p className="text-[11px] text-foreground truncate group-hover:text-primary transition-colors">
                              <span className="font-medium">{c.shortName}:</span>{" "}
                              {proposal.title}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <Link href="/planes" className="mt-3">
            <Button variant="ghost" size="sm" className="w-full gap-2 text-xs text-muted-foreground hover:text-primary">
              Ver todos los planes
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── QUICK ACTION ───

function QuickAction({
  href,
  title,
  description,
  gradient,
}: {
  href: string;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br ${gradient} p-3 sm:p-4 transition-all duration-300 hover:border-primary/30`}
      >
        <p className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {title}
        </p>
        <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground">{description}</p>
      </motion.div>
    </Link>
  );
}
