"use client";

import { KPICard } from "@/components/dashboard/kpi-card";
import { CandidateRanking } from "@/components/dashboard/candidate-ranking";
import { PollTrendChart } from "@/components/charts/poll-trend-chart";
import { NewsTicker } from "@/components/dashboard/news-ticker";
import { TrendingTopics } from "@/components/dashboard/trending-topics";
import { Users, Calendar, Vote, BarChart3, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

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
    <div className="space-y-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-foreground">
          Dashboard Electoral
        </h1>
        <p className="text-sm text-muted-foreground">
          Inteligencia electoral en tiempo real — Elecciones Peru 2026
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: Poll chart + Ranking */}
        <div className="space-y-6 lg:col-span-2">
          <PollTrendChart />
          <CandidateRanking />
        </div>

        {/* Right column: News + Trending */}
        <div className="space-y-6">
          <NewsTicker />
          <TrendingTopics />
        </div>
      </div>

      {/* Quick actions bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
          href="/planes"
          title="Planes de gobierno"
          description="Resumen con IA"
          gradient="from-amber/20 to-orange-500/20"
        />
      </div>
    </div>
  );
}

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
        className={`group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br ${gradient} p-4 transition-all duration-300 hover:border-primary/30`}
      >
        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {title}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </motion.div>
    </Link>
  );
}
