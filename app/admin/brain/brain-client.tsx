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
  Sparkles,
  LayoutGrid,
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

// ── Clean internal block type names from AI reasoning text ──

function cleanBlockTypeNames(text: string): string {
  return text
    .replace(/[''']?poll_shift[''']?/g, "encuestas")
    .replace(/[''']?breaking_news[''']?/g, "noticias urgentes")
    .replace(/[''']?fact_check_alert[''']?/g, "verificación de hechos")
    .replace(/[''']?editorial_highlight[''']?/g, "análisis editorial")
    .replace(/[''']?engagement_cta[''']?/g, "participación")
    .replace(/[''']?candidate_spotlight[''']?/g, "candidato destacado");
}

// ── Contextual block type descriptions ──

const blockTypeContext: Record<string, string> = {
  poll_shift: "Destaca un movimiento importante en las encuestas",
  breaking_news: "Noticia de alto impacto para los votantes",
  fact_check_alert: "Verificación relevante para la elección",
  editorial_highlight: "Análisis editorial sobre un tema del momento",
  engagement_cta: "Invita al usuario a participar en la plataforma",
  candidate_spotlight: "Perfil destacado de un candidato",
};

// Short labels for block types (used in grouped summaries)
const blockTypeShortLabel: Record<string, string> = {
  poll_shift: "Encuestas",
  breaking_news: "Noticias",
  fact_check_alert: "Verificación",
  editorial_highlight: "Editorial",
  engagement_cta: "Quiz",
  candidate_spotlight: "Candidato",
};

// ── Grouped insights per run (replaces individual action rendering) ──

interface RunInsight {
  emoji: string;
  title: string;
  detail: string;
  job: string;
}

