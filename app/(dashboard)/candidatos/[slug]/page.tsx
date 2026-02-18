"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  User,
  MapPin,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  ExternalLink,
  Twitter,
  Facebook,
  Instagram,
  Share2,
  Scale,
  Scan,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  getCandidateBySlug,
  IDEOLOGY_LABELS,
  CATEGORIES_LABELS,
} from "@/lib/data/candidates";
import Link from "next/link";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function CandidateProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const candidate = getCandidateBySlug(slug);

  if (!candidate) {
    notFound();
  }

  const trendConfig = {
    up: { icon: TrendingUp, label: "Subiendo", color: "text-emerald" },
    down: { icon: TrendingDown, label: "Bajando", color: "text-rose" },
    stable: { icon: Minus, label: "Estable", color: "text-muted-foreground" },
  };

  const trend = trendConfig[candidate.pollTrend];
  const TrendIcon = trend.icon;

  const chartOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis" as const,
      backgroundColor: "#14131e",
      borderColor: "#1e1c2e",
      textStyle: { color: "#f1f5f9", fontSize: 12 },
    },
    grid: { top: 20, right: 20, bottom: 30, left: 50 },
    xAxis: {
      type: "category" as const,
      data: candidate.pollHistory.map((p) => p.date),
      axisLine: { lineStyle: { color: "#1e1c2e" } },
      axisLabel: { color: "#94a3b8", fontSize: 11 },
    },
    yAxis: {
      type: "value" as const,
      axisLabel: { color: "#94a3b8", fontSize: 11, formatter: "{value}%" },
      splitLine: { lineStyle: { color: "#1e1c2e", type: "dashed" as const } },
    },
    series: [
      {
        type: "line" as const,
        smooth: true,
        symbol: "circle",
        symbolSize: 8,
        lineStyle: { width: 3, color: candidate.partyColor },
        itemStyle: { color: candidate.partyColor },
        areaStyle: {
          color: {
            type: "linear" as const,
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: candidate.partyColor + "40" },
              { offset: 1, color: candidate.partyColor + "05" },
            ],
          },
        },
        data: candidate.pollHistory.map((p) => p.value),
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/candidatos">
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          Volver a candidatos
        </Button>
      </Link>

      {/* Hero section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card"
      >
        {/* Party color band */}
        <div
          className="h-2 w-full"
          style={{ backgroundColor: candidate.partyColor }}
        />

        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div
              className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl border-2"
              style={{
                backgroundColor: candidate.partyColor + "15",
                borderColor: candidate.partyColor + "40",
              }}
            >
              <User
                className="h-12 w-12"
                style={{ color: candidate.partyColor }}
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                    {candidate.name}
                  </h1>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: candidate.partyColor }}
                      />
                      <span className="text-sm font-medium text-muted-foreground">
                        {candidate.party}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {IDEOLOGY_LABELS[candidate.ideology].es}
                    </Badge>
                  </div>
                </div>

                {/* Poll position */}
                <div className="text-right">
                  <p className="font-mono text-3xl font-bold tabular-nums text-foreground">
                    {candidate.pollAverage.toFixed(1)}%
                  </p>
                  <div className={`flex items-center gap-1 justify-end ${trend.color}`}>
                    <TrendIcon className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">{trend.label}</span>
                  </div>
                </div>
              </div>

              {/* Meta info */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4" />
                  {candidate.profession}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {candidate.region}
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {candidate.age} anos
                </div>
              </div>

              {/* Legal warning */}
              {candidate.hasLegalIssues && (
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber/20 bg-amber/5 px-3 py-2">
                  <AlertTriangle className="h-4 w-4 text-amber flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber">{candidate.legalNote}</p>
                </div>
              )}

              {/* Bio */}
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                {candidate.bio}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="proposals" className="w-full">
        <TabsList className="w-full justify-start bg-card border border-border">
          <TabsTrigger value="proposals">Propuestas</TabsTrigger>
          <TabsTrigger value="polls">Encuestas</TabsTrigger>
          <TabsTrigger value="positions">Posiciones</TabsTrigger>
        </TabsList>

        <TabsContent value="proposals" className="mt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {candidate.keyProposals.map((proposal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card border-border h-full">
                  <CardHeader className="pb-2">
                    <Badge variant="secondary" className="w-fit text-[10px]">
                      {CATEGORIES_LABELS[proposal.category].es}
                    </Badge>
                    <CardTitle className="text-sm">{proposal.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {proposal.summary}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="polls" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm">
                Historial de Encuestas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ReactECharts
                option={chartOption}
                style={{ height: 300 }}
                opts={{ renderer: "canvas" }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Posiciones Politicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(candidate.quizPositions).map(
                ([topic, position]) => (
                  <div key={topic} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground capitalize">
                        {topic.replace(/-/g, " ")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {position > 0
                          ? "A favor"
                          : position < 0
                            ? "En contra"
                            : "Neutral"}
                      </span>
                    </div>
                    <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="absolute top-0 h-full rounded-full transition-all duration-500"
                        style={{
                          backgroundColor:
                            position > 0
                              ? "#10b981"
                              : position < 0
                                ? "#ef4444"
                                : "#94a3b8",
                          width: `${((position + 2) / 4) * 100}%`,
                        }}
                      />
                      {/* Center marker */}
                      <div className="absolute left-1/2 top-0 h-full w-0.5 bg-border" />
                    </div>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Radiografia CTA */}
      <Link href={`/radiografia/${candidate.id}`}>
        <Card className="bg-card border-primary/20 hover:border-primary/40 transition-all cursor-pointer group overflow-hidden">
          <div className="h-0.5 w-full bg-gradient-to-r from-primary via-primary/50 to-transparent" />
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Scan className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Radiografia Completa</p>
                <p className="text-xs text-muted-foreground">
                  Patrimonio, historial legal, red de contactos y financiamiento
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Social media */}
      <Card className="bg-card border-border">
        <CardContent className="flex items-center gap-3 p-4">
          <span className="text-xs text-muted-foreground">Redes sociales:</span>
          {candidate.socialMedia.twitter && (
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <a
                href={`https://twitter.com/${candidate.socialMedia.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </Button>
          )}
          {candidate.socialMedia.facebook && (
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <a
                href={`https://facebook.com/${candidate.socialMedia.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </Button>
          )}
          {candidate.socialMedia.instagram && (
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <a
                href={`https://instagram.com/${candidate.socialMedia.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-3.5 w-3.5" />
            Compartir
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
