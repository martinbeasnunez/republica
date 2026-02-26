"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Check,
  Minus,
  Shield,
  TrendingUp,
  Heart,
  GraduationCap,
  Leaf,
  Scale,
  Building2,
  Cpu,
  Lightbulb,
  AlertTriangle,
  User,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  CATEGORIES_LABELS,
  IDEOLOGY_LABELS,
  type Candidate,
  type Category,
} from "@/lib/data/candidates";
import { cn } from "@/lib/utils";
import { useCountry } from "@/lib/config/country-context";

const ELECTORAL_AUTHORITY: Record<string, string> = { pe: "JNE", co: "CNE" };

const CATEGORY_ICONS: Record<Category, typeof Shield> = {
  economia: TrendingUp,
  seguridad: Shield,
  salud: Heart,
  educacion: GraduationCap,
  "medio-ambiente": Leaf,
  anticorrupcion: Scale,
  infraestructura: Building2,
  tecnologia: Cpu,
};

const ALL_CATEGORIES: Category[] = [
  "economia",
  "seguridad",
  "salud",
  "educacion",
  "medio-ambiente",
  "anticorrupcion",
  "infraestructura",
  "tecnologia",
];

// ─── INSIGHTS ENGINE ───

interface CategoryInsight {
  pattern: string;
  detail: string;
  type: "convergence" | "divergence" | "gap" | "highlight";
}

function generateInsights(selected: Candidate[]): CategoryInsight[] {
  if (selected.length < 2) return [];
  const insights: CategoryInsight[] = [];

  ALL_CATEGORIES.forEach((cat) => {
    const withProp = selected.filter((c) =>
      c.keyProposals.some((p) => p.category === cat)
    );
    const without = selected.filter(
      (c) => !c.keyProposals.some((p) => p.category === cat)
    );

    if (without.length > 0 && withProp.length > 0) {
      insights.push({
        pattern: `${without.map((c) => c.shortName).join(", ")} no ${without.length === 1 ? "presenta" : "presentan"} propuestas en ${CATEGORIES_LABELS[cat].es}`,
        detail: `Solo ${withProp.map((c) => c.shortName).join(", ")} ${withProp.length === 1 ? "aborda" : "abordan"} este tema`,
        type: "gap",
      });
    }
    if (withProp.length === selected.length && selected.length >= 2) {
      insights.push({
        pattern: `Todos proponen sobre ${CATEGORIES_LABELS[cat].es}`,
        detail: "Compara las diferencias de enfoque abajo",
        type: "convergence",
      });
    }
  });

  const ideologies = new Set(selected.map((c) => c.ideology));
  if (ideologies.size === selected.length && selected.length >= 2) {
    insights.push({
      pattern: "Espectro ideológico amplio",
      detail: selected.map((c) => IDEOLOGY_LABELS[c.ideology].es).join(" → "),
      type: "divergence",
    });
  }

  const coverage = selected.map((c) => ({
    name: c.shortName,
    count: new Set(c.keyProposals.map((p) => p.category)).size,
  }));
  const max = coverage.reduce((a, b) => (a.count > b.count ? a : b));
  const min = coverage.reduce((a, b) => (a.count < b.count ? a : b));
  if (max.count !== min.count) {
    insights.push({
      pattern: `${max.name} cubre ${max.count} temas vs ${min.name} con ${min.count}`,
      detail: "Más temas no significa mejor plan — evalúa profundidad y viabilidad",
      type: "highlight",
    });
  }

  return insights;
}

// ─── COVERAGE HEATMAP ROW ───

