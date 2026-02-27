"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Activity,
  Shield,
  Newspaper,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
  Clock,
  Database,
  Eye,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  Flag,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "@/components/dashboard/kpi-card";
import { cn } from "@/lib/utils";
import type { BrainData } from "./page";

// =============================================================================
// HELPERS
// =============================================================================

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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Human-readable descriptions for actions ──

function humanizeAction(action: {
  job: string;
  action_type: string;
  description: string;
  entity_id: string | null;
  before_value: Record<string, unknown> | null;
  after_value: Record<string, unknown> | null;
  confidence: number | null;
}): { emoji: string; title: string; detail: string } {
  const { job, action_type, description, before_value, after_value } = action;

  // Extract candidate name from description if available
  const nameMatch = description.match(
    /(?:Auto-updated |updated |\[FLAG\] )([^.:]+)/
  );
  const candidateName = nameMatch ? nameMatch[1].trim() : "";

  // ── Data Integrity ──
  if (job === "data-integrity") {
    // Poll spike
    if (description.includes("[POLL SPIKE]")) {
      const spikeMatch = description.match(
        /\[POLL SPIKE\] (.+?): Cambio de (.+?)pp .+?: (.+?)% → (.+?)% \((.+?)\)/
      );
      if (spikeMatch) {
        return {
          emoji: "📊",
          title: `Subida inusual de ${spikeMatch[1]}`,
          detail: `Pasó de ${spikeMatch[3]}% a ${spikeMatch[4]}% según ${spikeMatch[5]} (+${spikeMatch[2]} puntos)`,
        };
      }
      return { emoji: "📊", title: "Movimiento inusual en encuestas", detail: description };
    }

    // Auto-update
    if (action_type === "update") {
      const field = Object.keys(before_value || {})[0] || "";
      const beforeVal = String(Object.values(before_value || {})[0] || "");
      const afterVal = String(Object.values(after_value || {})[0] || "");

      if (field === "is_active") {
        return {
          emoji: "⚠️",
          title: `Desactivó a ${candidateName}`,
          detail: `Cambió estado a inactivo (esto fue un error, ya corregido)`,
        };
      }
      if (field === "bio") {
        // Check if it's an orthography fix
        if (description.toLowerCase().includes("tilde") || description.toLowerCase().includes("ortog")) {
          return {
            emoji: "✏️",
            title: `Corrigió ortografía de ${candidateName}`,
            detail: `Arregló tildes y acentos en la biografía`,
          };
        }
        return {
          emoji: "📝",
          title: `Actualizó biografía de ${candidateName}`,
          detail: afterVal.length > 100 ? afterVal.slice(0, 100) + "..." : afterVal,
        };
      }
      if (field === "age") {
        return {
          emoji: "🎂",
          title: `Corrigió edad de ${candidateName}`,
          detail: `${beforeVal} → ${afterVal} años`,
        };
      }
      if (field === "party") {
        return {
          emoji: "🏛️",
          title: `Cambió partido de ${candidateName}`,
          detail: `${beforeVal} → ${afterVal}`,
        };
      }
      return {
        emoji: "📝",
        title: `Actualizó ${field} de ${candidateName}`,
        detail: `${beforeVal.slice(0, 60)} → ${afterVal.slice(0, 60)}`,
      };
    }

    // Flag
    if (action_type === "flag") {
      if (description.includes("is_active")) {
        return {
          emoji: "🚩",
          title: `Sugirió revisar estado de ${candidateName}`,
          detail: "Requiere revisión manual (no se aplicó cambio automático)",
        };
      }
      return {
        emoji: "🚩",
        title: `Requiere revisión: ${candidateName}`,
        detail: description.replace(/\[FLAG\]\s*/, "").replace(/[^:]+:\s*/, ""),
      };
    }
  }

  // ── News Curator ──
  if (job === "news-curator") {
    if (action_type === "set_breaking") {
      return {
        emoji: "🔴",
        title: "Marcó noticia como Breaking",
        detail: description.replace(/^Set breaking.*?:\s*/, "").slice(0, 120),
      };
    }
    if (action_type === "deactivate") {
      const scoreMatch = description.match(/\((\d+)\/10\)/);
      return {
        emoji: "🗑️",
        title: "Eliminó noticia irrelevante",
        detail: `Puntuación ${scoreMatch ? scoreMatch[1] : "baja"}/10 — ${description.replace(/^Deactivated.*?:\s*/, "").slice(0, 100)}`,
      };
    }
  }

  // ── Briefing Generator ──
  if (job === "briefing-generator") {
    return {
      emoji: "📰",
      title: "Generó resumen del día",
      detail: `Briefing editorial generado exitosamente`,
    };
  }

  // ── Health Monitor ──
  if (job === "health-monitor") {
    if (description.includes("[HEALTH")) {
      const msg = description.replace(/\[HEALTH (CRITICAL|WARNING)\]\s*/, "");
      const isCritical = description.includes("CRITICAL");
      return {
        emoji: isCritical ? "🔴" : "⚠️",
        title: isCritical ? "Alerta crítica del sistema" : "Advertencia del sistema",
        detail: msg,
      };
    }
  }

  // ── Poll Verifier ──
  if (job === "poll-verifier") {
    return {
      emoji: "📊",
      title: "Verificó encuestas",
      detail: description,
    };
  }

  // Fallback
  return {
    emoji: "🔧",
    title: action_type === "update" ? "Actualización automática" : action_type === "flag" ? "Marcado para revisión" : description.slice(0, 50),
    detail: description.slice(0, 150),
  };
}

