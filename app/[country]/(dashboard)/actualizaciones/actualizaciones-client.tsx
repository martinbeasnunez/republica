"use client";

import { motion } from "framer-motion";
import {
  Terminal,
  Sparkles,
  Database,
  Wrench,
  Server,
  Palette,
  Zap,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCountry } from "@/lib/config/country-context";

// =============================================================================
// TYPES
// =============================================================================

type EntryTag = "feature" | "data" | "fix" | "infra" | "ui" | "ai" | "security";

interface ChangelogEntry {
  tag: EntryTag;
  text: string;
}

interface ChangelogDay {
  date: string;
  version?: string;
  entries: ChangelogEntry[];
}

// =============================================================================
// CONFIG
// =============================================================================

const tagConfig: Record<
  EntryTag,
  { label: string; icon: typeof Sparkles; className: string }
> = {
  feature: {
    label: "FEATURE",
    icon: Sparkles,
    className: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
  },
  data: {
    label: "DATA",
    icon: Database,
    className: "text-emerald bg-emerald/10 border-emerald/20",
  },
  fix: {
    label: "FIX",
    icon: Wrench,
    className: "text-amber bg-amber/10 border-amber/20",
  },
  infra: {
    label: "INFRA",
    icon: Server,
    className: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  },
  ui: {
    label: "UI",
    icon: Palette,
    className: "text-pink-400 bg-pink-400/10 border-pink-400/20",
  },
  ai: {
    label: "AI",
    icon: Zap,
    className: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  },
  security: {
    label: "SEC",
    icon: Shield,
    className: "text-rose bg-rose/10 border-rose/20",
  },
};

// =============================================================================
// CHANGELOG DATA
// =============================================================================

const CHANGELOG: ChangelogDay[] = [
  {
    date: "25 feb 2026",
    version: "0.9.0",
    entries: [
      { tag: "feature", text: "Página de changelog público — estás viéndola ahora" },
      { tag: "infra", text: "Cron jobs configurados: scraping diario, verificación automática, polls 2x/semana" },
      { tag: "feature", text: "Página de Actualizaciones en el sidebar" },
    ],
  },
  {
    date: "23 feb 2026",
    version: "0.8.0",
    entries: [
      { tag: "feature", text: "SEO optimizado: sitemap dinámico, metadata por página y datos estructurados" },
      { tag: "data", text: "Encuestas actualizadas al 22 de febrero" },
      { tag: "infra", text: "Actualización automática de encuestas dos veces por semana" },
      { tag: "ui", text: "Comparador de planes: nueva experiencia de selección de candidatos" },
      { tag: "ui", text: "Mejor contraste en gráficos de cobertura de propuestas" },
    ],
  },
  {
    date: "22 feb 2026",
    version: "0.7.1",
    entries: [
      { tag: "ai", text: "IA más inteligente al leer encuestas: detecta titulares falsos" },
      { tag: "infra", text: "Verificación automática de noticias diaria" },
      { tag: "fix", text: "Datos de encuestas corregidos y validados" },
    ],
  },
  {
    date: "19 feb 2026",
    version: "0.7.0",
    entries: [
      { tag: "feature", text: "Verificador conectado a noticias reales vía Supabase" },
      { tag: "ai", text: "La IA verifica noticias automáticamente con Claude" },
      { tag: "data", text: "Verificaciones con variedad: verdadero, falso, engañoso, parcial" },
      { tag: "feature", text: "Historial de cambios en el sidebar" },
    ],
  },
  {
    date: "18 feb 2026",
    version: "0.6.0",
    entries: [
      { tag: "data", text: "Toda la plataforma ahora usa datos reales de Supabase" },
      { tag: "feature", text: "Mapa electoral: próximamente con datos regionales" },
      { tag: "ui", text: "Radiografía con aviso de datos preliminares" },
    ],
  },
  {
    date: "17 feb 2026",
    version: "0.5.0",
    entries: [
      { tag: "ui", text: "Briefing del Día rediseñado: noticias, carrera y radar" },
      { tag: "data", text: "Más fuentes y medios reconocidos integrados" },
      { tag: "feature", text: "Noticias muestran hace cuánto se publicaron" },
    ],
  },
  {
    date: "16 feb 2026",
    version: "0.4.0",
    entries: [
      { tag: "feature", text: "Alertas de WhatsApp rediseñadas" },
      { tag: "ui", text: "Navegación reorganizada y más accesible" },
      { tag: "ui", text: "Herramientas más visibles al entrar a la plataforma" },
    ],
  },
];

// =============================================================================
// COMPONENT
// =============================================================================

export default function ActualizacionesClient() {
  const country = useCountry();
  const totalEntries = CHANGELOG.reduce((sum, day) => sum + day.entries.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Terminal className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground font-mono">
              changelog
            </h1>
            <p className="text-xs text-muted-foreground">
              Log público de la plataforma &middot;{" "}
              <span className="font-mono tabular-nums">{totalEntries}</span> cambios
            </p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(tagConfig).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <div
              key={key}
              className={cn(
                "flex items-center gap-1.5 rounded-md border px-2 py-1",
                config.className
              )}
            >
              <Icon className="h-3 w-3" />
              <span className="text-[10px] font-mono font-bold">{config.label}</span>
            </div>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="relative space-y-6">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

        {CHANGELOG.map((day, dayIndex) => (
          <motion.div
            key={day.date}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dayIndex * 0.06 }}
          >
            {/* Date header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="relative z-10 h-[15px] w-[15px] rounded-full border-2 border-primary bg-background" />
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-sm font-bold text-foreground">
                  {day.date}
                </span>
                {day.version && (
                  <Badge variant="outline" className="font-mono text-[10px] h-5 text-primary border-primary/30">
                    v{day.version}
                  </Badge>
                )}
              </div>
            </div>

            {/* Entries */}
            <div className="ml-[7px] border-l border-transparent pl-6 space-y-2">
              {day.entries.map((entry, entryIndex) => {
                const config = tagConfig[entry.tag];
                const Icon = config.icon;

                return (
                  <motion.div
                    key={entryIndex}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: dayIndex * 0.06 + entryIndex * 0.03 }}
                    className="flex items-start gap-2.5 group"
                  >
                    <div
                      className={cn(
                        "flex items-center gap-1.5 shrink-0 rounded border px-1.5 py-0.5 mt-px",
                        config.className
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      <span className="text-[9px] font-mono font-bold leading-none">
                        {config.label}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {entry.text}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-border pt-4 text-center">
        <p className="text-xs text-muted-foreground/50 font-mono">
          &gt; hecho con Next.js + Supabase + Claude &middot; open data for {country.name.toLowerCase()}
        </p>
      </div>
    </div>
  );
}
