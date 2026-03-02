"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useChartTheme } from "@/lib/echarts-theme";
import { KPICard } from "@/components/dashboard/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Eye,
  Globe,
  TrendingUp,
  TrendingDown,
  Minus,
  Smartphone,
  Monitor,
  Tablet,
  Link2,
  ExternalLink,
  MapPin,
  Megaphone,
  Newspaper,
  ShieldCheck,
  Clock,
  BarChart3,
  UserSearch,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface AdminData {
  country: string;
  countryName: string;
  countryEmoji: string;
  subscribers: number;
  viewsToday: number;
  sessionsToday: number;
  views7d: number;
  uniqueSessions: number;
  mobileCount: number;
  desktopCount: number;
  tabletCount: number;
  dailyViews: { date: string; views: number }[];
  topPages: { page: string; count: number }[];
  acquisition: Record<string, AcquisitionPeriod>;
  totalNews: number;
  totalFactChecks: number;
  verdictBreakdown: {
    verdadero: number;
    falso: number;
    enganoso: number;
    parcial: number;
    noVerificable: number;
  };
  lastScrape: string | null;
  lastVerify: string | null;
  candidates: {
    name: string;
    slug: string;
    pollAverage: number;
    pollTrend: string;
    party: string;
  }[];
  candidateTraffic: { slug: string; views: number }[];
  avgPagesPerSession: number;
  bounceRate: number;
}

type AcquisitionPeriod = {
  trafficChannels: { channel: string; count: number; pct: number }[];
  topCountries: { country: string; count: number }[];
  topCities: { city: string; count: number }[];
  referrers: { referrer: string; count: number }[];
  utmCampaigns: { campaign: string; source: string; count: number }[];
  entryPages: { page: string; count: number }[];
  totalViews: number;
};

/* ── Country code → flag emoji ── */
const FLAG_MAP: Record<string, string> = {
  PE: "\u{1F1F5}\u{1F1EA}",
  CO: "\u{1F1E8}\u{1F1F4}",
  US: "\u{1F1FA}\u{1F1F8}",
  MX: "\u{1F1F2}\u{1F1FD}",
  ES: "\u{1F1EA}\u{1F1F8}",
  AR: "\u{1F1E6}\u{1F1F7}",
  CL: "\u{1F1E8}\u{1F1F1}",
  BR: "\u{1F1E7}\u{1F1F7}",
  EC: "\u{1F1EA}\u{1F1E8}",
  VE: "\u{1F1FB}\u{1F1EA}",
  BO: "\u{1F1E7}\u{1F1F4}",
  DE: "\u{1F1E9}\u{1F1EA}",
  FR: "\u{1F1EB}\u{1F1F7}",
  GB: "\u{1F1EC}\u{1F1E7}",
};

/* ── Referrer formatting ── */
function formatReferrer(ref: string): string {
  if (ref === "Directo") return "Directo";
  if (ref.includes("google")) return "Google";
  if (ref.includes("bing")) return "Bing";
  if (ref.includes("t.co") || ref.includes("twitter") || ref.includes("x.com")) return "X / Twitter";
  if (ref.includes("facebook") || ref.includes("fb.com")) return "Facebook";
  if (ref.includes("linkedin") || ref.includes("lnkd.in")) return "LinkedIn";
  if (ref.includes("instagram")) return "Instagram";
  if (ref.includes("tiktok")) return "TikTok";
  if (ref.includes("reddit")) return "Reddit";
  if (ref.includes("whatsapp") || ref.includes("wa.me")) return "WhatsApp";
  if (ref.includes("telegram") || ref.includes("t.me")) return "Telegram";
  return ref;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "nunca";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === "up") return <TrendingUp className="h-3 w-3 text-emerald" />;
  if (trend === "down") return <TrendingDown className="h-3 w-3 text-rose" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
};

const PERIODS = ["7d", "15d", "30d"] as const;
type Period = (typeof PERIODS)[number];

