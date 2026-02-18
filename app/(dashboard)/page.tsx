"use client";

import { useState, useCallback } from "react";
import { KPICard } from "@/components/dashboard/kpi-card";
import { CandidateRanking } from "@/components/dashboard/candidate-ranking";
import { PollTrendChart } from "@/components/charts/poll-trend-chart";
import { NewsTicker } from "@/components/dashboard/news-ticker";
import {
  Users,
  Calendar,
  Vote,
  AlertTriangle,
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
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { candidates, getTopCandidates } from "@/lib/data/candidates";
import { radiografiaData, formatSoles, type CandidateRadiografia } from "@/lib/data/radiografia";
import { runSimulation, DEFAULT_CONFIG, type SimulationResult } from "@/lib/data/simulador";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const electionDate = new Date("2026-04-12T08:00:00-05:00");
  const now = new Date();
  const daysToElection = Math.max(
    0,
    Math.floor(
      (electionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          Dashboard Electoral
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Inteligencia electoral en tiempo real — Elecciones Peru 2026
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KPICard
          title="Dias para la eleccion"
          value={daysToElection}
          subtitle="12 de abril, 2026"
          icon={Calendar}
          color="indigo"
          delay={0}
        />
        <KPICard
          title="Candidatos"
          value={36}
          subtitle="presidenciales habilitados"
          icon={Users}
          trend={{ value: 2, label: "vs mes anterior" }}
          color="sky"
          delay={0.1}
        />
        <KPICard
          title="Padron electoral"
          value="25.3M"
          subtitle="electores habilitados"
          icon={Vote}
          trend={{ value: 3.2, label: "nuevos inscritos" }}
          color="emerald"
          delay={0.2}
        />
        <KPICard
          title="Fake news detectadas"
          value={287}
          subtitle="por el JNE y aliados"
          icon={AlertTriangle}
          trend={{ value: 12, label: "esta semana" }}
          color="rose"
          delay={0.3}
        />
      </div>

      {/* === FEATURE HIGHLIGHTS === */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <SimuladorHighlight />
        <RadiografiaHighlight />
        <PlanesHighlight />
      </div>

      {/* Main content grid */}
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

      {/* Quick actions bar */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
        <QuickAction
          href="/quiz"
          title="Descubre tu candidato"
          description="Quiz de compatibilidad"
          gradient="from-indigo/20 to-purple-500/20"
        />
        <QuickAction
          href="/candidatos/comparar"
          title="Comparar candidatos"
          description="Lado a lado"
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
          gradient="from-amber/20 to-orange-500/20"
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
                    {/* Risk gauge */}
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

          {/* Top proposals by category */}
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
  const whatsappNumber = "51999999999"; // Peru country code + number
  const message = encodeURIComponent(
    "Hola! Quiero recibir actualizaciones sobre las elecciones Peru 2026 de REPUBLICA."
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="bg-card border-border overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-green-500 via-green-500/50 to-transparent" />
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
              <MessageCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Recibe alertas por WhatsApp
              </h3>
              <p className="text-[10px] text-muted-foreground">
                Un agente te mantiene informado
              </p>
            </div>
          </div>

          <ul className="space-y-1.5 mb-4">
            {[
              "Alertas de encuestas nuevas",
              "Verificacion de fake news",
              "Recordatorios electorales",
              "Resumen semanal personalizado",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1 w-1 rounded-full bg-green-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <MessageCircle className="h-4 w-4" />
              Conectar con WhatsApp
            </Button>
          </a>

          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Gratis — Sin spam — Cancela cuando quieras
          </p>
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
