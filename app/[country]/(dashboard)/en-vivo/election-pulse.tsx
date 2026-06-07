"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  AlertTriangle,
  ShieldAlert,
  Megaphone,
  Timer,
  ExternalLink,
  Sparkles,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountry } from "@/lib/config/country-context";
import type { NewsArticle } from "@/lib/data/news";
import type { FactCheck } from "@/lib/data/fact-checks";
import type { PublicBriefing } from "../page";

interface ElectionPulseProps {
  articles: NewsArticle[];
  factChecks: FactCheck[];
  briefing: PublicBriefing | null;
}

interface PulseSection {
  id: string;
  icon: React.ReactNode;
  title: string;
  question: string;
  color: string;
  bgColor: string;
  borderColor: string;
  insights: PulseInsight[];
}

interface PulseInsight {
  text: string;
  source?: string;
  sourceUrl?: string;
  type: "info" | "alert" | "positive";
}

// Keywords for categorizing articles into election day themes
const PARTICIPATION_KEYWORDS = ["cola", "fila", "votación", "participación", "mesa", "electoral", "local de votación", "electores", "voto", "votar", "urna", "padrón", "miembro de mesa", "acta"];
const IRREGULARITY_KEYWORDS = ["irregularidad", "denuncia", "incidente", "problema", "falta", "material", "compra de voto", "fraude", "anulación", "impugnación", "queja", "reclamo"];
const DISINFO_KEYWORDS = ["falso", "engañoso", "desinformación", "fake", "bulo", "verificación", "desmentir", "mentira", "rumor"];
const CANDIDATE_KEYWORDS = ["candidato", "votó", "declaró", "dijo", "señaló", "afirmó", "campaña", "cierre"];
const RESULTS_KEYWORDS = ["resultado", "conteo", "boca de urna", "flash electoral", "ONPE", "Registraduría", "registraduria", "preconteo", "actas", "escrutinio", "conteo rápido", "proyección"];