function groupRunIntoInsights(
  actions: Array<{
    id: string;
    job: string;
    action_type: string;
    description: string;
    entity_id: string | null;
    before_value: Record<string, unknown> | null;
    after_value: Record<string, unknown> | null;
    confidence: number | null;
  }>
): RunInsight[] {
  // Group actions by job
  const byJob = new Map<string, typeof actions>();
  for (const a of actions) {
    const existing = byJob.get(a.job) || [];
    existing.push(a);
    byJob.set(a.job, existing);
  }

  const insights: RunInsight[] = [];

  // Define job order for consistent display
  const jobOrder = [
    "site-auditor", "homepage-composer", "health-monitor",
    "briefing-generator", "news-curator", "profile-researcher",
    "data-integrity", "poll-verifier",
  ];

  for (const job of jobOrder) {
    const jobActions = byJob.get(job);
    if (!jobActions || jobActions.length === 0) continue;

    switch (job) {
      case "site-auditor": {
        const audit = jobActions.find((a) => a.after_value?.overall_score != null);
        if (audit) {
          const score = Number(audit.after_value!.overall_score);
          const scores = {
            content: Number(audit.after_value!.content_score || 0),
            freshness: Number(audit.after_value!.freshness_score || 0),
            quality: Number(audit.after_value!.quality_score || 0),
            seo: Number(audit.after_value!.seo_score || 0),
          };
          const labels: Record<string, string> = { content: "contenido", freshness: "frescura", quality: "calidad", seo: "SEO" };
          const entries = Object.entries(scores);
          entries.sort((a, b) => b[1] - a[1]);
          const best = entries[0];
          const worst = entries[entries.length - 1];
          const emoji = score >= 80 ? "💚" : score >= 60 ? "💛" : "🔴";
          const status = score >= 80 ? "La web está bien" : score >= 60 ? "La web puede mejorar" : "La web necesita trabajo";
          insights.push({
            emoji,
            title: `${status} (${score} de 100)`,
            detail: `Lo mejor: ${labels[best[0]]} (${best[1]}). Lo más flojo: ${labels[worst[0]]} (${worst[1]})`,
            job,
          });
        } else {
          const m = jobActions[0].description.match(/Site audit: (\d+)\/100/);
          insights.push({
            emoji: "👁️",
            title: m ? `La web sacó ${m[1]} de 100` : "Revisó la web",
            detail: "Chequeó contenido, frescura, calidad y SEO",
            job,
          });
        }
        break;
      }

      case "homepage-composer": {
        const creates = jobActions.filter((a) => a.action_type === "create");
        const compose = jobActions.find((a) => a.action_type === "compose");
        const blockNames = creates.map((a) => {
          const type = String(a.after_value?.block_type || "");
          return blockTypeShortLabel[type] || a.description.replace(/^Bloque \w+:\s*/, "").slice(0, 20);
        });
        const reasoning = compose?.after_value?.reasoning
          ? cleanBlockTypeNames(String(compose.after_value.reasoning).slice(0, 150))
          : null;
        insights.push({
          emoji: "🧩",
          title: creates.length > 0
            ? `Armó ${creates.length} secciones nuevas para la home`
            : "Reorganizó la página principal",
          detail: blockNames.length > 0
            ? blockNames.join(" · ") + (reasoning ? ` — ${reasoning}` : "")
            : reasoning || "Cambió el orden y contenido de la portada",
          job,
        });
        break;
      }

      case "health-monitor": {
        const alerts = jobActions.filter((a) => a.description.includes("[HEALTH"));
        const critical = alerts.filter((a) => a.description.includes("CRITICAL"));
        if (alerts.length === 0) {
          insights.push({
            emoji: "✅",
            title: "Todo funciona bien",
            detail: "No encontró problemas en ningún sistema",
            job,
          });
        } else {
          const msg = alerts[0].description.replace(/\[HEALTH (CRITICAL|WARNING)\]\s*/, "");
          insights.push({
            emoji: critical.length > 0 ? "🔴" : "⚠️",
            title: critical.length > 0
              ? `Hay ${alerts.length} ${alerts.length === 1 ? "problema serio" : "problemas serios"}`
              : `Encontró ${alerts.length} ${alerts.length === 1 ? "cosa para revisar" : "cosas para revisar"}`,
            detail: msg,
            job,
          });
        }
        break;
      }

      case "briefing-generator": {
        insights.push({
          emoji: "📰",
          title: "Escribió el resumen del día",
          detail: "Leyó las noticias más importantes y redactó un resumen con lo que pasó",
          job,
        });
        break;
      }

      case "news-curator": {
        const breaking = jobActions.filter((a) => a.action_type === "set_breaking");
        const deactivated = jobActions.filter((a) => a.action_type === "deactivate");
        const parts: string[] = [];
        if (breaking.length > 0) {
          const titles = breaking.map((a) =>
            a.description.replace(/^Set breaking.*?:\s*/, "").slice(0, 50)
          );
          parts.push(titles.join(", "));
        }
        if (deactivated.length > 0) {
          parts.push(`Descartó ${deactivated.length} noticias poco importantes`);
        }
        insights.push({
          emoji: "📡",
          title: breaking.length > 0
            ? `Encontró ${breaking.length} ${breaking.length === 1 ? "noticia importante" : "noticias importantes"}`
            : `Leyó ${jobActions.length} noticias nuevas`,
          detail: parts.join(". ") || "Revisó las noticias del día y eligió las más relevantes",
          job,
        });
        break;
      }

      case "profile-researcher": {
        const created = jobActions.filter((a) => a.action_type === "create");
        const updated = jobActions.filter((a) => a.action_type === "update");
        const names = [...created, ...updated].map((a) => {
          const m = a.description.match(/(?:Created|Updated) profile for (.+?)(?:\s*\(|$)/);
          return m ? m[1] : null;
        }).filter(Boolean);
        const total = created.length + updated.length;
        insights.push({
          emoji: "🔍",
          title: `Buscó info de ${total} ${total === 1 ? "candidato" : "candidatos"}`,
          detail: names.length > 0
            ? names.join(", ")
            : "Leyó noticias recientes y armó perfiles con datos verificables",
          job,
        });
        break;
      }

      case "data-integrity": {
        const updates = jobActions.filter((a) => a.action_type === "update");
        const flags = jobActions.filter((a) => a.action_type === "flag");
        const spikes = jobActions.filter((a) => a.description.includes("[POLL SPIKE]"));
        const parts: string[] = [];
        if (updates.length > 0) parts.push(`Corrigió ${updates.length} errores`);
        if (flags.length > 0) parts.push(`encontró ${flags.length} datos dudosos`);
        if (spikes.length > 0) {
          const spikeNames = spikes.map((a) => {
            const m = a.description.match(/\[POLL SPIKE\] (.+?):/);
            return m ? m[1] : null;
          }).filter(Boolean);
          if (spikeNames.length > 0) parts.push(`subidas raras de ${spikeNames.join(", ")}`);
        }
        insights.push({
          emoji: "🛡️",
          title: flags.length > 0
            ? "Encontró datos que no cuadran"
            : "Los datos están bien",
          detail: parts.join(", ") || "Revisó que la info de cada candidato sea correcta",
          job,
        });
        break;
      }

      case "poll-verifier": {
        const flags = jobActions.filter((a) => a.action_type === "flag");
        insights.push({
          emoji: "📊",
          title: flags.length === 0
            ? "Las encuestas están bien"
            : `${flags.length} ${flags.length === 1 ? "encuesta" : "encuestas"} con datos raros`,
          detail: flags.length === 0
            ? "Verificó que los números de las encuestadoras sean coherentes"
            : flags.map((f) => f.description.slice(0, 60)).join(". "),
          job,
        });
        break;
      }

      default: {
        insights.push({
          emoji: "🔧",
          title: `${jobActions.length} acciones de ${job}`,
          detail: jobActions[0].description.slice(0, 100),
          job,
        });
      }
    }
  }

  return insights;
}

// ── Job insights for sidebar (replaces "X acciones") ──

function getJobInsight(
  job: string,
  actions: Array<{ job: string; action_type: string; description: string; after_value: Record<string, unknown> | null }>
): string {
  const jobActions = actions.filter((a) => a.job === job);
  if (jobActions.length === 0) return "No hizo nada esta semana";

  switch (job) {
    case "site-auditor": {
      const audit = jobActions.find((a) => a.after_value?.overall_score != null);
      if (audit) {
        const score = Number(audit.after_value!.overall_score);
        if (score >= 80) return `La web está bien (${score}/100)`;
        if (score >= 60) return `La web puede mejorar (${score}/100)`;
        return `La web necesita atención (${score}/100)`;
      }
      return "Revisó que la web funcione bien";
    }
    case "homepage-composer": {
      const created = jobActions.filter((a) => a.action_type === "create").length;
      if (created > 0) return `Armó ${created} secciones nuevas`;
      return "Reorganizó la página principal";
    }
    case "health-monitor": {
      const alerts = jobActions.filter((a) => a.action_type === "flag").length;
      if (alerts === 0) return "Todo anda bien";
      return `Encontró ${alerts} ${alerts === 1 ? "problema" : "problemas"}`;
    }
    case "briefing-generator": {
      const count = jobActions.length;
      return `Escribió ${count} ${count === 1 ? "resumen" : "resúmenes"} de noticias`;
    }
    case "profile-researcher": {
      const created = jobActions.filter((a) => a.action_type === "create").length;
      const updated = jobActions.filter((a) => a.action_type === "update").length;
      const total = created + updated;
      return `Buscó info de ${total} ${total === 1 ? "candidato" : "candidatos"}`;
    }
    case "data-integrity": {
      const updates = jobActions.filter((a) => a.action_type === "update").length;
      const flags = jobActions.filter((a) => a.action_type === "flag").length;
      if (updates > 0 && flags > 0) return `Corrigió ${updates}, quedan ${flags} por revisar`;
      if (updates > 0) return `Corrigió ${updates} errores en los datos`;
      if (flags > 0) return `Encontró ${flags} datos dudosos`;
      return "Revisó que los datos estén bien";
    }
    case "news-curator": {
      const breaking = jobActions.filter((a) => a.action_type === "set_breaking").length;
      const deactivated = jobActions.filter((a) => a.action_type === "deactivate").length;
      if (breaking > 0 && deactivated > 0) return `${breaking} importantes, descartó ${deactivated}`;
      if (breaking > 0) return `Marcó ${breaking} como importantes`;
      if (deactivated > 0) return `Descartó ${deactivated} poco relevantes`;
      return "Leyó las noticias del día";
    }
    case "poll-verifier": {
      const flags = jobActions.filter((a) => a.action_type === "flag").length;
      if (flags === 0) return "Las encuestas están bien";
      return `${flags} encuestas con datos raros`;
    }
    default:
      return `Hizo ${jobActions.length} ${jobActions.length === 1 ? "cosa" : "cosas"}`;
  }
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
        title: "Destacó noticia importante",
        detail: description.replace(/^Set breaking.*?:\s*/, "").slice(0, 120),
      };
    }
    if (action_type === "deactivate") {
      const scoreMatch = description.match(/\((\d+)\/10\)/);
      return {
        emoji: "🗑️",
        title: "Descartó noticia poco relevante",
        detail: `Relevancia ${scoreMatch ? scoreMatch[1] : "baja"}/10 — ${description.replace(/^Deactivated.*?:\s*/, "").slice(0, 100)}`,
      };
    }
  }

  // ── Briefing Generator ──
  if (job === "briefing-generator") {
    return {
      emoji: "📰",
      title: "Escribió el resumen del día",
      detail: "Analizó las noticias más importantes y redactó el análisis editorial",
    };
  }

  // ── Health Monitor ──
  if (job === "health-monitor") {
    if (description.includes("[HEALTH")) {
      const msg = description.replace(/\[HEALTH (CRITICAL|WARNING)\]\s*/, "");
      const isCritical = description.includes("CRITICAL");
      return {
        emoji: isCritical ? "🔴" : "⚠️",
        title: isCritical ? "Algo está fallando" : "Algo necesita atención",
        detail: msg,
      };
    }
  }

  // ── Homepage Composer ──
  if (job === "homepage-composer") {
    if (action_type === "compose") {
      const blocksCount = after_value?.blocks_count
        ? String(after_value.blocks_count)
        : "";
      let reasoning = after_value?.reasoning
        ? String(after_value.reasoning).slice(0, 200)
        : description;
      reasoning = cleanBlockTypeNames(reasoning);
      return {
        emoji: "🧩",
        title: `Rediseñó la portada con ${blocksCount} secciones`,
        detail: reasoning,
      };
    }
    if (action_type === "create") {
      const blockTitle = description.replace(/^Bloque \w+:\s*/, "").slice(0, 60);
      const blockType = String(after_value?.block_type || "");
      return {
        emoji: "🧩",
        title: `Nuevo en portada: ${blockTitle}`,
        detail: blockTypeContext[blockType] || blockTitle,
      };
    }
    if (action_type === "deactivate") {
      const deactMatch = description.match(/(\d+)/);
      return {
        emoji: "♻️",
        title: "Quitó contenido anterior de la portada",
        detail: deactMatch ? `Se reemplazaron ${deactMatch[1]} bloques por contenido nuevo` : description,
      };
    }
  }

  // ── Poll Verifier ──
  if (job === "poll-verifier") {
    if (action_type === "flag") {
      return {
        emoji: "📊",
        title: "Detectó dato sospechoso en encuestas",
        detail: description,
      };
    }
    return {
      emoji: "📊",
      title: "Revisó encuestas",
      detail: description,
    };
  }

  // ── Profile Researcher ──
  if (job === "profile-researcher") {
    if (action_type === "create") {
      // Extract candidate name and confidence from description
      const profileMatch = description.match(/Created profile for (.+?) \(confidence: ([\d.]+)/);
      if (profileMatch) {
        const conf = parseFloat(profileMatch[2]);
        const confLabel = conf >= 0.7 ? "alta" : conf >= 0.4 ? "media" : "baja";
        return {
          emoji: "🔍",
          title: `Investigó perfil de ${profileMatch[1]}`,
          detail: `Compiló información verificable a partir de noticias (confianza ${confLabel})`,
        };
      }
      return {
        emoji: "🔍",
        title: "Investigó perfil de candidato",
        detail: description,
      };
    }
    if (action_type === "update") {
      const updateMatch = description.match(/Updated profile for (.+)/);
      return {
        emoji: "🔍",
        title: `Actualizó perfil de ${updateMatch ? updateMatch[1] : "candidato"}`,
        detail: "Encontró nueva información en noticias recientes",
      };
    }
  }

  // ── Site Auditor ──
  if (job === "site-auditor") {
    // Parse: "Site audit: 77/100 (good) — Content 62, Freshness 79, Quality 66, SEO 100. 1 critical, 1 warnings. Trend: stable (+0)"
    const auditMatch = description.match(
      /Site audit: (\d+)\/100 \((\w+)\) — Content (\d+), Freshness (\d+), Quality (\d+), SEO (\d+)/
    );
    if (auditMatch) {
      const statusMap: Record<string, string> = { excellent: "excelente", good: "bueno", fair: "regular", poor: "malo" };
      const status = statusMap[auditMatch[2]] || auditMatch[2];
      return {
        emoji: "👁️",
        title: "Auditoría completa del sitio",
        detail: `Salud general: ${auditMatch[1]}/100 (${status}). Contenido ${auditMatch[3]}, Frescura ${auditMatch[4]}, Calidad ${auditMatch[5]}, SEO ${auditMatch[6]}`,
      };
    }
    return {
      emoji: "👁️",
      title: "Auditoría completa del sitio",
      detail: description,
    };
  }

  // Fallback
  return {
    emoji: "🔧",
    title: action_type === "update" ? "Corrección automática" : action_type === "flag" ? "Necesita revisión" : description.slice(0, 50),
    detail: description.slice(0, 150),
  };
}