const jobLabels: Record<string, string> = {
  "data-integrity": "Datos",
  "poll-verifier": "Encuestas",
  "news-curator": "Noticias",
  "briefing-generator": "Briefing",
  "health-monitor": "Salud",
};

const jobColors: Record<string, string> = {
  "data-integrity": "text-violet-400 bg-violet-400/10 border-violet-400/20",
  "poll-verifier": "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "news-curator": "text-amber bg-amber/10 border-amber/20",
  "briefing-generator": "text-emerald bg-emerald/10 border-emerald/20",
  "health-monitor": "text-rose bg-rose/10 border-rose/20",
};

const jobIcons: Record<string, typeof Brain> = {
  "data-integrity": Database,
  "poll-verifier": BarChart3,
  "news-curator": Newspaper,
  "briefing-generator": FileText,
  "health-monitor": Activity,
};

const actionTypeConfig: Record<
  string,
  { label: string; className: string; icon: typeof Brain }
> = {
  update: {
    label: "Cambio aplicado",
    className: "text-emerald bg-emerald/10 border-emerald/20",
    icon: Pencil,
  },
  flag: {
    label: "Para revisar",
    className: "text-amber bg-amber/10 border-amber/20",
    icon: Flag,
  },
  set_breaking: {
    label: "Breaking",
    className: "text-rose bg-rose/10 border-rose/20",
    icon: Zap,
  },
  deactivate: {
    label: "Eliminado",
    className: "text-red-400 bg-red-400/10 border-red-400/20",
    icon: Trash2,
  },
  create: {
    label: "Creado",
    className: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
    icon: FileText,
  },
};

const verdictColors: Record<string, string> = {
  VERDADERO: "text-emerald",
  FALSO: "text-rose",
  ENGANOSO: "text-amber",
  PARCIALMENTE_VERDADERO: "text-amber",
  NO_VERIFICABLE: "text-muted-foreground",
};

// =============================================================================
// COMPONENT
// =============================================================================

