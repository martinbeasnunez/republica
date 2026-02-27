"use client";

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
  return `${d.getDate()}/${d.getMonth() + 1} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const jobLabels: Record<string, string> = {
  "data-integrity": "Integridad de Datos",
  "poll-verifier": "Verificador de Encuestas",
  "news-curator": "Curador de Noticias",
  "briefing-generator": "Generador de Briefing",
  "health-monitor": "Monitor de Salud",
};

const jobIcons: Record<string, typeof Brain> = {
  "data-integrity": Database,
  "poll-verifier": Shield,
  "news-curator": Newspaper,
  "briefing-generator": FileText,
  "health-monitor": Activity,
};

const actionTypeConfig: Record<
  string,
  { label: string; className: string; icon: typeof Brain }
> = {
  update: {
    label: "UPDATE",
    className: "text-emerald bg-emerald/10 border-emerald/20",
    icon: CheckCircle2,
  },
  flag: {
    label: "FLAG",
    className: "text-amber bg-amber/10 border-amber/20",
    icon: AlertTriangle,
  },
  set_breaking: {
    label: "BREAKING",
    className: "text-rose bg-rose/10 border-rose/20",
    icon: Zap,
  },
  deactivate: {
    label: "DEACTIVATE",
    className: "text-red-400 bg-red-400/10 border-red-400/20",
    icon: XCircle,
  },
  create: {
    label: "CREATE",
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
          CONDOR Brain — {data.countryName}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sistema autonomo de inteligencia editorial.{" "}
          {data.stats.lastRunTime
            ? `Ultimo run: ${timeAgo(data.stats.lastRunTime)}`
            : "Sin runs registrados"}
        </p>
      </motion.div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Runs (7d)"
          value={data.stats.totalRuns}
          subtitle={`${data.stats.actionsToday} acciones hoy`}
          icon={Activity}
          color="indigo"
          delay={0.05}
        />
        <KPICard
          title="Auto-Updates"
          value={data.stats.totalUpdates}
          subtitle="datos corregidos"
          icon={CheckCircle2}
          color="emerald"
          delay={0.1}
        />
        <KPICard
          title="Flags"
          value={data.stats.totalFlags}
          subtitle="para revision"
          icon={AlertTriangle}
          color="amber"
          delay={0.15}
        />
        <KPICard
          title="Breaking"
          value={data.stats.totalBreaking}
          subtitle="noticias marcadas"
          icon={Zap}
          color="rose"
          delay={0.2}
        />
        <KPICard
          title="Briefings"
          value={data.stats.totalBriefings}
          subtitle="editoriales generados"
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
                      : data.healthChecks.some((c) => !c.ok)
                        ? "text-rose border-rose/30"
                        : "text-amber border-amber/30"
                  )}
                >
                  {data.healthChecks.every((c) => c.ok) ? "HEALTHY" : "DEGRADED"}
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
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  Alertas
                </p>
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

      {/* ── Row: Latest Briefing + Jobs Breakdown ── */}
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
                Briefing del Dia
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
                        Top Stories
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
                                  {s.impact_score}/10
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
                  Sin briefings generados aun.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Jobs Breakdown (1/3) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-3.5 w-3.5" />
                Jobs (7 dias)
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
                          {count}
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
                <p className="text-xs text-muted-foreground">Sin datos</p>
              )}

              {/* Recent runs */}
              <div className="pt-2 border-t border-border">
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                  Runs Recientes
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
                        {run.actionsCount} acciones
                      </span>
                    </div>
                  ))}
                  {data.recentRuns.length === 0 && (
                    <p className="text-[11px] text-muted-foreground">
                      Sin runs
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Audit Trail ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="h-3.5 w-3.5" />
              Audit Trail
              <Badge
                variant="outline"
                className="text-[10px] font-mono ml-auto"
              >
                {data.totalActions} total
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.actions.length > 0 ? (
              <div className="space-y-1.5">
                {data.actions.slice(0, 30).map((action) => {
                  const config =
                    actionTypeConfig[action.action_type] || actionTypeConfig.create;
                  const Icon = config.icon;
                  const JobIcon = jobIcons[action.job] || Brain;

                  return (
                    <div
                      key={action.id}
                      className="flex items-start gap-2 rounded-lg border border-border px-3 py-2 hover:bg-muted/30 transition-colors"
                    >
                      {/* Action type icon */}
                      <Icon
                        className={cn(
                          "h-3.5 w-3.5 mt-0.5 shrink-0",
                          config.className.split(" ")[0]
                        )}
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[9px] font-mono px-1 py-0",
                              config.className
                            )}
                          >
                            {config.label}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <JobIcon className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">
                              {jobLabels[action.job] || action.job}
                            </span>
                          </div>
                          {action.entity_id && (
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {action.entity_id}
                            </span>
                          )}
                          {action.confidence != null && (
                            <span
                              className={cn(
                                "text-[10px] font-mono tabular-nums",
                                action.confidence >= 0.85
                                  ? "text-emerald"
                                  : action.confidence >= 0.5
                                    ? "text-amber"
                                    : "text-muted-foreground"
                              )}
                            >
                              {Math.round(action.confidence * 100)}%
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-foreground mt-0.5 truncate">
                          {action.description}
                        </p>

                        {/* Before/After diff */}
                        {action.before_value && action.after_value && (
                          <div className="flex items-center gap-2 mt-1 text-[10px] font-mono">
                            <span className="text-rose line-through truncate max-w-[200px]">
                              {Object.values(action.before_value)[0] as string}
                            </span>
                            <span className="text-muted-foreground">→</span>
                            <span className="text-emerald truncate max-w-[200px]">
                              {Object.values(action.after_value)[0] as string}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Timestamp */}
                      <span className="text-[10px] text-muted-foreground font-mono tabular-nums shrink-0">
                        {formatDate(action.created_at)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Eye className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Sin acciones registradas.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  El Brain se ejecuta diariamente a las 5:00 AM (hora Peru/Colombia).
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
                Briefings Anteriores
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
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {b.id}
                      </span>
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
