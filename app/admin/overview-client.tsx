"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useChartTheme } from "@/lib/echarts-theme";
import { KPICard } from "@/components/dashboard/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Eye,
  MousePointerClick,
  TrendingUp,
  TrendingDown,
  Minus,
  Smartphone,
  Monitor,
  Link2,
  Newspaper,
  ShieldCheck,
  Clock,
  BarChart3,
  UserSearch,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Zap,
} from "lucide-react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface AdminData {
  subscribers: number;
  viewsToday: number;
  visitorsToday: number;
  views7d: number;
  uniqueVisitors7d: number;
  uniqueSessions: number;
  mobileCount: number;
  desktopCount: number;
  events7d: number;
  dailyViews: { date: string; views: number }[];
  topPages: { page: string; count: number }[];
  referrers: { referrer: string; count: number }[];
  topEvents: { event: string; target: string; count: number }[];
  recentEvents: {
    id: string;
    event: string;
    page: string;
    target: string;
    metadata: Record<string, unknown> | null;
    created_at: string;
  }[];
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
  entryPages: { page: string; count: number }[];
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

/* ── Event translations for humans ── */
const EVENT_LABELS: Record<string, string> = {
  click: "Click",
  page_view: "Vista",
  scroll: "Scroll",
  share: "Compartir",
  quiz_start: "Quiz iniciado",
  quiz_complete: "Quiz completado",
  whatsapp_subscribe: "Suscripcion WA",
};

const TARGET_LABELS: Record<string, string> = {
  home_switch_dashboard: "Cambio a Dashboard",
  home_full_dashboard: "Ver dashboard completo",
  dashboard_mode_toggle: "Toggle modo dashboard",
  resumen_candidate_card: "Card de candidato",
  resumen_quiz_cta: "CTA del Quiz",
  whatsapp_cta: "CTA WhatsApp",
  whatsapp_fab: "Boton flotante WA",
  candidate_profile: "Perfil candidato",
  quiz_result_share: "Compartir resultado quiz",
  news_article: "Noticia",
  fact_check: "Verificacion",
  comparar_candidatos: "Comparar candidatos",
  comparar_planes: "Comparar planes",
  simulador: "Simulador",
  ai_chat: "Chat IA",
};

function humanEvent(event: string): string {
  return EVENT_LABELS[event] || event.replace(/_/g, " ");
}

function humanTarget(target: string): string {
  return TARGET_LABELS[target] || target.replace(/_/g, " ");
}

function humanPage(page: string): string {
  if (page === "/") return "Home";
  if (page === "/candidatos") return "Candidatos";
  if (page === "/encuestas") return "Encuestas";
  if (page === "/quiz") return "Quiz";
  if (page === "/noticias") return "Noticias";
  if (page === "/verificador") return "Verificador";
  if (page === "/planes") return "Planes";
  if (page === "/mapa") return "Mapa";
  if (page === "/simulador") return "Simulador";
  if (page === "/radiografia") return "Radiografia";
  if (page === "/pilares") return "Pilares";
  if (page?.startsWith("/candidatos/")) {
    const slug = page.replace("/candidatos/", "");
    return slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }
  return page;
}

