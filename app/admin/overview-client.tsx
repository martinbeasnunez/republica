"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { KPICard } from "@/components/dashboard/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Eye, MousePointerClick, TrendingUp } from "lucide-react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface AdminData {
  subscribers: number;
  viewsToday: number;
  views7d: number;
  events7d: number;
  dailyViews: { date: string; views: number }[];
  topPages: { page: string; count: number }[];
}

export function AdminOverviewClient({ data }: { data: AdminData }) {
  const viewsChartOption = {
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
      data: data.dailyViews.map((d) => {
        const date = new Date(d.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }),
      axisLine: { lineStyle: { color: "#1e1c2e" } },
      axisLabel: { color: "#94a3b8", fontSize: 10, interval: 4 },
    },
    yAxis: {
      type: "value" as const,
      axisLabel: { color: "#94a3b8", fontSize: 10 },
      splitLine: { lineStyle: { color: "#1e1c2e", type: "dashed" as const } },
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
      backgroundColor: "#14131e",
      borderColor: "#1e1c2e",
      textStyle: { color: "#f1f5f9", fontSize: 12 },
    },
    grid: { top: 10, right: 20, bottom: 5, left: 120 },
    xAxis: {
      type: "value" as const,
      axisLabel: { color: "#94a3b8", fontSize: 10 },
      splitLine: { lineStyle: { color: "#1e1c2e", type: "dashed" as const } },
    },
    yAxis: {
      type: "category" as const,
      data: [...data.topPages].reverse().map((p) =>
        p.page.length > 18 ? p.page.slice(0, 18) + "..." : p.page
      ),
      axisLabel: { color: "#94a3b8", fontSize: 10 },
      axisLine: { lineStyle: { color: "#1e1c2e" } },
    },
    series: [
      {
        type: "bar" as const,
        data: [...data.topPages].reverse().map((p) => p.count),
        itemStyle: {
          color: "#10b981",
          borderRadius: [0, 4, 4, 0],
        },
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
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Resumen general de CONDOR
        </p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          subtitle="Page views"
          icon={Eye}
          color="indigo"
          delay={0.05}
        />
        <KPICard
          title="Visitas 7d"
          value={data.views7d}
          subtitle="Ultima semana"
          icon={TrendingUp}
          color="sky"
          delay={0.1}
        />
        <KPICard
          title="Eventos 7d"
          value={data.events7d}
          subtitle="Clicks e interacciones"
          icon={MousePointerClick}
          color="amber"
          delay={0.15}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
                style={{ height: 280 }}
                opts={{ renderer: "svg" }}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
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
                  style={{ height: 280 }}
                  opts={{ renderer: "svg" }}
                />
              ) : (
                <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">
                  Sin datos aun
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