function CoverageHeatmap({ selected }: { selected: Candidate[] }) {
  const totalCats = ALL_CATEGORIES.length;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border bg-muted/30">
        <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          Cobertura temática
        </p>
      </div>
      <div className="p-3">
        <div className="space-y-2">
          {selected.map((c) => {
            const covered = ALL_CATEGORIES.filter((cat) =>
              c.keyProposals.some((p) => p.category === cat)
            );
            return (
              <div key={c.id} className="flex items-center gap-3">
                <div className="w-20 flex items-center gap-2 flex-shrink-0">
                  <div
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: c.partyColor }}
                  />
                  <span className="text-[11px] font-medium text-foreground truncate">
                    {c.shortName}
                  </span>
                </div>
                <div className="flex-1 flex gap-1">
                  {ALL_CATEGORIES.map((cat) => {
                    const has = covered.some((cc) => cc === cat);
                    return (
                      <div
                        key={cat}
                        className="flex-1 h-6 rounded-sm flex items-center justify-center transition-all"
                        style={{
                          backgroundColor: has ? c.partyColor + "20" : undefined,
                          border: has ? `1px solid ${c.partyColor}40` : "1px solid var(--border)",
                        }}
                        title={`${c.shortName}: ${CATEGORIES_LABELS[cat].es} — ${has ? "Tiene propuesta" : "Sin propuesta"}`}
                      >
                        {has ? (
                          <Check className="h-3 w-3" style={{ color: c.partyColor }} />
                        ) : (
                          <Minus className="h-2.5 w-2.5 text-muted-foreground/30" />
                        )}
                      </div>
                    );
                  })}
                </div>
                <span className="text-[10px] font-mono tabular-nums text-muted-foreground w-8 text-right">
                  {covered.length}/{totalCats}
                </span>
              </div>
            );
          })}
        </div>
        {/* Category labels */}
        <div className="flex gap-1 mt-1.5 ml-[92px] mr-[32px]">
          {ALL_CATEGORIES.map((cat) => {
            const CatIcon = CATEGORY_ICONS[cat];
            return (
              <div key={cat} className="flex-1 flex justify-center" title={CATEGORIES_LABELS[cat].es}>
                <CatIcon className="h-3 w-3 text-muted-foreground/50" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── CATEGORY COMPARISON CARD ───

function CategoryCard({
  category,
  selected,
}: {
  category: Category;
  selected: Candidate[];
}) {
  const CatIcon = CATEGORY_ICONS[category];
  const proposals = selected.map((c) => ({
    candidate: c,
    proposal: c.keyProposals.find((p) => p.category === category),
  }));
  const hasAny = proposals.some((p) => p.proposal);
  const allHave = proposals.every((p) => p.proposal);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(!hasAny && "opacity-40")}
    >
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Category header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <CatIcon className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">
              {CATEGORIES_LABELS[category].es}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {proposals.map(({ candidate, proposal }) => (
              <div
                key={candidate.id}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  proposal ? "" : "opacity-20"
                )}
                style={{ backgroundColor: candidate.partyColor }}
                title={`${candidate.shortName}: ${proposal ? "Tiene propuesta" : "Sin propuesta"}`}
              />
            ))}
          </div>
        </div>

        {/* Proposals grid */}
        <div className={cn(
          "grid divide-border",
          selected.length === 2 && "grid-cols-1 sm:grid-cols-2 sm:divide-x",
          selected.length === 3 && "grid-cols-1 sm:grid-cols-3 sm:divide-x",
          selected.length === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 sm:divide-x",
        )}>
          {proposals.map(({ candidate, proposal }) => (
            <div
              key={candidate.id}
              className="p-3 sm:p-4"
            >
              {/* Candidate indicator */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="h-1.5 w-6 rounded-full"
                  style={{ backgroundColor: candidate.partyColor }}
                />
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                  {candidate.shortName}
                </span>
              </div>

              {proposal ? (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-foreground leading-snug">
                    {proposal.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {proposal.summary}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 py-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[10px] text-muted-foreground/50 italic">
                    Sin propuesta
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── MAIN COMPONENT ───

interface CompararPlanesClientProps {
  candidates: Candidate[];
}

export function CompararPlanesClient({ candidates }: CompararPlanesClientProps) {
  const country = useCountry();
  const authority = ELECTORAL_AUTHORITY[country.code] ?? "JNE";
  const [selected, setSelected] = useState<Candidate[]>([]);

  const toggleCandidate = (candidate: Candidate) => {
    if (selected.find((c) => c.id === candidate.id)) {
      setSelected(selected.filter((c) => c.id !== candidate.id));
    } else if (selected.length < 4) {
      setSelected([...selected, candidate]);
    }
  };

  const removeCandidate = (id: string) => {
    setSelected(selected.filter((c) => c.id !== id));
  };

  const insights = generateInsights(selected);
  const isReady = selected.length >= 2;

  return (
    <div className="space-y-5">
      {/* ─── Candidate picker grid ─── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <p className="text-xs font-medium text-foreground">
              {isReady
                ? `${selected.length} candidatos seleccionados`
                : "Elige candidatos para comparar"}
            </p>
            {!isReady && selected.length > 0 && (
              <span className="text-[10px] text-muted-foreground">
                · falta {2 - selected.length} más
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isReady && (
              <Badge variant="secondary" className="text-[10px] gap-1 font-mono">
                <Check className="h-2.5 w-2.5" />
                Listo
              </Badge>
            )}
            {selected.length > 0 && (
              <button
                onClick={() => setSelected([])}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
            {candidates.map((c) => {
              const isSelected = !!selected.find((s) => s.id === c.id);
              const isDisabled = !isSelected && selected.length >= 4;
              const proposalCount = new Set(c.keyProposals.map((p) => p.category)).size;

              return (
                <motion.button
                  key={c.id}
                  onClick={() => !isDisabled && toggleCandidate(c)}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 sm:p-4 transition-all text-center",
                    isSelected
                      ? "bg-card shadow-sm"
                      : "bg-transparent border-border hover:bg-muted/30",
                    isDisabled && "opacity-40 cursor-not-allowed",
                    !isSelected && !isDisabled && "hover:border-muted-foreground/30",
                  )}
                  style={{
                    borderColor: isSelected ? c.partyColor : undefined,
                  }}
                >
                  {/* Selection indicator */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: c.partyColor }}
                      >
                        <Check className="h-3 w-3 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Photo */}
                  <div
                    className={cn(
                      "h-12 w-12 sm:h-14 sm:w-14 rounded-full overflow-hidden border-2 flex-shrink-0 transition-all",
                      isSelected ? "border-current" : "border-muted grayscale-[30%]"
                    )}
                    style={{ borderColor: isSelected ? c.partyColor : undefined }}
                  >
                    {c.photo?.startsWith("http") || c.photo?.startsWith("/") ? (
                      <img src={c.photo} alt={c.shortName} className="h-full w-full object-cover" />
                    ) : (
                      <div
                        className="h-full w-full flex items-center justify-center"
                        style={{ backgroundColor: c.partyColor + "15" }}
                      >
                        <User className="h-6 w-6" style={{ color: c.partyColor }} />
                      </div>
                    )}
                  </div>

                  {/* Name + party */}
                  <div className="min-w-0 w-full">
                    <p className={cn(
                      "text-xs font-semibold truncate transition-colors",
                      isSelected ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {c.shortName}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 truncate">
                      {c.party.length > 18 ? c.party.substring(0, 17) + "…" : c.party}
                    </p>
                  </div>

                  {/* Proposal count */}
                  <div className={cn(
                    "flex items-center gap-1 rounded-full px-2 py-0.5 transition-colors",
                    isSelected ? "bg-primary/10" : "bg-muted/50"
                  )}>
                    <FileText className="h-2.5 w-2.5 text-muted-foreground" />
                    <span className="text-[9px] font-mono tabular-nums text-muted-foreground">
                      {proposalCount} temas
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Hint */}
          {!isReady && (
            <p className="text-center text-[10px] text-muted-foreground/60 mt-3">
              Toca para seleccionar · máximo 4 candidatos · datos del {authority}
            </p>
          )}
        </div>
      </div>

      {/* ─── Results section ─── */}
      {selected.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Coverage heatmap */}
          <CoverageHeatmap selected={selected} />

          {/* Insights */}
          {insights.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {insights.slice(0, 6).map((insight, i) => {
                const config = {
                  gap: { icon: AlertTriangle, color: "text-amber", bg: "bg-amber/5", border: "border-amber/20" },
                  convergence: { icon: Check, color: "text-emerald", bg: "bg-emerald/5", border: "border-emerald/20" },
                  divergence: { icon: Sparkles, color: "text-rose", bg: "bg-rose/5", border: "border-rose/20" },
                  highlight: { icon: Lightbulb, color: "text-sky", bg: "bg-sky/5", border: "border-sky/20" },
                }[insight.type];
                const Icon = config.icon;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "flex items-start gap-2.5 rounded-lg border p-3",
                      config.bg,
                      config.border,
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5 flex-shrink-0 mt-0.5", config.color)} />
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-foreground leading-snug">
                        {insight.pattern}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                        {insight.detail}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Category-by-category comparison */}
          <div className="space-y-3">
            {ALL_CATEGORIES.map((cat, i) => (
              <CategoryCard
                key={cat}
                category={cat}
                selected={selected}
              />
            ))}
          </div>

          {/* Disclaimer */}
          <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Nota:</span> Comparación basada en
              las propuestas declaradas ante el {authority}. Los resúmenes no representan la totalidad
              de cada plan. Consulta los documentos oficiales para información completa.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