function matchesCategory(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function ElectionPulse({ articles, factChecks, briefing }: ElectionPulseProps) {
  const country = useCountry();

  const sections = useMemo(() => {
    // Categorize articles
    const participation: NewsArticle[] = [];
    const irregularities: NewsArticle[] = [];
    const disinfo: NewsArticle[] = [];
    const candidates: NewsArticle[] = [];
    const results: NewsArticle[] = [];

    for (const article of articles) {
      const text = `${article.title} ${article.summary || ""}`;
      if (matchesCategory(text, RESULTS_KEYWORDS)) results.push(article);
      else if (matchesCategory(text, IRREGULARITY_KEYWORDS)) irregularities.push(article);
      else if (matchesCategory(text, DISINFO_KEYWORDS)) disinfo.push(article);
      else if (matchesCategory(text, CANDIDATE_KEYWORDS)) candidates.push(article);
      else if (matchesCategory(text, PARTICIPATION_KEYWORDS)) participation.push(article);
    }

    // False/misleading fact checks
    const falseChecks = factChecks.filter(
      (fc) => fc.verdict === "FALSO" || fc.verdict === "ENGANOSO"
    );

    // AI-generated insights from briefing key_takeaways (5 in order)
    // Fallback to article-based insights if briefing not available
    const aiInsights = briefing?.top_stories
      ? [] // will use key_takeaways below
      : [];

    // key_takeaways from the brain — can be string[] (old) or {insight, sources}[] (new)
    const rawKt = briefing?.key_takeaways;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kt: { insight: string; sources: string[] }[] | undefined = rawKt?.map((item: any) => {
      if (typeof item === "string") return { insight: item, sources: [] };
      return { insight: item.insight || "", sources: item.sources || [] };
    });

    // Build article lookup by title for matching sources to URLs
    const articleByTitle = new Map<string, NewsArticle>();
    for (const a of articles) {
      articleByTitle.set(a.title, a);
      // Also match by partial title (first 50 chars)
      if (a.title.length > 50) articleByTitle.set(a.title.slice(0, 50), a);
    }

    const sectionDefs = [
      { id: "participacion", icon: <Users className="h-5 w-5" />, title: "Participación", question: "¿Cómo va la votación?", color: "text-foreground", bgColor: "bg-muted/30", borderColor: "border-border", fallback: participation, fallbackType: "info" as const },
      { id: "irregularidades", icon: <AlertTriangle className="h-5 w-5" />, title: "Irregularidades", question: "¿Qué incidentes se reportan?", color: "text-foreground", bgColor: "bg-muted/30", borderColor: "border-border", fallback: irregularities, fallbackType: "alert" as const },
      { id: "desinformacion", icon: <ShieldAlert className="h-5 w-5" />, title: "Desinformación", question: "¿Qué es falso?", color: "text-foreground", bgColor: "bg-muted/30", borderColor: "border-border", fallback: disinfo, fallbackType: "alert" as const },
      { id: "candidatos", icon: <Megaphone className="h-5 w-5" />, title: "Candidatos", question: "¿Qué dicen los candidatos?", color: "text-foreground", bgColor: "bg-muted/30", borderColor: "border-border", fallback: candidates, fallbackType: "info" as const },
      { id: "resultados", icon: <Timer className="h-5 w-5" />, title: "Resultados", question: "¿Cuándo se sabe quién ganó?", color: "text-foreground", bgColor: "bg-muted/30", borderColor: "border-border", fallback: results, fallbackType: "info" as const },
    ];

    const result: PulseSection[] = sectionDefs.map((def, i) => {
      // Use AI insight if available
      const aiItem = kt && kt[i] ? kt[i] : null;

      let insight: PulseInsight;
      if (aiItem && aiItem.insight && aiItem.insight !== "Pendiente de reporte") {
        // Match sources to article URLs
        const matchedSources: { name: string; url?: string }[] = [];
        for (const srcTitle of aiItem.sources) {
          const exact = articleByTitle.get(srcTitle);
          if (exact) {
            matchedSources.push({ name: exact.source, url: exact.sourceUrl });
          } else {
            const partial = articles.find((a) => a.title.startsWith(srcTitle.slice(0, 40)));
            if (partial) matchedSources.push({ name: partial.source, url: partial.sourceUrl });
          }
        }
        // If AI generated insight but has NO matched source → show as "Pendiente de reporte"
        if (matchedSources.length === 0 && aiItem.sources.length === 0) {
          insight = { text: "Pendiente de reporte", type: "info" };
        } else {
          insight = {
            text: aiItem.insight,
            type: def.fallbackType,
            source: matchedSources.length > 0 ? matchedSources[0].name : undefined,
            sourceUrl: matchedSources.length > 0 ? matchedSources[0].url : undefined,
          };
          (insight as PulseInsight & { extraSources?: { name: string; url?: string }[] }).extraSources = matchedSources.slice(1);
        }
      } else if (aiItem && aiItem.insight === "Pendiente de reporte") {
        insight = { text: "Pendiente de reporte", type: "info" };
      } else if (def.fallback.length > 0) {
        insight = { text: truncate(stripSource(def.fallback[0].title), 80), source: def.fallback[0].source, sourceUrl: def.fallback[0].sourceUrl, type: def.fallbackType };
      } else if (def.id === "resultados") {
        insight = buildResultsTimeline(country.code, country.timezone)[0];
      } else if (def.id === "irregularidades") {
        insight = { text: "Sin incidentes reportados.", type: "positive" };
      } else if (def.id === "desinformacion") {
        insight = { text: "Sin desinformación activa.", type: "positive" };
      } else {
        insight = { text: "Monitoreando...", type: "info" };
      }

      return { ...def, insights: [insight] };
    });

    return result;
  }, [articles, factChecks]);

  // AI briefing summary — skip if it talks about polls (stale data)
  const briefingSummary = briefing?.editorial_summary?.trim() || "";
  const briefingAge = briefing?._ageHours ?? 0;
  const pollWords = ["encuesta", "puntos porcentual", "17.1%", "poll", "incremento de", "alcanzando el"];
  const isStaleBriefing = pollWords.some((w) => briefingSummary.toLowerCase().includes(w))
    || briefingSummary === "Análisis en vivo contundente con datos específicos.";

  // Take only first 2 sentences max
  const briefingShort = briefingSummary
    .split(/(?<=\.)\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join(" ");

  return (
    <div className="space-y-4">
      {/* AI editorial summary removed — the 5 insight cards are enough */}

      {/* 5 Election Day Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.4 }}
            className={cn(
              "rounded-xl border overflow-hidden",
              section.borderColor,
              // Make first 2 cards span full width on sm
              index < 2 && "sm:col-span-1",
              // Last card spans full on odd count
              index === sections.length - 1 && sections.length % 3 === 1 && "lg:col-span-1"
            )}
          >
            {/* Section header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
              <div className="text-muted-foreground">{section.icon}</div>
              <div>
                <h3 className="text-sm font-bold text-foreground">{section.title}</h3>
                <p className="text-[11px] text-muted-foreground">{section.question}</p>
              </div>
            </div>

            {/* Insight */}
            <div className="px-4 py-3 bg-card">
              {section.insights.map((insight, i) => (
                <div key={i}>
                  <p className={cn(
                    "text-xs leading-snug",
                    insight.text === "Pendiente de reporte" || insight.text === "Monitoreando..."
                      ? "text-muted-foreground/50 italic"
                      : insight.type === "alert" ? "text-foreground font-medium" : "text-muted-foreground"
                  )}>
                    {insight.text}
                  </p>
                  {insight.source && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                      {insight.sourceUrl ? (
                        <a href={insight.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline inline-flex items-center gap-0.5 font-medium">
                          {insight.source} <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/60">{insight.source}</span>
                      )}
                      {/* Extra sources */}
                      {((insight as PulseInsight & { extraSources?: { name: string; url?: string }[] }).extraSources || []).map((src, j) => (
                        src.url ? (
                          <a key={j} href={src.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline inline-flex items-center gap-0.5 font-medium">
                            {src.name} <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        ) : (
                          <span key={j} className="text-[10px] text-muted-foreground/60">{src.name}</span>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* AI badge */}
            <div className="px-4 py-1.5 border-t border-border/30 bg-muted/20 flex items-center gap-1.5">
              <Sparkles className="h-2.5 w-2.5 text-primary/50" />
              <span className="text-[9px] text-muted-foreground/50 font-mono">curado por CONDOR AI</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Helpers

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 3) + "..." : s;
}

function stripSource(title: string): string {
  return title.replace(/\s*[-–—]\s*[A-ZÁ-Ú][a-záéíóú\s]+$/, "").trim();
}

function buildInsights(articles: NewsArticle[], max: number, type: PulseInsight["type"]): PulseInsight[] {
  return articles.slice(0, max).map((a) => {
    // Truncate title — remove source suffix like "- RPP", "- Infobae"
    let title = a.title.replace(/\s*[-–—]\s*[A-ZÁ-Ú][a-záéíóú\s]+$/, "").trim();
    if (title.length > 80) title = title.slice(0, 77) + "...";
    return {
      text: title,
      source: a.source,
      sourceUrl: a.sourceUrl,
      type,
    };
  });
}

// Horarios reales del día E por país (hora local).
// Colombia: mesas 8:00 a.m. → 4:00 p.m.; preconteo Registraduría arranca al cierre.
// Perú: mesas 8:00 a.m. → 5:00 p.m.; boca de urna 6–7 p.m., conteo ONPE 8 p.m.+
function buildResultsTimeline(countryCode: string, timezone: string): PulseInsight[] {
  const now = new Date();
  const localHour = parseInt(
    now.toLocaleString("en-US", { timeZone: timezone, hour: "numeric", hour12: false })
  );

  if (countryCode === "co") {
    // Colombia
    const authority = "Registraduría";
    if (localHour < 16) {
      return [
        { text: "Los puestos de votación cierran a las 4:00 p.m. hora colombiana.", type: "info" },
        { text: "Sondeos a pie de urna: a partir del cierre de mesas.", type: "info" },
        { text: `Preconteo ${authority}: primeros boletines apenas terminen los escrutinios de cada mesa.`, type: "info" },
      ];
    } else if (localHour < 17) {
      return [
        { text: "Mesas cerrando — los jurados inician el escrutinio en cada puesto.", type: "alert" },
        { text: "Sondeos a pie de urna: en cualquier momento.", type: "info" },
        { text: `Preconteo ${authority}: primeros boletines en la próxima hora.`, type: "info" },
      ];
    } else if (localHour < 20) {
      return [
        { text: `Preconteo ${authority} en curso — boletines cada pocos minutos.`, type: "alert" },
        { text: "El preconteo es informativo; el escrutinio oficial puede tardar varios días.", type: "info" },
      ];
    } else {
      return [
        { text: `${authority} publicando boletines de preconteo — resultados parciales en tiempo real.`, type: "alert" },
        { text: "Escrutinio oficial (E-14) continuará en los días siguientes.", type: "info" },
      ];
    }
  }

  // Perú (default)
  const authority = "ONPE";
  if (localHour < 16) {
    return [
      { text: "Las mesas cierran a las 5:00 p.m. hora peruana.", type: "info" },
      { text: "Resultados a boca de urna: entre 6:00 y 7:00 p.m.", type: "info" },
      { text: `Conteo rápido ${authority}: a partir de las 8:00 p.m.`, type: "info" },
    ];
  } else if (localHour < 18) {
    return [
      { text: "Mesas cerrando — el conteo inicia al cierre de cada mesa.", type: "alert" },
      { text: "Resultados a boca de urna: entre 6:00 y 7:00 p.m.", type: "info" },
      { text: `Conteo rápido ${authority}: a partir de las 8:00 p.m.`, type: "info" },
    ];
  } else if (localHour < 20) {
    return [
      { text: "Se esperan resultados a boca de urna en cualquier momento.", type: "alert" },
      { text: `Conteo rápido ${authority}: a partir de las 8:00 p.m.`, type: "info" },
    ];
  } else {
    return [
      { text: `Conteo oficial en curso — resultados parciales en ${authority}.`, type: "alert" },
      { text: "Resultados definitivos pueden tomar varios días.", type: "info" },
    ];
  }
}