export function AdminOverviewClient({ data }: { data: AdminData }) {
  const ct = useChartTheme();
  const [acqPeriod, setAcqPeriod] = useState<Period>("7d");
  const totalDevices = data.mobileCount + data.desktopCount + data.tabletCount;
  const mobilePct = totalDevices > 0 ? Math.round((data.mobileCount / totalDevices) * 100) : 0;
  const desktopPct = totalDevices > 0 ? Math.round((data.desktopCount / totalDevices) * 100) : 0;
  const tabletPct = 100 - mobilePct - desktopPct;

  /* ── Charts ── */
  const viewsChartOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis" as const,
      backgroundColor: ct.tooltip.backgroundColor,
      borderColor: ct.tooltip.borderColor,
      textStyle: { color: ct.tooltip.textColor, fontSize: 12 },
    },
    grid: { top: 20, right: 20, bottom: 30, left: 50 },
    xAxis: {
      type: "category" as const,
      data: data.dailyViews.map((d) => {
        const date = new Date(d.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }),
      axisLine: { lineStyle: { color: ct.axis.lineColor } },
      axisLabel: { color: ct.axis.labelColor, fontSize: 10, interval: 4 },
    },
    yAxis: {
      type: "value" as const,
      axisLabel: { color: ct.axis.labelColor, fontSize: 10 },
      splitLine: { lineStyle: { color: ct.axis.splitLineColor, type: "dashed" as const } },
    },
    series: [
      {
        type: "bar" as const,
        data: data.dailyViews.map((d) => d.views),
        itemStyle: {
          color: {
            type: "linear" as const,
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#6366f1" },
              { offset: 1, color: "#6366f180" },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  };

  const topPagesChartOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis" as const,
      backgroundColor: ct.tooltip.backgroundColor,
      borderColor: ct.tooltip.borderColor,
      textStyle: { color: ct.tooltip.textColor, fontSize: 12 },
    },
    grid: { top: 10, right: 20, bottom: 5, left: 120 },
    xAxis: {
      type: "value" as const,
      axisLabel: { color: ct.axis.labelColor, fontSize: 10 },
      splitLine: { lineStyle: { color: ct.axis.splitLineColor, type: "dashed" as const } },
    },
    yAxis: {
      type: "category" as const,
      data: [...data.topPages]
        .slice(0, 10)
        .reverse()
        .map((p) => (p.page.length > 18 ? p.page.slice(0, 18) + "..." : p.page)),
      axisLabel: { color: ct.axis.labelColor, fontSize: 10 },
      axisLine: { lineStyle: { color: ct.axis.lineColor } },
    },
    series: [
      {
        type: "bar" as const,
        data: [...data.topPages].slice(0, 10).reverse().map((p) => p.count),
        itemStyle: {
          color: "#10b981",
          borderRadius: [0, 4, 4, 0],
        },
      },
    ],
  };

  const verdictChartOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item" as const,
      backgroundColor: ct.tooltip.backgroundColor,
      borderColor: ct.tooltip.borderColor,
      textStyle: { color: ct.tooltip.textColor, fontSize: 12 },
    },
    series: [
      {
        type: "pie" as const,
        radius: ["45%", "70%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 4, borderColor: ct.isDark ? "#0c0b14" : "#ffffff", borderWidth: 2 },
        label: { show: false },
        data: [
          { value: data.verdictBreakdown.verdadero, name: "Verdadero", itemStyle: { color: "#10b981" } },
          { value: data.verdictBreakdown.falso, name: "Falso", itemStyle: { color: "#ef4444" } },
          { value: data.verdictBreakdown.enganoso, name: "Engañoso", itemStyle: { color: "#f59e0b" } },
          { value: data.verdictBreakdown.parcial, name: "Parcial", itemStyle: { color: "#0ea5e9" } },
          { value: data.verdictBreakdown.noVerificable, name: "No verificable", itemStyle: { color: "#6b7280" } },
        ].filter((d) => d.value > 0),
      },
    ],
  };

  // Determine scrape/verify health
  const scrapeAge = data.lastScrape ? (Date.now() - new Date(data.lastScrape).getTime()) / 3600000 : Infinity;
  const verifyAge = data.lastVerify ? (Date.now() - new Date(data.lastVerify).getTime()) / 3600000 : Infinity;
  const scrapeHealthy = scrapeAge < 36;
  const verifyHealthy = verifyAge < 12;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <span>{data.countryEmoji}</span>
          Dashboard — {data.countryName}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tráfico global del sitio — datos sin bots
        </p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Suscriptores"
          value={data.subscribers}
          subtitle="WhatsApp activos"
          icon={Users}
          color="emerald"
          delay={0}
        />
        <KPICard
          title="Visitas hoy"
          value={data.viewsToday}
          subtitle={`${data.sessionsToday} sesiones`}
          icon={Eye}
          color="indigo"
          delay={0.05}
        />
        <KPICard
          title="Visitas 7d"
          value={data.views7d}
          subtitle={`${data.uniqueSessions} sesiones`}
          icon={TrendingUp}
          color="sky"
          delay={0.1}
        />
        {/* ── MOBILE/DESKTOP KPI mejorado ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="h-full">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Dispositivos
                </span>
              </div>
              {/* Big numbers */}
              <div className="flex items-end justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4 text-indigo" />
                  <span className="text-2xl font-bold font-mono tabular-nums text-foreground">
                    {mobilePct}%
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Monitor className="h-4 w-4 text-emerald" />
                  <span className="text-lg font-bold font-mono tabular-nums text-muted-foreground">
                    {desktopPct}%
                  </span>
                </div>
              </div>
              {/* Visual bar */}
              <div className="w-full h-3 rounded-full overflow-hidden bg-muted flex">
                <div
                  className="h-full bg-indigo transition-all"
                  style={{ width: `${mobilePct}%` }}
                />
                {tabletPct > 0 && (
                  <div
                    className="h-full bg-amber transition-all"
                    style={{ width: `${tabletPct}%` }}
                  />
                )}
                <div
                  className="h-full bg-emerald transition-all"
                  style={{ width: `${desktopPct}%` }}
                />
              </div>
              {/* Labels */}
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Smartphone className="h-2.5 w-2.5" /> {data.mobileCount}
                </span>
                {data.tabletCount > 0 && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Tablet className="h-2.5 w-2.5" /> {data.tabletCount}
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Monitor className="h-2.5 w-2.5" /> {data.desktopCount}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top channel quick summary */}
        <KPICard
          title="Top canal"
          value={data.acquisition["7d"]?.trafficChannels[0]?.channel || "—"}
          subtitle={data.acquisition["7d"]?.trafficChannels[0] ? `${data.acquisition["7d"].trafficChannels[0].pct}% del tráfico` : "sin datos"}
          icon={ExternalLink}
          color="rose"
          delay={0.2}
        />
      </div>

      {/* ── Content Health + Engagement Row ── */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Content health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Newspaper className="h-3.5 w-3.5" />
                Salud del contenido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-[10px] font-mono uppercase text-muted-foreground">Noticias</p>
                  <p className="text-xl font-bold font-mono tabular-nums text-foreground">{data.totalNews}</p>
                  <p className="text-[10px] text-muted-foreground">artículos activos</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-[10px] font-mono uppercase text-muted-foreground">Verificaciones</p>
                  <p className="text-xl font-bold font-mono tabular-nums text-foreground">{data.totalFactChecks}</p>
                  <p className="text-[10px] text-muted-foreground">fact checks</p>
                </div>
              </div>
              {/* Automation status */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {scrapeHealthy ? (
                      <CheckCircle className="h-3 w-3 text-emerald" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 text-amber" />
                    )}
                    <span className="text-[10px] text-muted-foreground">Último scrape</span>
                  </div>
                  <span className="text-[10px] font-mono text-foreground">
                    {timeAgo(data.lastScrape)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {verifyHealthy ? (
                      <CheckCircle className="h-3 w-3 text-emerald" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 text-amber" />
                    )}
                    <span className="text-[10px] text-muted-foreground">Última verificación</span>
                  </div>
                  <span className="text-[10px] font-mono text-foreground">
                    {timeAgo(data.lastVerify)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Fact-check breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verificaciones por veredicto
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.totalFactChecks > 0 ? (
                <>
                  <ReactECharts
                    option={verdictChartOption}
                    style={{ height: 120 }}
                    opts={{ renderer: "svg" }}
                  />
                  <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1">
                    {[
                      { label: "Verdadero", count: data.verdictBreakdown.verdadero, color: "bg-emerald" },
                      { label: "Falso", count: data.verdictBreakdown.falso, color: "bg-rose" },
                      { label: "Engañoso", count: data.verdictBreakdown.enganoso, color: "bg-amber" },
                      { label: "Parcial", count: data.verdictBreakdown.parcial, color: "bg-sky" },
                    ].filter((v) => v.count > 0).map((v) => (
                      <div key={v.label} className="flex items-center gap-1">
                        <div className={`h-1.5 w-1.5 rounded-full ${v.color}`} />
                        <span className="text-[9px] text-muted-foreground">{v.label} ({v.count})</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Sin verificaciones</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Engagement metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="h-3.5 w-3.5" />
                Engagement (7d)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-[10px] font-mono uppercase text-muted-foreground">Páginas/sesión</p>
                  <p className="text-xl font-bold font-mono tabular-nums text-foreground">{data.avgPagesPerSession}</p>
                  <p className="text-[10px] text-muted-foreground">promedio</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-[10px] font-mono uppercase text-muted-foreground">Bounce rate</p>
                  <p className="text-xl font-bold font-mono tabular-nums text-foreground">{data.bounceRate}%</p>
                  <p className="text-[10px] text-muted-foreground">1 sola página</p>
                </div>
              </div>
              {/* Session quality indicator */}
              <div className="rounded-lg border border-border p-3">
                <p className="text-[10px] font-mono uppercase text-muted-foreground">Sesiones únicas</p>
                <p className="text-xl font-bold font-mono tabular-nums text-foreground">{data.uniqueSessions}</p>
                <p className="text-[10px] text-muted-foreground">últimos 7 días</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Candidate Intelligence Row ── */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Poll standings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <UserSearch className="h-3.5 w-3.5" />
                Encuestas actuales
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.candidates.length > 0 ? (
                <div className="space-y-1.5">
                  {data.candidates.slice(0, 10).map((c, i) => (
                    <div key={c.slug} className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground w-4 text-right">
                        {i + 1}
                      </span>
                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        <span className="text-xs text-foreground truncate">{c.name}</span>
                        <span className="text-[9px] text-muted-foreground/60 truncate hidden sm:inline">
                          {c.party}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <TrendIcon trend={c.pollTrend} />
                        <span className="text-xs font-mono font-bold tabular-nums text-foreground w-12 text-right">
                          {c.pollAverage.toFixed(1)}%
                        </span>
                      </div>
                      {/* Mini bar */}
                      <div className="w-16 h-1.5 rounded-full bg-border overflow-hidden hidden sm:block">
                        <div
                          className="h-full rounded-full bg-indigo"
                          style={{ width: `${Math.min(c.pollAverage * 5, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Sin datos de encuestas
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Candidate page traffic vs polls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.33 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ArrowRight className="h-3.5 w-3.5" />
                Tráfico a candidatos (7d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.candidateTraffic.length > 0 ? (
                <div className="space-y-1.5">
                  {data.candidateTraffic.map((ct) => {
                    const candidate = data.candidates.find((c) => c.slug === ct.slug);
                    return (
                      <div key={ct.slug} className="flex items-center gap-2">
                        <span className="text-xs text-foreground truncate flex-1 min-w-0">
                          {candidate?.name || ct.slug}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] font-mono tabular-nums text-muted-foreground">
                            {candidate ? `${candidate.pollAverage.toFixed(1)}%` : "—"}
                          </span>
                          <span className="text-[9px] text-muted-foreground/50">enc.</span>
                          <span className="text-xs font-mono font-bold tabular-nums text-indigo">
                            {ct.views}
                          </span>
                          <span className="text-[9px] text-muted-foreground/50">vis.</span>
                        </div>
                      </div>
                    );
                  })}
                  {data.candidateTraffic.length > 0 && (
                    <p className="text-[9px] text-muted-foreground/40 mt-2 italic">
                      Compara tráfico web vs encuestas — si un candidato tiene mucho tráfico pero baja encuesta, hay interés orgánico
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Sin visitas a candidatos esta semana
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Row: Daily views chart + Top pages chart */}
      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Visitas por día (30d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ReactECharts
                option={viewsChartOption}
                style={{ height: 260 }}
                opts={{ renderer: "svg" }}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Top páginas (7d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.topPages.length > 0 ? (
                <ReactECharts
                  option={topPagesChartOption}
                  style={{ height: 260 }}
                  opts={{ renderer: "svg" }}
                />
              ) : (
                <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">
                  Sin datos aún
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── ADQUISICIÓN — De dónde vienen los usuarios ── */}
      {(() => {
        const acq = data.acquisition[acqPeriod] || data.acquisition["7d"];
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
          >
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    De dónde vienen tus usuarios
                    {acq.totalViews > 0 && (
                      <span className="text-[10px] font-mono font-normal text-muted-foreground">
                        ({acq.totalViews} visitas)
                      </span>
                    )}
                  </CardTitle>
                  {/* Period tabs */}
                  <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
                    {PERIODS.map((p) => (
                      <button
                        key={p}
                        onClick={() => setAcqPeriod(p)}
                        className={`rounded-md px-2.5 py-1 text-[10px] font-mono font-medium transition-all ${
                          acqPeriod === p
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Column 1: Traffic channels */}
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
                      Canales de tráfico
                    </p>
                    {acq.trafficChannels.length > 0 ? (
                      <div className="space-y-2.5">
                        {acq.trafficChannels.map((ch) => {
                          const colors: Record<string, string> = {
                            Directo: "bg-slate-400",
                            "Búsqueda": "bg-emerald",
                            Social: "bg-indigo",
                            Referral: "bg-amber",
                            "Campañas": "bg-rose",
                          };
                          const icons: Record<string, string> = {
                            Directo: "→",
                            "Búsqueda": "🔍",
                            Social: "💬",
                            Referral: "🔗",
                            "Campañas": "📢",
                          };
                          return (
                            <div key={ch.channel}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-foreground flex items-center gap-1.5">
                                  <span className="text-sm">{icons[ch.channel] || "•"}</span>
                                  {ch.channel}
                                </span>
                                <span className="text-xs font-mono tabular-nums text-muted-foreground">
                                  {ch.count} <span className="text-[9px]">({ch.pct}%)</span>
                                </span>
                              </div>
                              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${colors[ch.channel] || "bg-primary/50"} transition-all`}
                                  style={{ width: `${Math.max(ch.pct, 3)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-4">Sin datos</p>
                    )}

                    {/* Referrer details below channels */}
                    {acq.referrers.filter(r => r.referrer !== "Directo").length > 0 && (
                      <div className="mt-4 pt-3 border-t border-border">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                          Fuentes específicas
                        </p>
                        <div className="space-y-1">
                          {acq.referrers.map((r) => (
                            <div key={r.referrer} className="flex items-center justify-between">
                              <span className="text-[11px] text-foreground truncate">
                                {formatReferrer(r.referrer)}
                              </span>
                              <span className="text-[11px] font-mono tabular-nums text-muted-foreground ml-2">
                                {r.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Column 2: Countries + Cities */}
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
                      Países
                    </p>
                    {acq.topCountries.length > 0 ? (
                      <div className="space-y-2">
                        {acq.topCountries.slice(0, 8).map((c, i) => {
                          const maxCount = acq.topCountries[0].count;
                          const pct = maxCount > 0 ? (c.count / maxCount) * 100 : 0;
                          return (
                            <div key={c.country}>
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-xs text-foreground flex items-center gap-1.5">
                                  <span className="text-sm">{FLAG_MAP[c.country] || "🌍"}</span>
                                  {c.country}
                                </span>
                                <span className="text-xs font-mono tabular-nums text-muted-foreground">
                                  {c.count}
                                </span>
                              </div>
                              {i < 5 && (
                                <div className="h-1 rounded-full bg-muted overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-sky/60 transition-all"
                                    style={{ width: `${Math.max(pct, 3)}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-border/50 px-3 py-4 text-center">
                        <p className="text-xs text-muted-foreground">Recopilando datos</p>
                        <p className="text-[9px] text-muted-foreground/60 mt-1">
                          Geolocalización se activará con más tráfico
                        </p>
                      </div>
                    )}

                    {/* Cities */}
                    {acq.topCities.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-border">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                          <MapPin className="h-2.5 w-2.5" /> Ciudades
                        </p>
                        <div className="space-y-1">
                          {acq.topCities.slice(0, 6).map((c) => (
                            <div key={c.city} className="flex items-center justify-between">
                              <span className="text-[11px] text-foreground truncate">{c.city}</span>
                              <span className="text-[11px] font-mono tabular-nums text-muted-foreground ml-2">
                                {c.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Column 3: UTM Campaigns + Entry pages */}
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1">
                      <Megaphone className="h-2.5 w-2.5" /> Campañas UTM
                    </p>
                    {acq.utmCampaigns.length > 0 ? (
                      <div className="space-y-2">
                        {acq.utmCampaigns.map((c) => (
                          <div key={c.campaign} className="rounded-lg border border-border/50 px-3 py-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-foreground truncate">
                                {c.campaign}
                              </span>
                              <span className="text-xs font-mono font-bold tabular-nums text-primary ml-2">
                                {c.count}
                              </span>
                            </div>
                            <span className="text-[9px] text-muted-foreground">
                              via {c.source}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-border/50 px-3 py-6 text-center">
                        <p className="text-xs text-muted-foreground">Sin campañas activas</p>
                        <p className="text-[9px] text-muted-foreground/60 mt-1">
                          Agrega ?utm_source=...&utm_campaign=... a tus links
                        </p>
                      </div>
                    )}

                    {/* Entry pages */}
                    {acq.entryPages.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-border">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                          Páginas de entrada
                        </p>
                        <div className="space-y-1">
                          {acq.entryPages.slice(0, 5).map((ep) => (
                            <div key={ep.page} className="flex items-center justify-between">
                              <span className="text-[11px] text-foreground font-mono truncate max-w-[160px]">
                                {ep.page}
                              </span>
                              <span className="text-[11px] font-mono tabular-nums text-muted-foreground ml-2">
                                {ep.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })()}

      {/* System status footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-3 text-[9px] text-muted-foreground/40 pb-4"
      >
        <div className="flex items-center gap-1">
          <Clock className="h-2.5 w-2.5" />
          <span>Scrape: 7am PET</span>
        </div>
        <span>·</span>
        <div className="flex items-center gap-1">
          <ShieldCheck className="h-2.5 w-2.5" />
          <span>Verificación: 9am PET</span>
        </div>
        <span>·</span>
        <span>Bots filtrados · Hora {data.countryName}</span>
      </motion.div>
    </div>
  );
}