export function BrainClient({ data }: { data: BrainData }) {
  const latestBriefing = data.briefings[0];
  const [showAllActions, setShowAllActions] = useState(false);

  // Group actions by run for timeline view
  const actionsByRun = data.recentRuns.map((run) => ({
    ...run,
    actions: data.actions.filter((a) => a.run_id === run.runId),
  }));

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
      >
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Brain className="h-6 w-6 text-violet-400" />
          <span>{data.countryEmoji}</span>
          CONDOR Brain
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {data.stats.lastRunTime
            ? `Última actividad: ${timeAgo(data.stats.lastRunTime)}`
            : "Sin actividad registrada"}
        </p>
      </motion.div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Ejecuciones"
          value={data.stats.totalRuns}
          subtitle={`${data.stats.actionsToday} acciones hoy`}
          icon={Activity}
          color="indigo"
          delay={0.05}
        />
        <KPICard
          title="Correcciones"
          value={data.stats.totalUpdates}
          subtitle="datos corregidos"
          icon={CheckCircle2}
          color="emerald"
          delay={0.1}
        />
        <KPICard
          title="Alertas"
          value={data.stats.totalFlags}
          subtitle="para revisar"
          icon={AlertTriangle}
          color="amber"
          delay={0.15}
        />
        <KPICard
          title="Breaking"
          value={data.stats.totalBreaking}
          subtitle="noticias urgentes"
          icon={Zap}
          color="rose"
          delay={0.2}
        />
        <KPICard
          title="Briefings"
          value={data.stats.totalBriefings}
          subtitle="resúmenes generados"
          icon={FileText}
          color="sky"
          delay={0.25}
        />
      </div>

      {/* ── System Health ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-3.5 w-3.5" />
              Estado del Sistema
              {data.healthChecks.length > 0 && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-mono ml-auto",
                    data.healthChecks.every((c) => c.ok)
                      ? "text-emerald border-emerald/30"
                      : "text-rose border-rose/30"
                  )}
                >
                  {data.healthChecks.every((c) => c.ok) ? "TODO OK" : "REVISAR"}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {data.healthChecks.map((check) => (
                <div
                  key={check.system}
                  className={cn(
                    "rounded-lg border p-3 transition-colors",
                    check.ok
                      ? "border-emerald/20 bg-emerald/5"
                      : "border-rose/20 bg-rose/5"
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {check.ok ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-rose" />
                    )}
                    <span className="text-xs font-medium text-foreground">
                      {check.system}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono tabular-nums text-muted-foreground">
                    {check.detail}
                  </p>
                </div>
              ))}
              {data.healthChecks.length === 0 && (
                <p className="text-xs text-muted-foreground col-span-4">
                  Sin datos de salud. Ejecuta el Brain para ver el estado.
                </p>
              )}
            </div>

            {/* Health Alerts */}
            {data.healthAlerts.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                {data.healthAlerts.map((alert, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center gap-2 text-xs rounded px-2 py-1",
                      alert.severity === "critical"
                        ? "bg-rose/10 text-rose"
                        : "bg-amber/10 text-amber"
                    )}
                  >
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    <span className="truncate">{alert.message}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Row: Latest Briefing + Activity Summary ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Latest Briefing (2/3) */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" />
                Resumen del Día
                {latestBriefing && (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono ml-auto"
                  >
                    {latestBriefing.briefing_date}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestBriefing ? (
                <div className="space-y-4">
                  <p className="text-sm text-foreground leading-relaxed">
                    {latestBriefing.editorial_summary}
                  </p>

                  {/* Top Stories */}
                  {latestBriefing.top_stories.length > 0 && (
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                        Noticias Principales
                      </p>
                      <div className="space-y-2">
                        {latestBriefing.top_stories.map((s, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 rounded-lg border border-border p-2.5"
                          >
                            <span className="text-[10px] font-mono font-bold text-primary tabular-nums mt-0.5">
                              #{i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">
                                {s.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-muted-foreground">
                                  {s.source}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[9px] font-mono px-1 py-0",
                                    s.impact_score >= 8
                                      ? "text-rose border-rose/30"
                                      : s.impact_score >= 6
                                        ? "text-amber border-amber/30"
                                        : "text-muted-foreground"
                                  )}
                                >
                                  Impacto {s.impact_score}/10
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Poll Movements */}
                  {latestBriefing.poll_movements &&
                    latestBriefing.poll_movements.length > 0 && (
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                          Movimientos en Encuestas
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {latestBriefing.poll_movements
                            .filter((p) => p.direction !== "stable")
                            .map((p, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-1.5 text-xs"
                              >
                                <span
                                  className={cn(
                                    "text-sm",
                                    p.direction === "up"
                                      ? "text-emerald"
                                      : "text-rose"
                                  )}
                                >
                                  {p.direction === "up" ? "↑" : "↓"}
                                </span>
                                <span className="text-foreground font-medium truncate">
                                  {p.candidate}
                                </span>
                                <span className="font-mono tabular-nums text-muted-foreground">
                                  {p.previous}→{p.current}%
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                  {/* Fact Checks */}
                  {latestBriefing.new_fact_checks &&
                    latestBriefing.new_fact_checks.length > 0 && (
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                          Verificaciones Recientes
                        </p>
                        <div className="space-y-1">
                          {latestBriefing.new_fact_checks.slice(0, 5).map((fc, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 text-xs"
                            >
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[9px] font-mono px-1 py-0 min-w-[60px] justify-center",
                                  verdictColors[fc.verdict] ||
                                    "text-muted-foreground"
                                )}
                              >
                                {fc.verdict.replace(/_/g, " ")}
                              </Badge>
                              <span className="text-muted-foreground truncate">
                                {fc.claim}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sin resúmenes generados aún.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Summary (1/3) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-3.5 w-3.5" />
                Actividad por Área
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(data.actionsByJob).length > 0 ? (
                Object.entries(data.actionsByJob).map(([job, count]) => {
                  const Icon = jobIcons[job] || Brain;
                  return (
                    <div key={job} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium text-foreground">
                            {jobLabels[job] || job}
                          </span>
                        </div>
                        <span className="text-xs font-mono tabular-nums text-muted-foreground">
                          {count} {count === 1 ? "acción" : "acciones"}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (count / Math.max(...Object.values(data.actionsByJob))) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground">Sin actividad</p>
              )}

              {/* Recent runs */}
              <div className="pt-2 border-t border-border">
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                  Últimas Ejecuciones
                </p>
                <div className="space-y-1.5">
                  {data.recentRuns.slice(0, 5).map((run) => (
                    <div
                      key={run.runId}
                      className="flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {timeAgo(run.createdAt)}
                        </span>
                      </div>
                      <span className="font-mono tabular-nums text-foreground">
                        {run.actionsCount} {run.actionsCount === 1 ? "acción" : "acciones"}
                      </span>
                    </div>
                  ))}
                  {data.recentRuns.length === 0 && (
                    <p className="text-[11px] text-muted-foreground">
                      Sin ejecuciones
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Timeline — Qué hizo Brain ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Eye className="h-3.5 w-3.5" />
              ¿Qué hizo Brain?
              <Badge
                variant="outline"
                className="text-[10px] font-mono ml-auto"
              >
                {data.totalActions} acciones totales
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {actionsByRun.length > 0 ? (
              <div className="space-y-4">
                {actionsByRun
                  .slice(0, showAllActions ? undefined : 3)
                  .map((run) => (
                    <div key={run.runId} className="space-y-2">
                      {/* Run header */}
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/10">
                          <Brain className="h-3 w-3 text-violet-400" />
                        </div>
                        <span className="text-xs font-medium text-foreground">
                          {formatDate(run.createdAt)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          — {run.actionsCount}{" "}
                          {run.actionsCount === 1 ? "acción" : "acciones"}
                        </span>
                      </div>

                      {/* Actions list */}
                      <div className="ml-3 border-l-2 border-border pl-4 space-y-1.5">
                        {run.actions.map((action) => {
                          const h = humanizeAction(action);
                          const config =
                            actionTypeConfig[action.action_type] ||
                            actionTypeConfig.create;

                          return (
                            <div
                              key={action.id}
                              className="flex items-start gap-2 rounded-lg px-3 py-2 hover:bg-muted/30 transition-colors"
                            >
                              <span className="text-sm mt-0.5 shrink-0">
                                {h.emoji}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-medium text-foreground">
                                    {h.title}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-[9px] font-mono px-1.5 py-0",
                                      jobColors[action.job] || ""
                                    )}
                                  >
                                    {jobLabels[action.job] || action.job}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-[9px] font-mono px-1.5 py-0",
                                      config.className
                                    )}
                                  >
                                    {config.label}
                                  </Badge>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                  {h.detail}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                {/* Show more button */}
                {actionsByRun.length > 3 && (
                  <button
                    onClick={() => setShowAllActions(!showAllActions)}
                    className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors mx-auto"
                  >
                    {showAllActions ? (
                      <>
                        <ChevronUp className="h-3.5 w-3.5" />
                        Ver menos
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3.5 w-3.5" />
                        Ver {actionsByRun.length - 3} ejecuciones más
                      </>
                    )}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Brain aún no ha hecho nada.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Se ejecuta automáticamente cada día a las 5:00 AM.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Previous Briefings ── */}
      {data.briefings.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" />
                Resúmenes Anteriores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.briefings.slice(1).map((b) => (
                  <div
                    key={b.id}
                    className="rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono"
                      >
                        {b.briefing_date}
                      </Badge>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">
                      {b.editorial_summary.substring(0, 300)}
                      {b.editorial_summary.length > 300 ? "..." : ""}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