const jobLabels: Record<string, string> = {
  "data-integrity": "Datos",
  "poll-verifier": "Encuestas",
  "news-curator": "Noticias",
  "briefing-generator": "Resumen",
  "health-monitor": "Vigilancia",
  "homepage-composer": "Portada",
  "profile-researcher": "Candidatos",
  "site-auditor": "Web",
};

// Longer descriptions for sidebar
const jobDescriptions: Record<string, string> = {
  "site-auditor": "Revisa que la web funcione bien",
  "homepage-composer": "Arma la página principal",
  "health-monitor": "Vigila que todo siga funcionando",
  "briefing-generator": "Escribe el resumen diario",
  "profile-researcher": "Investiga info de candidatos",
  "data-integrity": "Revisa que los datos estén correctos",
  "news-curator": "Lee y filtra las noticias",
  "poll-verifier": "Verifica que las encuestas sean reales",
};

const jobColors: Record<string, string> = {
  "data-integrity": "text-violet-400 bg-violet-400/10 border-violet-400/20",
  "poll-verifier": "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "news-curator": "text-amber bg-amber/10 border-amber/20",
  "briefing-generator": "text-emerald bg-emerald/10 border-emerald/20",
  "health-monitor": "text-rose bg-rose/10 border-rose/20",
  "homepage-composer": "text-pink-400 bg-pink-400/10 border-pink-400/20",
  "profile-researcher": "text-orange-400 bg-orange-400/10 border-orange-400/20",
  "site-auditor": "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
};

