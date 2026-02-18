"use client";

import { useState, useCallback } from "react";
import { CandidateRanking } from "@/components/dashboard/candidate-ranking";
import { PollTrendChart } from "@/components/charts/poll-trend-chart";
import { NewsTicker } from "@/components/dashboard/news-ticker";
import { AIHero } from "@/components/home/ai-hero";
import { AIPromptBar } from "@/components/home/ai-prompt-bar";
import { AICapabilitiesGrid } from "@/components/home/ai-capabilities-grid";
import { AIActivityFeed } from "@/components/home/ai-activity-feed";
import { ElectionCountdownStrip } from "@/components/home/election-countdown-strip";
import {
  Scan,
  Dice6,
  FileText,
  Play,
  Activity,
  ArrowRight,
  Shield,
  Scale,
  DollarSign,
  Network,
  TrendingUp,
  Trophy,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { candidates, getTopCandidates } from "@/lib/data/candidates";
import { radiografiaData, formatSoles } from "@/lib/data/radiografia";
import { runSimulation, DEFAULT_CONFIG, type SimulationResult } from "@/lib/data/simulador";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* === SECTION 1: AI Hero === */}
      <AIHero />

      {/* === SECTION 2: AI Prompt Bar === */}
      <AIPromptBar />

      {/* === SECTION 3: AI Capabilities Grid === */}
      <AICapabilitiesGrid />

      {/* === SECTION 4: Election Strip + AI Activity Feed === */}
      <ElectionCountdownStrip />
      <AIActivityFeed />

      {/* === SECTION 5: Feature Highlights === */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <SimuladorHighlight />
        <RadiografiaHighlight />
        <PlanesHighlight />
      </div>

      {/* === SECTION 6: Main Analytics Grid === */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <PollTrendChart />
          <CandidateRanking />
        </div>
        <div className="space-y-6">
          <NewsTicker />
          <WhatsAppCTA />
        </div>
      </div>

      {/* === SECTION 7: Quick Actions === */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <QuickAction
          href="/verificador"
          title="Preguntale a la IA"
          description="Chat con CONDOR AI"
          gradient="from-primary/20 to-purple-500/20"
        />
        <QuickAction
          href="/planes/comparar"
          title="Comparar planes"
          description="Lado a lado por tema"
          gradient="from-amber/20 to-orange-500/20"
        />
        <QuickAction
          href="/quiz"
          title="Descubre tu candidato"
          description="Quiz de compatibilidad"
          gradient="from-indigo/20 to-purple-500/20"
        />
        <QuickAction
          href="/candidatos/comparar"
          title="Comparar candidatos"
          description="Perfil a perfil"
          gradient="from-sky/20 to-cyan-500/20"
        />
        <QuickAction
          href="/verificador"
          title="Verificar noticia"
          description="Fact-checker con IA"
          gradient="from-emerald/20 to-green-500/20"
        />
        <QuickAction
          href="/en-vivo"
          title="Resultados en vivo"
          description="El dia de la eleccion"
          gradient="from-rose/20 to-red-500/20"
        />
      </div>
    </div>
  );
}

// ─── SIMULADOR HIGHLIGHT ───

function SimuladorHighlight() {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleQuickSim = useCallback(() => {
    setIsRunning(true);
    setTimeout(() => {
      const simResult = runSimulation({ ...DEFAULT_CONFIG, numSimulations: 5000 });
      setResult(simResult);
      setIsRunning(false);
    }, 600);
  }, []);

  const topThree = result
    ? [...result.candidates].sort((a, b) => b.winProbability - a.winProbability).slice(0, 3)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="bg-card border-border overflow-hidden h-full">
        <div className="h-1 w-full bg-gradient-to-r from-primary via-purple-500 to-transparent" />
        <CardContent className="p-4 sm:p-5 flex flex-col h-full">
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

// ─── RADIOGRAFIA HIGHLIGHT ───

function RadiografiaHighlight() {
  const candidatesWithData = candidates
    .filter((c) => radiografiaData[c.id])
    .map((c) => ({
      ...c,
      radiografia: radiografiaData[c.id],
    }));

  const getRiskColor = (score: number) =>
    score >= 60 ? "text-rose" : score >= 35 ? "text-amber" : "text-emerald";
  const getRiskBg = (score: number) =>
    score >= 60 ? "bg-rose/10" : score >= 35 ? "bg-amber/10" : "bg-emerald/10";
  const getRiskLabel = (score: number) =>
    score >= 60 ? "ALTO" : score >= 35 ? "MEDIO" : "BAJO";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-card border-border overflow-hidden h-full">
        <div className="h-1 w-full bg-gradient-to-r from-rose via-amber to-transparent" />
        <CardContent className="p-4 sm:p-5 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose/10">
              <Scan className="h-4 w-4 text-rose" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground">Radiografia</h3>
              <p className="text-[10px] text-muted-foreground font-mono">INTELIGENCIA</p>
            </div>
            <Badge variant="secondary" className="text-[9px] font-mono">NEW</Badge>
          </div>

          {/* Category icons */}
          <div className="flex items-center gap-3 mb-3 text-[10px] text-muted-foreground font-mono">
            <span className="flex items-center gap-1"><DollarSign className="h-3 w-3 text-emerald" /> Patrimonio</span>
            <span className="flex items-center gap-1"><Scale className="h-3 w-3 text-rose" /> Legal</span>
            <span className="flex items-center gap-1"><Network className="h-3 w-3 text-indigo-400" /> Red</span>
          </div>

          {/* Candidate risk scores */}
          <div className="flex-1 space-y-2.5">
            {candidatesWithData.map((c) => {
              const r = c.radiografia;
              const latestP = r.patrimonio[r.patrimonio.length - 1];
              return (
                <Link key={c.id} href={`/radiografia/${c.id}`}>
                  <div className="group flex items-center gap-3 rounded-lg border border-border p-2.5 transition-all hover:border-primary/30 hover:bg-accent/50">
                    <div className={cn(
                      "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2",
                      getRiskBg(r.riskScore),
                      r.riskScore >= 60 ? "border-rose/40" : r.riskScore >= 35 ? "border-amber/40" : "border-emerald/40"
                    )}>
                      <span className={cn("font-mono text-sm font-bold tabular-nums", getRiskColor(r.riskScore))}>
                        {r.riskScore}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {c.shortName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
                          {r.legalHistory.length} proc.
                        </span>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
                          {latestP ? formatSoles(latestP.netWorth) : "—"}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] font-mono",
                        r.riskScore >= 60
                          ? "border-rose/20 text-rose"
                          : r.riskScore >= 35
                            ? "border-amber/20 text-amber"
                            : "border-emerald/20 text-emerald"
                      )}
                    >
                      {getRiskLabel(r.riskScore)}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>

          <Link href="/radiografia" className="mt-3">
            <Button variant="ghost" size="sm" className="w-full gap-2 text-xs text-muted-foreground hover:text-primary">
              Ver radiografia completa
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── PLANES HIGHLIGHT ───

function PlanesHighlight() {
  const topCandidates = getTopCandidates(3);
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
    >
      <Card className="bg-card border-border overflow-hidden h-full">
        <div className="h-1 w-full bg-gradient-to-r from-amber via-amber/50 to-transparent" />
        <CardContent className="p-4 sm:p-5 flex flex-col h-full">
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

// ─── WHATSAPP CTA ───

function WhatsAppCTA() {
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check localStorage on mount
  const [checked, setChecked] = useState(false);
  if (!checked && typeof window !== "undefined") {
    const sub = localStorage.getItem("condor_wa_subscribed");
    if (sub === "true" && !isSubscribed) {
      setIsSubscribed(true);
    }
    setChecked(true);
  }

  const handleSubscribe = async () => {
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
      localStorage.setItem("condor_wa_subscribed", "true");
      setIsSubscribed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al suscribirse");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="bg-card border-border overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-emerald via-emerald/50 to-transparent" />
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald/10">
              <MessageCircle className="h-5 w-5 text-emerald" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Alertas por WhatsApp
              </h3>
              <p className="text-[10px] text-muted-foreground">
                Tu agente electoral personal — gratis
              </p>
            </div>
          </div>

          {isSubscribed ? (
            <div className="text-center py-3">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald/20">
                <Sparkles className="h-5 w-5 text-emerald" />
              </div>
              <p className="text-xs font-semibold text-foreground">Ya estas suscrito!</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                CONDOR AI te enviara alertas electorales
              </p>
            </div>
          ) : (
            <>
              <ul className="space-y-1.5 mb-4">
                {[
                  "Encuestas al instante — antes que los medios",
                  "Fake news detectadas por IA",
                  "Alertas de tu candidato favorito",
                  "Resumen semanal que nadie mas te da",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="space-y-2">
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
                    className="w-full rounded-lg border border-border bg-background pl-11 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-emerald font-mono tabular-nums"
                    maxLength={12}
                    disabled={isSubmitting}
                    onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                  />
                </div>

                {error && <p className="text-[10px] text-rose">{error}</p>}

                <Button
                  onClick={handleSubscribe}
                  disabled={!phone.trim() || isSubmitting}
                  className="w-full gap-2 bg-emerald hover:bg-emerald/90 text-white"
                  size="sm"
                >
                  {isSubmitting ? (
                    <Activity className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageCircle className="h-4 w-4" />
                  )}
                  {isSubmitting ? "Suscribiendo..." : "Quiero recibir alertas"}
                </Button>
              </div>

              <p className="text-[10px] text-muted-foreground/60 text-center mt-2">
                Gratis • Sin spam • Te desuscribes cuando quieras
              </p>
            </>
          )}
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