/* ── Generate insights from data ── */
function generateInsights(data: AdminData): string[] {
  const insights: string[] = [];
  const mobilePct = data.views7d > 0 ? Math.round((data.mobileCount / data.views7d) * 100) : 0;
  const desktopPct = 100 - mobilePct;

  // Mobile insight
  if (mobilePct >= 80) {
    insights.push(`${mobilePct}% de tu trafico es mobile. Tu audiencia te visita desde el celular.`);
  } else if (mobilePct >= 60) {
    insights.push(`${mobilePct}% mobile vs ${desktopPct}% desktop. Mayoria en celular pero hay audiencia desktop.`);
  } else {
    insights.push(`Solo ${mobilePct}% mobile. Inusual — la mayoria de sitios electorales son 80%+ mobile.`);
  }

  // Top candidate insight
  if (data.candidateTraffic.length > 0) {
    const top = data.candidateTraffic[0];
    const candidate = data.candidates.find(c => c.slug === top.slug);
    if (candidate) {
      insights.push(`${candidate.name} es el candidato mas buscado con ${top.views} visitas esta semana.`);
    }
  }

  // Engagement insight
  if (data.avgPagesPerSession >= 3) {
    insights.push(`Los usuarios ven ${data.avgPagesPerSession} paginas por sesion. Buen engagement.`);
  } else if (data.avgPagesPerSession >= 2) {
    insights.push(`${data.avgPagesPerSession} paginas/sesion. Aceptable, pero se puede mejorar.`);
  } else {
    insights.push(`Solo ${data.avgPagesPerSession} pagina/sesion. Los usuarios no exploran mas alla de la primera pagina.`);
  }

  // Bounce rate insight
  if (data.bounceRate > 70) {
    insights.push(`Bounce rate del ${data.bounceRate}%. La mayoria se va sin interactuar.`);
  } else if (data.bounceRate > 50) {
    insights.push(`Bounce rate ${data.bounceRate}% — dentro de lo normal.`);
  } else {
    insights.push(`Bounce rate ${data.bounceRate}%. Excelente retencion.`);
  }

  // Top referrer
  if (data.referrers.length > 0) {
    const topRef = data.referrers[0];
    insights.push(`Tu principal fuente de trafico es ${topRef.referrer} con ${topRef.count} visitas.`);
  } else {
    insights.push("Todo tu trafico es directo o desde WhatsApp. No hay referrers externos.");
  }

  // Events insight
  if (data.events7d > 0 && data.views7d > 0) {
    const eventsPerVisit = (data.events7d / data.views7d).toFixed(1);
    insights.push(`${eventsPerVisit} interacciones por visita. ${Number(eventsPerVisit) >= 1 ? "Los usuarios estan activos." : "Pocas interacciones."}`);
  }

  // Growth insight
  if (data.dailyViews.length >= 7) {
    const lastWeek = data.dailyViews.slice(-7).reduce((sum, d) => sum + d.views, 0);
    const prevWeek = data.dailyViews.slice(-14, -7).reduce((sum, d) => sum + d.views, 0);
    if (prevWeek > 0) {
      const growthPct = Math.round(((lastWeek - prevWeek) / prevWeek) * 100);
      if (growthPct > 0) {
        insights.push(`Trafico crecio ${growthPct}% vs semana anterior.`);
      } else if (growthPct < -10) {
        insights.push(`Trafico bajo ${Math.abs(growthPct)}% vs semana anterior.`);
      } else {
        insights.push("Trafico estable vs semana anterior.");
      }
    }
  }

  return insights.slice(0, 6);
}