const jobIcons: Record<string, typeof Brain> = {
  "data-integrity": Database,
  "poll-verifier": BarChart3,
  "news-curator": Newspaper,
  "briefing-generator": FileText,
  "health-monitor": Activity,
  "homepage-composer": LayoutGrid,
  "profile-researcher": Shield,
  "site-auditor": Eye,
};

const actionTypeConfig: Record<
  string,
  { label: string; className: string; icon: typeof Brain }
> = {
  update: {
    label: "Corregido",
    className: "text-emerald bg-emerald/10 border-emerald/20",
    icon: Pencil,
  },
  flag: {
    label: "Necesita revisión",
    className: "text-amber bg-amber/10 border-amber/20",
    icon: Flag,
  },
  set_breaking: {
    label: "Urgente",
    className: "text-rose bg-rose/10 border-rose/20",
    icon: Zap,
  },
  deactivate: {
    label: "Removido",
    className: "text-red-400 bg-red-400/10 border-red-400/20",
    icon: Trash2,
  },
  create: {
    label: "Nuevo",
    className: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
    icon: FileText,
  },
  compose: {
    label: "Diseñado",
    className: "text-pink-400 bg-pink-400/10 border-pink-400/20",
    icon: LayoutGrid,
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
// BRAIN CHANGELOG — Non-technical update log
// =============================================================================

const BRAIN_CHANGELOG: Array<{
  date: string;
  version: string;
  title: string;
  description: string;
}> = [
  {
    date: "7 Mar 2026",
    version: "v1.3",
    title: "El Brain ahora audita todo el sitio",
    description:
      "Cada dia, el Brain revisa que todas las paginas funcionen, que los candidatos tengan datos completos (bio, foto, perfil, encuestas, noticias), que las fuentes de noticias sean diversas, y que el SEO este al 100%. Te muestra un score de 0-100 en 4 categorias y te dice exactamente que arreglar. Ademas, compara con el dia anterior para ver si las cosas mejoran o empeoran.",
  },
  {
    date: "7 Mar 2026",
    version: "v1.2",
    title: "El Brain ahora tiene memoria",
    description:
      "Antes, cada vez que el Brain se ejecutaba, empezaba de cero sin recordar lo que hizo ayer. Ahora recuerda sus acciones de los últimos 14 días. Si ya sugirió un cambio y no se aplicó, no vuelve a insistir. Las alertas de encuestas ya no se repiten día tras día. Y si un candidato no tiene noticias, no pierde tiempo creando un perfil vacío.",
  },
  {
    date: "6 Mar 2026",
    version: "v1.1",
    title: "SEO y accesibilidad al 100%",
    description:
      "Se corrigió que todas las URLs apuntaran a www.condorlatam.com (antes algunas iban sin www, lo que confundía a Google). Se mejoró el contraste de colores para personas con dificultad visual y se agregó soporte de JSON-LD para Colombia.",
  },
  {
    date: "28 Feb 2026",
    version: "v1.0",
    title: "Lanzamiento del Brain",
    description:
      "Primera versión del cerebro autónomo de CONDOR. 7 trabajos diarios: verificar datos de candidatos, auditar encuestas, curar noticias, generar el resumen del día, investigar perfiles, monitorear la salud del sistema y componer la homepage.",
  },
];

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

      {/* ── Changelog ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.02 }}
      >
        <BrainChangelog />
      </motion.div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <KPICard
          title="Veces que corrió"
          value={data.stats.totalRuns}
          subtitle={`${data.stats.actionsToday} cosas hizo hoy`}
          icon={Activity}
          color="indigo"
          delay={0.05}
        />
        <KPICard
          title="Datos corregidos"
          value={data.stats.totalUpdates}
          subtitle="errores que arregló solo"
          icon={CheckCircle2}
          color="emerald"
          delay={0.1}
        />
        <KPICard
          title="Encuestas nuevas"
          value={data.stats.pollsInserted}
          subtitle={`${data.stats.pollsRejected} descartadas`}
          icon={CheckCircle2}
          color="emerald"
          delay={0.13}
        />
        <KPICard
          title="Necesita tu ayuda"
          value={data.stats.totalFlags}
          subtitle="cosas que no pudo resolver"
          icon={AlertTriangle}
          color="amber"
          delay={0.15}
        />
        <KPICard
          title="Noticias urgentes"
          value={data.stats.totalBreaking}
          subtitle="marcadas como importantes"
          icon={Zap}
          color="rose"
          delay={0.2}
        />
        <KPICard
          title="Resúmenes"
          value={data.stats.totalBriefings}
          subtitle="análisis editoriales"
          icon={FileText}
          color="sky"
          delay={0.25}
        />
      </div>

      {/* ── Site Audit ── */}
      {data.siteAudit && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
        >
          <SiteAuditSection audit={data.siteAudit} />
        </motion.div>
      )}

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
              Están funcionando los sistemas?
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
                En qué trabajó
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(data.actionsByJob).length > 0 ? (
                Object.entries(data.actionsByJob).map(([job]) => {
                  const Icon = jobIcons[job] || Brain;
                  const insight = getJobInsight(job, data.actions);
                  return (
                    <div key={job} className="flex items-start gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted/30 transition-colors">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium text-foreground">
                          {jobDescriptions[job] || jobLabels[job] || job}
                        </span>
                        <p className="text-[11px] text-muted-foreground">
                          {insight}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground">El Brain no ha trabajado esta semana</p>
              )}

              {/* Recent runs */}
              <div className="pt-2 border-t border-border">
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                  Historial reciente
                </p>
                <div className="space-y-1.5">
                  {data.recentRuns.slice(0, 5).map((run) => {
                    const runJobs = [...new Set(
                      data.actions
                        .filter((a) => a.run_id === run.runId)
                        .map((a) => jobLabels[a.job] || a.job)
                    )];
                    const jobSummary = runJobs.length > 3
                      ? runJobs.slice(0, 3).join(", ") + "..."
                      : runJobs.join(", ");
                    return (
                      <div
                        key={run.runId}
                        className="flex items-center justify-between text-[11px] gap-2"
                      >
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {timeAgo(run.createdAt)}
                          </span>
                        </div>
                        <span className="text-foreground text-right truncate">
                          {jobSummary || `${run.actionsCount} acciones`}
                        </span>
                      </div>
                    );
                  })}
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

      {/* ── Homepage Blocks ── */}
      {data.homepageBlocks.length > 0 && (
        <HomepageBlocksSection blocks={data.homepageBlocks} actions={data.actions} />
      )}

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
              Todo lo que hizo el Brain
              <Badge
                variant="outline"
                className="text-[10px] font-mono ml-auto"
              >
                {data.totalActions} acciones en total
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
                          — {(() => {
                            const jobs = [...new Set(run.actions.map((a: { job: string }) => jobLabels[a.job] || a.job))];
                            return jobs.length > 3 ? jobs.slice(0, 3).join(", ") + "..." : jobs.join(", ");
                          })()}
                        </span>
                      </div>

                      {/* Grouped insights */}
                      <div className="ml-3 border-l-2 border-border pl-4 space-y-1.5">
                        {groupRunIntoInsights(run.actions).map((insight, i) => (
                          <div
                            key={`${run.runId}-${insight.job}-${i}`}
                            className="flex items-start gap-2 rounded-lg px-3 py-2 hover:bg-muted/30 transition-colors"
                          >
                            <span className="text-sm mt-0.5 shrink-0">
                              {insight.emoji}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-medium text-foreground">
                                  {insight.title}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[9px] font-mono px-1.5 py-0",
                                    jobColors[insight.job] || ""
                                  )}
                                >
                                  {jobLabels[insight.job] || insight.job}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {insight.detail}
                              </p>
                            </div>
                          </div>
                        ))}
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
                  El Brain aún no ha hecho nada.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Corre automáticamente todos los días a la 1 PM.
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
                Resúmenes de días anteriores
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

// =============================================================================
// SITE AUDIT SECTION
// =============================================================================

function ScoreCircle({
  score,
  label,
  size = "sm",
}: {
  score: number;
  label: string;
  size?: "sm" | "lg";
}) {
  const color =
    score >= 80
      ? "text-emerald border-emerald/30"
      : score >= 50
        ? "text-amber border-amber/30"
        : "text-rose border-rose/30";
  const bgColor =
    score >= 80 ? "bg-emerald/10" : score >= 50 ? "bg-amber/10" : "bg-rose/10";

  if (size === "lg") {
    return (
      <div className="flex flex-col items-center gap-1">
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full border-2",
            color,
            bgColor
          )}
        >
          <span className="text-xl font-bold font-mono tabular-nums">{score}</span>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border",
          color,
          bgColor
        )}
      >
        <span className="text-sm font-bold font-mono tabular-nums">{score}</span>
      </div>
      <span className="text-[9px] font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

