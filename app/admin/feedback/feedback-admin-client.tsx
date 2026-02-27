"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Lightbulb,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  Bug,
  Palette,
  Database,
  Sparkles,
  FileText,
  HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface Suggestion {
  title: string;
  description: string;
  category: string;
  priority: string;
}

interface FeedbackSubmission {
  id: string;
  country_code: string;
  conversation: Array<{ role: string; content: string }>;
  raw_feedback: string;
  suggestions: Suggestion[];
  category: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

interface FeedbackStats {
  total: number;
  pending: number;
  reviewed: number;
  approved: number;
  rejected: number;
  totalSuggestions: number;
}

interface CountryConfig {
  code: string;
  name: string;
  emoji: string;
}

// =============================================================================
// CONFIG
// =============================================================================

const statusConfig: Record<
  string,
  { label: string; icon: typeof Clock; className: string }
> = {
  pending: {
    label: "Pendiente",
    icon: Clock,
    className: "text-amber bg-amber/10 border-amber/20",
  },
  reviewed: {
    label: "Revisado",
    icon: Eye,
    className: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  },
  approved: {
    label: "Aprobado",
    icon: CheckCircle2,
    className: "text-emerald bg-emerald/10 border-emerald/20",
  },
  rejected: {
    label: "Rechazado",
    icon: XCircle,
    className: "text-rose bg-rose/10 border-rose/20",
  },
};

const categoryIcons: Record<string, typeof Bug> = {
  bug: Bug,
  ux: Palette,
  data: Database,
  feature: Sparkles,
  content: FileText,
  other: HelpCircle,
};

const categoryLabels: Record<string, string> = {
  bug: "Bug",
  ux: "UX",
  data: "Datos",
  feature: "Feature",
  content: "Contenido",
  other: "Otro",
};

const priorityColors: Record<string, string> = {
  high: "text-rose bg-rose/10 border-rose/20",
  medium: "text-amber bg-amber/10 border-amber/20",
  low: "text-blue-400 bg-blue-400/10 border-blue-400/20",
};

// =============================================================================
// COMPONENT
// =============================================================================

export function FeedbackAdminClient({
  feedback,
  stats,
  country,
}: {
  feedback: FeedbackSubmission[];
  stats: FeedbackStats;
  country: CountryConfig;
}) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered =
    statusFilter === "all"
      ? feedback
      : feedback.filter((f) => f.status === statusFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Feedback {country.emoji}
            </h1>
            <p className="text-xs text-muted-foreground">
              Sugerencias de usuarios recopiladas por CONDOR AI
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <StatCard label="Total" value={stats.total} />
        <StatCard
          label="Pendientes"
          value={stats.pending}
          className="text-amber"
        />
        <StatCard
          label="Revisados"
          value={stats.reviewed}
          className="text-blue-400"
        />
        <StatCard
          label="Aprobados"
          value={stats.approved}
          className="text-emerald"
        />
        <StatCard
          label="Rechazados"
          value={stats.rejected}
          className="text-rose"
        />
        <StatCard
          label="Sugerencias"
          value={stats.totalSuggestions}
          icon={<Lightbulb className="h-3.5 w-3.5 text-amber" />}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {["all", "pending", "reviewed", "approved", "rejected"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                statusFilter === status
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-card text-muted-foreground border-border hover:text-foreground"
              )}
            >
              {status === "all"
                ? `Todos (${stats.total})`
                : `${statusConfig[status]?.label || status} (${feedback.filter((f) => f.status === status).length})`}
            </button>
          )
        )}
      </div>

      {/* Feedback list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card/50 p-8 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {statusFilter === "all"
                ? "No hay feedback todavía"
                : `No hay feedback con estado "${statusConfig[statusFilter]?.label || statusFilter}"`}
            </p>
          </div>
        ) : (
          filtered.map((item, index) => (
            <FeedbackCard
              key={item.id}
              item={item}
              index={index}
              isExpanded={expandedId === item.id}
              onToggle={() =>
                setExpandedId(expandedId === item.id ? null : item.id)
              }
            />
          ))
        )}
      </div>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function StatCard({
  label,
  value,
  className,
  icon,
}: {
  label: string;
  value: number;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] font-mono text-muted-foreground uppercase">
          {label}
        </span>
      </div>
      <span
        className={cn(
          "text-2xl font-bold font-mono tabular-nums",
          className || "text-foreground"
        )}
      >
        {value}
      </span>
    </div>
  );
}

function FeedbackCard({
  item,
  index,
  isExpanded,
  onToggle,
}: {
  item: FeedbackSubmission;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const date = new Date(item.created_at);
  const dateStr = date.toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const statusCfg = statusConfig[item.status] || statusConfig.pending;
  const StatusIcon = statusCfg.icon;
  const CategoryIcon = categoryIcons[item.category || "other"] || HelpCircle;
  const userMessages = item.conversation?.filter(
    (m) => m.role === "user"
  ).length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      {/* Header row */}
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Top line: status + category + date */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-mono gap-1",
                statusCfg.className
              )}
            >
              <StatusIcon className="h-3 w-3" />
              {statusCfg.label}
            </Badge>
            {item.category && (
              <Badge
                variant="outline"
                className="text-[10px] font-mono gap-1 text-muted-foreground"
              >
                <CategoryIcon className="h-3 w-3" />
                {categoryLabels[item.category] || item.category}
              </Badge>
            )}
            <span className="text-[10px] font-mono text-muted-foreground/50">
              {dateStr}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground/50">
              {userMessages} msg{userMessages !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Feedback summary */}
          <p className="text-sm text-foreground line-clamp-2">
            {item.raw_feedback}
          </p>

          {/* Suggestions preview */}
          {item.suggestions && item.suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {item.suggestions.map((s, i) => (
                <span
                  key={i}
                  className={cn(
                    "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono",
                    priorityColors[s.priority] || priorityColors.low
                  )}
                >
                  <Lightbulb className="h-2.5 w-2.5" />
                  {s.title}
                </span>
              ))}
            </div>
          )}
        </div>

        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
        )}
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-t border-border"
        >
          {/* Suggestions detail */}
          {item.suggestions && item.suggestions.length > 0 && (
            <div className="p-4 border-b border-border/50">
              <h4 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-amber" />
                Sugerencias extraídas ({item.suggestions.length})
              </h4>
              <div className="space-y-2">
                {item.suggestions.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        {s.title}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] font-mono",
                          priorityColors[s.priority] || priorityColors.low
                        )}
                      >
                        {s.priority}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[9px] font-mono text-muted-foreground"
                      >
                        {categoryLabels[s.category] || s.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {s.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conversation */}
          <div className="p-4">
            <h4 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
              Conversación completa
            </h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
              {(item.conversation || []).map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-2",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs max-w-[80%]",
                      msg.role === "user"
                        ? "bg-primary/10 text-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
