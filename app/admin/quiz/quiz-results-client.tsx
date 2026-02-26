"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useChartTheme } from "@/lib/echarts-theme";
import { KPICard } from "@/components/dashboard/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  Trophy,
  TrendingUp,
  Users,
  BarChart3,
  Clock,
  Target,
} from "lucide-react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface QuizData {
  country: string;
  countryName: string;
  countryEmoji: string;
  total: number;
  today: number;
  week7d: number;
  dailyData: { date: string; count: number }[];
  topWinners: {
    name: string;
    count: number;
    pct: number;
    partyColor: string;
    party: string;
  }[];
  avgCompatibility: number;
  answerDistribution: {
    questionId: string;
    label: string;
    distribution: Record<number, number>;
    total: number;
  }[];
  recentResults: {
    id: string;
    topCandidate: string;
    compatibility: number;
    createdAt: string;
    answersCount: number;
  }[];
}

const ANSWER_LABELS: Record<number, string> = {
  [-2]: "Muy en contra",
  [-1]: "En contra",
  [0]: "Neutral",
  [1]: "A favor",
  [2]: "Muy a favor",
};

const ANSWER_COLORS: Record<number, string> = {
  [-2]: "#ef4444",
  [-1]: "#f97316",
  [0]: "#6b7280",
  [1]: "#22c55e",
  [2]: "#10b981",
};

export function QuizResultsClient({ data }: { data: QuizData }) {
  const ct = useChartTheme();

  /* ── Daily completions chart ── */
  const dailyChartOption = {
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
      data: data.dailyData.map((d) => {
        const date = new Date(d.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }),
      axisLine: { lineStyle: { color: ct.axis.lineColor } },
      axisLabel: { color: ct.axis.labelColor, fontSize: 10, interval: 4 },
    },
    yAxis: {
      type: "value" as const,
      axisLabel: { color: ct.axis.labelColor, fontSize: 10 },
      splitLine: {
        lineStyle: { color: ct.axis.splitLineColor, type: "dashed" as const },
      },
      minInterval: 1,
    },
    series: [
      {
        type: "bar" as const,
        data: data.dailyData.map((d) => d.count),
        itemStyle: {
          color: {
            type: "linear" as const,
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#8b5cf6" },
              { offset: 1, color: "#8b5cf680" },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  };

  /* ── Top winners pie chart ── */
  const winnersChartOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item" as const,
      backgroundColor: ct.tooltip.backgroundColor,
      borderColor: ct.tooltip.borderColor,
      textStyle: { color: ct.tooltip.textColor, fontSize: 12 },
      formatter: (params: { name: string; value: number; percent: number }) =>
        `${params.name}: ${params.value} (${params.percent}%)`,
    },
    series: [
      {
        type: "pie" as const,
        radius: ["40%", "70%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: ct.isDark ? "#0c0b14" : "#ffffff",
          borderWidth: 2,
        },
        label: { show: false },
        data: data.topWinners.slice(0, 8).map((w) => ({
          value: w.count,
          name: w.name,
          itemStyle: { color: w.partyColor },
        })),
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <span>{data.countryEmoji}</span>
          Quiz Electoral — {data.countryName}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Resultados y analítica del quiz de compatibilidad
        </p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total completados"
          value={data.total}
          subtitle="quiz finalizados"
          icon={ClipboardList}
          color="indigo"
          delay={0}
        />
        <KPICard
          title="Hoy"
          value={data.today}
          subtitle="completados hoy"
          icon={TrendingUp}
          color="emerald"
          delay={0.05}
        />
        <KPICard
          title="Últimos 7 días"
          value={data.week7d}
          subtitle="completados (7d)"
          icon={Users}
          color="sky"
          delay={0.1}
        />
        <KPICard
          title="Compatibilidad promedio"
          value={`${data.avgCompatibility}%`}
          subtitle="del candidato #1"
          icon={Target}
          color="amber"
          delay={0.15}
        />
      </div>

      {/* Row: Daily chart + Top winners */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Daily completions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="h-3.5 w-3.5" />
                Quiz completados por día (30d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.total > 0 ? (
                <ReactECharts
                  option={dailyChartOption}
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

        {/* Top winners donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Trophy className="h-3.5 w-3.5" />
                Candidato más compatible (#1)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.topWinners.length > 0 ? (
                <>
                  <ReactECharts
                    option={winnersChartOption}
                    style={{ height: 180 }}
                    opts={{ renderer: "svg" }}
                  />
                  <div className="space-y-1.5 mt-2">
                    {data.topWinners.slice(0, 6).map((w, i) => (
                      <div key={w.name} className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground w-4 text-right">
                          {i + 1}
                        </span>
                        <div
                          className="h-2 w-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: w.partyColor }}
                        />
                        <span className="text-xs text-foreground truncate flex-1">
                          {w.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">
                          {w.party}
                        </span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-xs font-mono font-bold tabular-nums">
                            {w.count}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-[9px] px-1 py-0"
                          >
                            {w.pct}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">
                  Sin datos aún
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Answer distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-3.5 w-3.5" />
              Distribución de respuestas por pregunta
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.answerDistribution.length > 0 &&
            data.answerDistribution[0].total > 0 ? (
              <div className="space-y-3">
                {data.answerDistribution.map((q) => (
                  <div key={q.questionId}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-foreground">
                        {q.label}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {q.total} respuestas
                      </span>
                    </div>
                    {/* Stacked bar */}
                    <div className="flex h-5 w-full overflow-hidden rounded-md">
                      {([-2, -1, 0, 1, 2] as number[]).map((val) => {
                        const count = q.distribution[val] || 0;
                        const pct =
                          q.total > 0 ? (count / q.total) * 100 : 0;
                        if (pct === 0) return null;
                        return (
                          <div
                            key={val}
                            className="flex items-center justify-center transition-all"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: ANSWER_COLORS[val],
                              minWidth: pct > 0 ? "2px" : 0,
                            }}
                            title={`${ANSWER_LABELS[val]}: ${count} (${Math.round(pct)}%)`}
                          >
                            {pct >= 10 && (
                              <span className="text-[9px] font-mono font-bold text-white">
                                {Math.round(pct)}%
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {/* Legend */}
                <div className="flex flex-wrap gap-3 mt-2 pt-2 border-t border-border">
                  {([-2, -1, 0, 1, 2] as number[]).map((val) => (
                    <div key={val} className="flex items-center gap-1">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: ANSWER_COLORS[val] }}
                      />
                      <span className="text-[9px] text-muted-foreground">
                        {ANSWER_LABELS[val]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                Sin datos aún
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent results */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              Resultados recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentResults.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay resultados aún
              </p>
            ) : (
              <div className="space-y-2">
                {data.recentResults.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 rounded-lg border border-border/50 px-3 py-2 hover:bg-muted/30 transition-colors"
                  >
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-2 py-0.5 flex-shrink-0"
                    >
                      Quiz
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground truncate">
                        <span className="font-medium">{r.topCandidate}</span>
                        <span className="text-muted-foreground"> — </span>
                        <span
                          className={
                            r.compatibility >= 70
                              ? "text-emerald font-bold"
                              : r.compatibility >= 50
                                ? "text-amber font-bold"
                                : "text-muted-foreground"
                          }
                        >
                          {r.compatibility}% compatible
                        </span>
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono flex-shrink-0">
                      {new Date(r.createdAt).toLocaleString("es-PE", {
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
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