function SiteAuditSection({
  audit,
}: {
  audit: NonNullable<BrainData["siteAudit"]>;
}) {
  const [showFindings, setShowFindings] = useState(false);
  const [showWeakest, setShowWeakest] = useState(false);

  const report = audit.report as {
    content?: { weakest_candidates?: Array<{ name: string; missing: string[] }>; zero_coverage?: string[] };
    actionable_findings?: Array<{ severity: string; category: string; message: string; action: string }>;
    trends?: { biggest_changes?: Array<{ category: string; delta: number }> };
  } | null;

  const findings = report?.actionable_findings || [];
  const weakest = report?.content?.weakest_candidates || [];
  const criticalCount = findings.filter((f) => f.severity === "critical").length;
  const warningCount = findings.filter((f) => f.severity === "warning").length;

  const statusLabel: Record<string, string> = {
    excellent: "Excelente",
    good: "Bueno",
    fair: "Regular",
    poor: "Pobre",
  };
  const statusColor: Record<string, string> = {
    excellent: "text-emerald border-emerald/30 bg-emerald/10",
    good: "text-emerald border-emerald/30 bg-emerald/10",
    fair: "text-amber border-amber/30 bg-amber/10",
    poor: "text-rose border-rose/30 bg-rose/10",
  };

  const trendIcon =
    audit.trend_direction === "improving"
      ? "↑"
      : audit.trend_direction === "degrading"
        ? "↓"
        : "→";
  const trendColor =
    audit.trend_direction === "improving"
      ? "text-emerald"
      : audit.trend_direction === "degrading"
        ? "text-rose"
        : "text-muted-foreground";

  const missingLabels: Record<string, string> = {
    bio: "Bio",
    photo: "Foto",
    profile: "Perfil",
    polls: "Encuestas",
    news: "Noticias",
  };

  return (
    <Card className="border-cyan-400/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Eye className="h-3.5 w-3.5 text-cyan-400" />
          Salud del sitio
          <Badge
            variant="outline"
            className={cn("text-[10px] font-mono ml-auto", statusColor[audit.overall_status] || "")}
          >
            {statusLabel[audit.overall_status] || audit.overall_status}
          </Badge>
          {audit.trend_direction && (
            <span className={cn("text-xs font-mono font-bold", trendColor)}>
              {trendIcon}
              {audit.trend_delta !== 0 && (
                <span className="ml-0.5">
                  {audit.trend_delta > 0 ? "+" : ""}
                  {audit.trend_delta}
                </span>
              )}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Score circles */}
          <div className="flex items-center justify-around">
            <ScoreCircle score={audit.overall_score} label="General" size="lg" />
            <div className="flex gap-4">
              <ScoreCircle score={audit.content_score} label="Contenido" />
              <ScoreCircle score={audit.freshness_score} label="Frescura" />
              <ScoreCircle score={audit.quality_score} label="Calidad" />
              <ScoreCircle score={audit.seo_score} label="SEO" />
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
            <span>{audit.audit_date}</span>
            <span>
              {criticalCount > 0 && (
                <span className="text-rose mr-2">{criticalCount} problema{criticalCount !== 1 && "s"} grave{criticalCount !== 1 && "s"}</span>
              )}
              {warningCount > 0 && (
                <span className="text-amber">{warningCount} cosa{warningCount !== 1 && "s"} por mejorar</span>
              )}
              {criticalCount === 0 && warningCount === 0 && (
                <span className="text-emerald">Todo bien</span>
              )}
            </span>
          </div>

          {/* Actionable findings */}
          {findings.length > 0 && (
            <div>
              <button
                onClick={() => setShowFindings(!showFindings)}
                className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {showFindings ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
                {showFindings
                  ? "Ocultar detalles"
                  : `Ver qué encontró (${findings.length})`}
              </button>

              {showFindings && (
                <div className="mt-2 space-y-1.5">
                  {findings.map((f, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-start gap-2 text-xs rounded-lg px-2.5 py-1.5 border",
                        f.severity === "critical"
                          ? "bg-rose/5 border-rose/20 text-rose"
                          : f.severity === "warning"
                            ? "bg-amber/5 border-amber/20 text-amber"
                            : "bg-emerald/5 border-emerald/20 text-emerald"
                      )}
                    >
                      <span className="shrink-0 mt-0.5">
                        {f.severity === "critical" ? (
                          <XCircle className="h-3 w-3" />
                        ) : f.severity === "warning" ? (
                          <AlertTriangle className="h-3 w-3" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{f.message}</p>
                        <p className="text-[10px] opacity-70 mt-0.5">{f.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Weakest candidates */}
          {weakest.length > 0 && (
            <div>
              <button
                onClick={() => setShowWeakest(!showWeakest)}
                className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {showWeakest ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
                {showWeakest
                  ? "Ocultar candidatos"
                  : `${weakest.length} candidatos con datos incompletos`}
              </button>

              {showWeakest && (
                <div className="mt-2 space-y-1">
                  {weakest.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs rounded-lg border border-border px-2.5 py-1.5"
                    >
                      <span className="font-medium text-foreground truncate flex-1">
                        {c.name}
                      </span>
                      <div className="flex gap-1 shrink-0">
                        {c.missing.map((m) => (
                          <Badge
                            key={m}
                            variant="outline"
                            className="text-[9px] font-mono text-rose border-rose/30 px-1 py-0"
                          >
                            {missingLabels[m] || m}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// BRAIN CHANGELOG COMPONENT
// =============================================================================

function BrainChangelog() {
  const [expanded, setExpanded] = useState(false);
  const latest = BRAIN_CHANGELOG[0];
  const older = BRAIN_CHANGELOG.slice(1);

  return (
    <Card className="border-violet-500/20 bg-violet-500/5">
      <CardContent className="pt-4 pb-3">
        {/* Latest update — always visible */}
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/10">
            <Sparkles className="h-4 w-4 text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-foreground">
                {latest.title}
              </span>
              <Badge
                variant="outline"
                className="text-[9px] font-mono text-violet-400 border-violet-400/30"
              >
                {latest.version}
              </Badge>
              <span className="text-[10px] text-muted-foreground">
                {latest.date}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              {latest.description}
            </p>
          </div>
        </div>

        {/* Older updates — collapsible */}
        {older.length > 0 && (
          <div className="mt-2 ml-11">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300 transition-colors"
            >
              {expanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              {expanded ? "Ocultar" : `${older.length} actualizaciones anteriores`}
            </button>

            {expanded && (
              <div className="mt-2 space-y-3">
                {older.map((entry) => (
                  <div key={entry.version} className="flex items-start gap-2">
                    <Badge
                      variant="outline"
                      className="text-[9px] font-mono text-muted-foreground shrink-0 mt-0.5"
                    >
                      {entry.version}
                    </Badge>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-foreground">
                          {entry.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {entry.date}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                        {entry.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// HOMEPAGE BLOCKS SECTION
// =============================================================================

const blockTypeEmoji: Record<string, string> = {
  poll_shift: "📊",
  breaking_news: "🔴",
  fact_check_alert: "🛡️",
  trending_candidate: "👤",
  editorial_highlight: "✨",
  engagement_cta: "⚡",
};

const blockTypeLabel: Record<string, string> = {
  poll_shift: "Encuesta",
  breaking_news: "Urgente",
  fact_check_alert: "Verificación",
  trending_candidate: "Tendencia",
  editorial_highlight: "Análisis",
  engagement_cta: "Participa",
};

function HomepageBlocksSection({
  blocks,
  actions,
}: {
  blocks: BrainData["homepageBlocks"];
  actions: BrainData["actions"];
}) {
  const [showHistory, setShowHistory] = useState(false);

  const activeBlocks = blocks.filter((b) => b.is_active);
  const inactiveBlocks = blocks.filter((b) => !b.is_active);

  // Find the latest compose action's reasoning
  const composeAction = actions.find(
    (a) => a.job === "homepage-composer" && a.action_type === "compose"
  );
  const reasoning = composeAction?.after_value?.reasoning
    ? cleanBlockTypeNames(String(composeAction.after_value.reasoning))
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.38 }}
    >
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <LayoutGrid className="h-3.5 w-3.5" />
            Portada del sitio
            <Badge
              variant="outline"
              className="text-[10px] font-mono ml-auto"
            >
              {activeBlocks.length} activos
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* AI Reasoning */}
          {reasoning && (
            <div className="rounded-lg border border-pink-400/20 bg-pink-400/5 p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="h-3 w-3 text-pink-400" />
                <span className="text-[9px] font-mono uppercase tracking-wider text-pink-400">
                  Por qué eligió estos bloques
                </span>
              </div>
              <p className="text-xs text-foreground leading-relaxed">
                {reasoning}
              </p>
            </div>
          )}

          {/* Active Blocks */}
          {activeBlocks.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Lo que se muestra hoy en la portada
              </p>
              {activeBlocks
                .sort((a, b) => a.position - b.position)
                .map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
                  >
                    <span className="text-sm shrink-0">
                      {blockTypeEmoji[block.block_type] || "🧩"}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[9px] font-mono px-1.5 py-0 shrink-0 text-pink-400 border-pink-400/30"
                    >
                      {blockTypeLabel[block.block_type] || block.block_type}
                    </Badge>
                    <span className="text-xs text-foreground truncate flex-1">
                      {block.title}
                    </span>
                    <span className="text-[11px] font-mono tabular-nums text-muted-foreground shrink-0">
                      {block.click_count}{" "}
                      {block.click_count === 1 ? "click" : "clicks"}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Aún no hay contenido en la portada.
            </p>
          )}

          {/* History Toggle */}
          {inactiveBlocks.length > 0 && (
            <div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                {showHistory ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
                {showHistory
                  ? "Ocultar historial"
                  : `Ver ${inactiveBlocks.length} bloques que ya no se muestran`}
              </button>

              {showHistory && (
                <div className="mt-2 space-y-1.5">
                  {inactiveBlocks.map((block) => (
                    <div
                      key={block.id}
                      className="flex items-center gap-2 rounded-lg px-3 py-1.5 opacity-50"
                    >
                      <span className="text-sm shrink-0">
                        {blockTypeEmoji[block.block_type] || "🧩"}
                      </span>
                      <span className="text-[11px] text-foreground truncate flex-1">
                        {block.title}
                      </span>
                      <span className="text-[10px] font-mono tabular-nums text-muted-foreground shrink-0">
                        {block.click_count} clicks
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatDate(block.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