export function AdminOverviewClient({ data }: { data: AdminData }) {
  const ct = useChartTheme();
  const mobilePct =
    data.views7d > 0
      ? Math.round((data.mobileCount / data.views7d) * 100)
      : 0;
  const desktopPct = 100 - mobilePct;
  const insights = generateInsights(data);

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
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Resumen general — datos sin bots
        </p>
      </motion.div>

      {/* ── INSIGHTS ── */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Insights rapidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {insights.map((insight, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-lg border border-primary/10 bg-background/50 px-3 py-2"
                  >
                    <Zap className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-foreground leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

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
          subtitle={`${data.visitorsToday} visitantes`}
          icon={Eye}
          color="indigo"
          delay={0.05}
        />
        <KPICard
          title="Visitas 7d"
          value={data.views7d}
          subtitle={`${data.uniqueVisitors7d} visitantes · ${data.uniqueSessions} sesiones`}
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
                  className="h-full bg-indigo rounded-l-full transition-all"
                  style={{ width: `${mobilePct}%` }}
                />
                <div
                  className="h-full bg-emerald rounded-r-full transition-all"
                  style={{ width: `${desktopPct}%` }}
                />
              </div>
              {/* Labels */}
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] text-muted-foreground">
                  {data.mobileCount} mobile
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {data.desktopCount} desktop
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <KPICard
          title="Eventos 7d"
          value={data.events7d}
          subtitle="Clicks e interacciones"
          icon={MousePointerClick}
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
                  <p className="text-[10px] text-muted-foreground">articulos activos</p>
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
                    <span className="text-[10px] text-muted-foreground">Ultimo scrape</span>
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
                    <span className="text-[10px] text-muted-foreground">Ultima verificacion</span>
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
                      { label: "Enganoso", count: data.verdictBreakdown.enganoso, color: "bg-amber" },
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
                  <p className="text-[10px] font-mono uppercase text-muted-foreground">Paginas/sesion</p>
                  <p className="text-xl font-bold font-mono tabular-nums text-foreground">{data.avgPagesPerSession}</p>
                  <p className="text-[10px] text-muted-foreground">promedio</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-[10px] font-mono uppercase text-muted-foreground">Bounce rate</p>
                  <p className="text-xl font-bold font-mono tabular-nums text-foreground">{data.bounceRate}%</p>
                  <p className="text-[10px] text-muted-foreground">1 sola pagina</p>
                </div>
              </div>
              {/* Entry pages */}
              {data.entryPages.length > 0 && (
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                    Paginas de entrada
                  </p>
                  <div className="space-y-1">
                    {data.entryPages.slice(0, 5).map((ep) => (
                      <div key={ep.page} className="flex items-center justify-between">
                        <span className="text-[10px] text-foreground font-mono truncate max-w-[160px]">
                          {ep.page}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground ml-2">
                          {ep.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                Trafico a candidatos (7d)
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
                      Compara trafico web vs encuestas — si un candidato tiene mucho trafico pero baja encuesta, hay interes organico
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
                Visitas por dia (30d)
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
                Top paginas (7d)
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
                  Sin datos aun
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Row: Referrers (device chart removed, info now in KPI bar) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.43 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Link2 className="h-3.5 w-3.5" />
              Referrers (7d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.referrers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Sin referrers (trafico directo)
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                {data.referrers.map((r) => (
                  <div
                    key={r.referrer}
                    className="flex items-center justify-between"
                  >
                    <span className="text-xs text-foreground truncate font-mono">
                      {r.referrer}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground ml-2">
                      {r.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── EVENTOS RECIENTES (human-readable) ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MousePointerClick className="h-3.5 w-3.5" />
              Actividad reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay eventos registrados aun
              </p>
            ) : (
              <div className="space-y-2">
                {data.recentEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center gap-3 rounded-lg border border-border/50 px-3 py-2 hover:bg-muted/30 transition-colors"
                  >
                    {/* Event icon */}
                    <div className="flex-shrink-0">
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-2 py-0.5"
                      >
                        {humanEvent(ev.event)}
                      </Badge>
                    </div>
                    {/* Description */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground truncate">
                        <span className="font-medium">{humanTarget(ev.target)}</span>
                        <span className="text-muted-foreground"> en </span>
                        <span className="text-muted-foreground font-mono">{humanPage(ev.page)}</span>
                      </p>
                    </div>
                    {/* Time */}
                    <span className="text-[10px] text-muted-foreground font-mono flex-shrink-0">
                      {new Date(ev.created_at).toLocaleString("es-PE", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Top events summary */}
            {data.topEvents.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                  Acciones mas populares (7d)
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.topEvents.slice(0, 8).map((e) => (
                    <div
                      key={`${e.event}:${e.target}`}
                      className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1"
                    >
                      <span className="text-[10px] text-foreground">
                        {humanTarget(e.target)}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[9px] px-1 py-0"
                      >
                        {e.count}x
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

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
          <span>Verificacion: 9am PET</span>
        </div>
        <span>·</span>
        <span>Bots filtrados · Hora Peru</span>
      </motion.div>
    </div>
  );
}
