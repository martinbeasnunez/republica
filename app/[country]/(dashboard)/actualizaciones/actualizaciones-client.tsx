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
    date: "28 feb 2026",
    version: "0.12.0",
    entries: [
      { tag: "feature", text: "Radiografía migrada a datos reales: perfiles verificables compilados automáticamente por la IA desde fuentes públicas" },
      { tag: "ai", text: "Nuevo Job 5 — Profile Researcher: investiga candidatos cruzando noticias, compila biografía, trayectoria, controversias y situación legal" },
      { tag: "data", text: "Eliminadas 978 líneas de datos simulados — cero datos inventados en producción" },
      { tag: "ui", text: "Radiografía rediseñada: 4 secciones verificables (Trayectoria, Controversias, Situación Legal, Historial Partidario)" },
      { tag: "data", text: "Primeros perfiles verificados: López Aliaga, Fujimori, Acuña (PE) + Cepeda, De la Espriella, Claudia López (CO)" },
      { tag: "ui", text: "Badges de estado: PERFIL VERIFICADO (verde), PERFIL BÁSICO (amarillo), EN INVESTIGACIÓN (gris) según confianza del perfil" },
      { tag: "infra", text: "Tabla candidate_profiles en Supabase con educación, carrera, controversias, fuentes y nivel de confianza" },
      { tag: "infra", text: "Brain ampliado de 5 a 6 jobs — Profile Researcher se ejecuta automáticamente en el cron diario" },
      { tag: "infra", text: "Dominio condorlatam.com migrado correctamente al proyecto Vercel activo" },
      { tag: "feature", text: "Google Search Console configurado y verificado para indexación SEO" },
      { tag: "fix", text: "Cron jobs reordenados: Scraper (12PM) → Brain (1PM) para que la IA siempre tenga noticias frescas" },
    ],
  },
  {
    date: "27 feb 2026",
    version: "0.11.0",
    entries: [
      { tag: "ai", text: "CONDOR Brain: sistema autónomo de inteligencia editorial que opera sin intervención humana" },
      { tag: "ai", text: "Job 1 — Integridad de Datos: verifica bios, edades y partidos cruzando con noticias recientes. Auto-corrige con confianza ≥85%" },
      { tag: "ai", text: "Job 2 — Verificador de Encuestas: detecta anomalías estadísticas (saltos >5pp, outliers, duplicados, encuestadoras no reconocidas)" },
      { tag: "ai", text: "Job 3 — Curador de Noticias: puntúa artículos por impacto electoral (1-10), marca breaking y desactiva spam" },
      { tag: "ai", text: "Job 4 — Briefing Editorial: genera resumen diario con historias clave, movimientos en encuestas y verificaciones" },
      { tag: "ai", text: "Job 5 — Monitor de Salud: vigila scraper, verificador, encuestas y datos de candidatos con alertas automáticas" },
      { tag: "feature", text: "\"Resumen IA del día\" visible en la página principal (modos Resumen y Dashboard)" },
      { tag: "feature", text: "Panel admin /admin/brain con KPIs, estado del sistema, briefings y audit trail completo" },
      { tag: "feature", text: "Sección CONDOR Brain en la página de Metodología explicando cómo funciona el sistema autónomo" },
      { tag: "data", text: "Audit trail: cada acción del Brain registrada con valores antes/después, confianza y timestamp" },
      { tag: "infra", text: "Cron diario condor-brain ejecuta los 5 jobs para Perú y Colombia automáticamente" },
      { tag: "fix", text: "Monitor de salud mejorado: ignora candidatos menores sin encuestas (condición normal, no alarma)" },
      { tag: "fix", text: "Alertas de salud deduplicadas en admin (ya no se repiten entre runs)" },
    ],
  },
  {
    date: "26 feb 2026",
    version: "0.10.0",
    entries: [
      { tag: "ui", text: "Quiz electoral rediseñado: resultados tipo Spotify Wrapped con foto del candidato, ring gauge animado y card compartible" },
      { tag: "data", text: "Datos de candidatos PE verificados: López Aliaga (ex alcalde), Keiko (4ta candidatura, muerte de Alberto), Álvarez/López-Chau (partidos corregidos)" },
      { tag: "data", text: "Datos de candidatos CO verificados: Cepeda (exsenador), Claudia López (Imparables), Valencia (exsenadora), Dávila (ex Semana)" },
      { tag: "fix", text: "Algoritmo del quiz: labels de afinidad coherentes con el porcentaje en vez de conteo confuso de temas" },
      { tag: "fix", text: "Radiografía accesible desde cada perfil de candidato (link corregido)" },
      { tag: "ai", text: "Chat con IA: respuestas se renderizan con formato Markdown (negritas, listas, código)" },
      { tag: "feature", text: "Botón de compartir resultados del quiz con Web Share API + clipboard fallback" },
    ],
  },
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
