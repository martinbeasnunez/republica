"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { KPICard } from "@/components/dashboard/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Users,
  Smartphone,
  Monitor,
  Link2,
  MousePointerClick,
  Globe,
} from "lucide-react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface AnalyticsData {
  totalViews: number;
  uniqueSessions: number;
  mobileCount: number;
  desktopCount: number;
  pagesByViews: { page: string; count: number }[];
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
}

export function AnalyticsClient({ data }: { data: AnalyticsData }) {
  const mobilePct =
    data.totalViews > 0
      ? Math.round((data.mobileCount / data.totalViews) * 100)
      : 0;

  const deviceChartOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item" as const,
      backgroundColor: "#14131e",
      borderColor: "#1e1c2e",
      textStyle: { color: "#f1f5f9", fontSize: 12 },
    },
    series: [
      {
        type: "pie" as const,
        radius: ["50%", "75%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: "#0c0b14", borderWidth: 2 },
        label: { show: false },
        data: [
          {
            value: data.mobileCount,
            name: "Mobile",
            itemStyle: { color: "#6366f1" },
          },
          {
            value: data.desktopCount,
            name: "Desktop",
            itemStyle: { color: "#10b981" },
          },
        ],
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
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Detalle de visitas, eventos y referrers (7 dias)
        </p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Views 7d"
          value={data.totalViews}
          subtitle="Page views totales"
          icon={Eye}
          color="indigo"
          delay={0}
        />
        <KPICard
          title="Sesiones"
          value={data.uniqueSessions}
          subtitle="Usuarios unicos"
          icon={Users}
          color="emerald"
          delay={0.05}
        />
        <KPICard
          title="Mobile"
          value={`${mobilePct}%`}
          subtitle={`${data.mobileCount} visitas`}
          icon={Smartphone}
          color="sky"
          delay={0.1}
        />
        <KPICard
          title="Desktop"
          value={`${100 - mobilePct}%`}
          subtitle={`${data.desktopCount} visitas`}
          icon={Monitor}
          color="amber"
          delay={0.15}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Pages by views */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Globe className="h-3.5 w-3.5" />
                Paginas mas visitadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.pagesByViews.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Sin datos
                </p>
              ) : (
                <div className="space-y-2">
                  {data.pagesByViews.slice(0, 12).map((p, i) => (
                    <div
                      key={p.page}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-mono text-muted-foreground w-4 text-right">
                          {i + 1}
                        </span>
                        <span className="text-xs text-foreground truncate font-mono">
                          {p.page}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-indigo rounded-full"
                            style={{
                              width: `${(p.count / (data.pagesByViews[0]?.count || 1)) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground w-8 text-right">
                          {p.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Device breakdown + Referrers */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Smartphone className="h-3.5 w-3.5" />
                  Dispositivos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.totalViews > 0 ? (
                  <ReactECharts
                    option={deviceChartOption}
                    style={{ height: 140 }}
                    opts={{ renderer: "svg" }}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Sin datos
                  </p>
                )}
                <div className="flex justify-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-indigo" />
                    <span className="text-[10px] text-muted-foreground">
                      Mobile ({data.mobileCount})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-emerald" />
                    <span className="text-[10px] text-muted-foreground">
                      Desktop ({data.desktopCount})
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Link2 className="h-3.5 w-3.5" />
                  Referrers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.referrers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Sin referrers (trafico directo)
                  </p>
                ) : (
                  <div className="space-y-1.5">
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
        </div>
      </div>

      {/* Events */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MousePointerClick className="h-3.5 w-3.5" />
              Eventos recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay eventos registrados aun
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 text-xs font-medium text-muted-foreground">
                        Evento
                      </th>
                      <th className="pb-2 text-xs font-medium text-muted-foreground">
                        Pagina
                      </th>
                      <th className="pb-2 text-xs font-medium text-muted-foreground">
                        Target
                      </th>
                      <th className="pb-2 text-xs font-medium text-muted-foreground">
                        Cuando
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentEvents.map((ev) => (
                      <tr
                        key={ev.id}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-2">
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {ev.event}
                          </Badge>
                        </td>
                        <td className="py-2 text-xs font-mono text-muted-foreground">
                          {ev.page}
                        </td>
                        <td className="py-2 text-xs text-foreground">
                          {ev.target}
                        </td>
                        <td className="py-2 text-xs text-muted-foreground font-mono">
                          {new Date(ev.created_at).toLocaleString("es-PE", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Top events summary */}
            {data.topEvents.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                  Top eventos (7d)
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.topEvents.slice(0, 8).map((e) => (
                    <div
                      key={`${e.event}:${e.target}`}
                      className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1"
                    >
                      <span className="text-[10px] text-foreground">
                        {e.event}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {e.target}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[9px] px-1 py-0"
                      >
                        {e.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
