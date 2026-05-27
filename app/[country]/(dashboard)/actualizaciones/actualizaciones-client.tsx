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
    date: "25 may 2026",
    version: "0.23.0",
    entries: [
      { tag: "data", text: "Colombia T-6: encuestadoras ampliadas a 5 — Datexco y AtlasIntel se suman a Invamer, CNC y Guarumo de cara a la primera vuelta del 31 de mayo" },
      { tag: "ai", text: "Brain v1.4 — nuevo Job 2 Poll Updater: importa encuestas desde fuentes públicas verificadas antes del análisis editorial (pipeline determinístico, sin AI)" },
      { tag: "ai", text: "Validador numérico estricto antes de aceptar encuestas: encuestadora certificada, rangos plausibles, sumatorias coherentes" },
      { tag: "infra", text: "Memoria contextual del Brain: cada run aprovecha el contexto del día anterior para análisis editoriales más coherentes en el tiempo" },
      { tag: "ui", text: "Quiz electoral pulido para Colombia con perfiles de candidatos verificados y afinidad ideológica recalibrada" },
      { tag: "ui", text: "Perfiles, cards de candidato, página de encuestas y home refinados para el modo T-6 de Colombia" },
    ],
  },
  {
    date: "18 abr 2026",
    version: "0.22.0",
    entries: [
      { tag: "feature", text: "Nueva página /analisis — archivo público de los briefings diarios del Brain, navegable por fecha con permalinks (/analisis/[date]) para compartir el análisis de un día específico" },
      { tag: "ui", text: "Radiografía rediseñada con detalle por candidato: trayectoria, controversias, situación legal y fuentes verificables" },
      { tag: "ai", text: "Editorial del Brain reescrito para la fase post-primera vuelta: foco en transferencia de votos y dinámicas de balotaje" },
      { tag: "ui", text: "Páginas de candidatos, planes, verificador y noticias pulidas para la fase de segunda vuelta" },
    ],
  },
  {
    date: "14 abr 2026",
    version: "0.21.0",
    entries: [
      { tag: "feature", text: "Home en modo segunda vuelta — head-to-head Keiko Fujimori vs Roberto Sánchez con comparativo de propuestas, encuestas y trayectoria" },
      { tag: "data", text: "Resultados oficiales ONPE de primera vuelta cargados y publicados en /en-vivo" },
      { tag: "ui", text: "Countdown actualizado al 7 de junio (segunda vuelta PE) en toda la plataforma" },
      { tag: "ui", text: "Layout de /en-vivo ajustado para mostrar resultados oficiales junto a encuestas y briefing post-electoral" },
    ],
  },
  {
    date: "12 abr 2026",
    version: "0.20.0",
    entries: [
      { tag: "feature", text: "Cobertura en vivo del día electoral PE: flash results, exit polls, timeline minuto a minuto, AI Pulse, briefing live y barra de redes sociales de candidatos" },
      { tag: "feature", text: "/en-vivo reconvertido en hub completo de cobertura en tiempo real con secciones diferenciadas y feed continuo de noticias" },
      { tag: "feature", text: "Nueva landing /pe/congreso para emprendedores: 9 candidatos verificados al Senado y Cámara con propuestas en tecnología, pymes y empleabilidad" },
      { tag: "ai", text: "Briefing del Brain en modo 'día D': 5 takeaways automáticos por categoría y timeline parseado del feed en vivo" },
      { tag: "ui", text: "Modo 'live home' activado automáticamente durante la ventana electoral (día de elección + 7 días) — el home se convierte en cobertura en vivo" },
    ],
  },
  {
    date: "9 abr 2026",
    version: "0.19.0",
    entries: [
      { tag: "data", text: "Encuestas Perú reconstruidas con las últimas publicadas antes del silencio electoral: Ipsos Tercer Simulacro (1-2 abr), IEP (3 abr), CPI (3-4 abr), Datum (5-6 abr)" },
      { tag: "data", text: "Encuestas Colombia actualizadas con mediciones de marzo: Guarumo (19-25 mar), CNC (17-21 mar), GAD3 (mar), Invamer (feb) — promedio ponderado por recencia" },
      { tag: "fix", text: "Pipeline de encuestas reforzada: fuentes estrictamente limitadas a encuestadoras certificadas (Datum, IEP, Ipsos, CPI para PE; Invamer, Guarumo, GAD3, CNC para CO)" },
      { tag: "ai", text: "Brain: capa de validación numérica antes de publicar bloques — rechaza automáticamente porcentajes que no coincidan con los datos reales de encuestadoras" },
      { tag: "ai", text: "Brain: análisis editorial ahora solo menciona candidatos activos e inscritos — se ignora cualquier referencia a inhabilitados o excluidos en noticias" },
      { tag: "fix", text: "Quiz: afinidad ideológica ahora pondera únicamente los ejes temáticos con posición documentada por candidato — resultados más precisos y representativos" },
      { tag: "fix", text: "Fecha de elección Perú corregida a 12 de abril en toda la plataforma (home, SEO, guía electoral)" },
      { tag: "data", text: "36 candidatos inscritos por el JNE disponibles en la plataforma — padrón completo de la primera vuelta" },
    ],
  },
  {
    date: "5 abr 2026",
    version: "0.18.5",
    entries: [
      { tag: "data", text: "Perú T-7: últimas encuestas permitidas cargadas antes del silencio electoral obligatorio (5 abr)" },
      { tag: "ui", text: "Contador regresivo en home y en-vivo actualizado a horas exactas para Perú a 7 días de la primera vuelta" },
      { tag: "ai", text: "Brain v1.3: nuevo Job 8 — Site Auditor analiza diariamente la calidad del contenido (100 puntos en 4 categorías: contenido, frescura, calidad, SEO)" },
      { tag: "ai", text: "Profile Researcher mejorado: compila perfiles verificables de candidatos desde artículos reales, refresca semanalmente, 3 candidatos por ciclo" },
      { tag: "ui", text: "Página de Actualizaciones: nuevo diseño con versiones, tags por tipo de cambio y conteo total de mejoras" },
    ],
  },
  {
    date: "24 mar 2026",
    version: "0.18.0",
    entries: [
      { tag: "data", text: "Encuestas Perú actualizadas con Datum (22 mar), IEP, Ipsos y CPI — 39 data points de 4 encuestadoras" },
      { tag: "data", text: "4 candidatos nuevos agregados: Jorge Nieto (4.6%), Ricardo Belmont (2.4%), Yonhy Lescano (2.3%), Roberto Sánchez (2.0%)" },
      { tag: "ai", text: "Pipeline de encuestas arreglada: cuando el scraper detecta un candidato nuevo en una encuesta, lo crea automáticamente en la DB" },
      { tag: "ai", text: "Prompt del clasificador actualizado: ahora extrae TODOS los candidatos de encuestas (no solo los conocidos)" },
      { tag: "ai", text: "Prompt del Brain mejorado: analista de carrera electoral que responde quién va adelante, quién se mueve y qué se espera" },
      { tag: "ai", text: "Auto-Verifier arreglado: ya no verifica opiniones como hechos (ej: 'X es una amenaza' no es verificable)" },
      { tag: "fix", text: "Fact-check en homepage: muestra 1 claim falso específico con cita textual en vez de un conteo genérico" },
      { tag: "ui", text: "Encuestas: expandido a 13 candidatos (era 8), con fecha de última actualización visible" },
      { tag: "ui", text: "Noticias destacadas: foto circular del candidato mencionado junto al título" },
      { tag: "fix", text: "Bloques engagement_cta fantasma eliminados de Colombia (ej: 'Participa en encuesta' que no existía)" },
      { tag: "fix", text: "Foto de Abelardo de la Espriella corregida (URL rota → imagen verificada de Wikipedia)" },
      { tag: "ui", text: "Branding unificado: 'CONDOR AI' consistente en todo el sitio (antes mezclaba 'IA' e 'AI')" },
    ],
  },
  {
    date: "21 mar 2026",
    version: "0.17.0",
    entries: [
      { tag: "ui", text: "Rediseño premium del homepage: editorial IA como protagonista con tipografía 2xl, lede en bold y cuerpo editorial fluido" },
      { tag: "ai", text: "Prompt del Brain transformado: de 'periodista que resume' a 'analista que analiza la carrera electoral' — responde quién va adelante, quién se mueve, qué impacta y qué se espera" },
      { tag: "ai", text: "Homepage Composer: bloques engagement_cta eliminados — la IA ya no genera CTAs fantasma que no llevan a ningún lado" },
      { tag: "ui", text: "Carrera electoral y noticias en grid side-by-side (3:2), candidatos con foto clickeables directo al perfil" },
      { tag: "ui", text: "Countdown compactado como badge en la barra superior, no como bloque gigante que roba espacio" },
      { tag: "ui", text: "Sidebar: removido 'Ver todos los países' (innecesario con solo 2 países)" },
      { tag: "ui", text: "Noticias: hero inteligente que no muestra artículos viejos como 'última hora'" },
      { tag: "fix", text: "Status badge: 'HOY' (verde) vs 'ÚLTIMO' (ámbar) según frescura real del briefing" },
    ],
  },
  {
    date: "21 mar 2026",
    version: "0.16.0",
    entries: [
      { tag: "ui", text: "Rediseño completo del hero de Noticias y Dashboard: countdown prominente (text-7xl), tipografía más grande en toda la interfaz, más whitespace y padding" },
      { tag: "ui", text: "Eliminado ruido visual: classification-header, grid-overlay y data-stream removidos del hero" },
      { tag: "ui", text: "Status inteligente: 'MONITOREO CONTINUO' cuando no hay noticias recientes en vez de 'SIN NOTICIAS' (nunca suena roto)" },
      { tag: "ui", text: "Countdown con fecha de elección visible, label 'FALTAN' y barra de urgencia más gruesa" },
      { tag: "fix", text: "Planes electorales: botón de PDF ahora distingue entre descarga directa (PDF) y búsqueda en JNE/CNE" },
      { tag: "ui", text: "Planes: badge 'Fuente: JNE/CNE' visible en cada candidato con plan oficial verificado" },
      { tag: "ui", text: "Sección '¿Qué pasó hoy?' renombrada a 'Últimas noticias' para no mentir sobre la fecha" },
      { tag: "ui", text: "Fotos de candidatos más grandes (48px), barras de encuestas más gruesas, cards más anchas en 'Conócelos'" },
      { tag: "ai", text: "Disclaimer de análisis IA mejorado: referencia explícita al JNE/CNE como fuente del plan de gobierno" },
    ],
  },
  {
    date: "20 mar 2026",
    version: "0.15.0",
    entries: [
      { tag: "fix", text: "Hero de noticias ya no muestra artículos viejos como 'ÚLTIMA HORA' — solo noticias de las últimas 24h reciben ese badge" },
      { tag: "ui", text: "Noticia destacada: cuando no hay artículos recientes, muestra estado vacío en vez de reciclar noticias viejas" },
      { tag: "fix", text: "Briefing del dashboard: detecta si es de hoy o de días anteriores y muestra aviso de staleness" },
      { tag: "ui", text: "Status badge rediseñado como pill con borde: 'ACTUALIZADO HOY' (verde) o 'MONITOREO CONTINUO' (gris)" },
    ],
  },
  {
    date: "3 mar 2026",
    version: "0.14.0",
    entries: [
      { tag: "ui", text: "Navegación mobile: nueva barra inferior con Inicio, Encuestas, Candidatos, Noticias y Más" },
      { tag: "fix", text: "Contenido mobile ya no desaparece al cambiar entre Resumen y Dashboard (fix de AnimatePresence + hydration)" },
      { tag: "ui", text: "Contraste mejorado en toda la plataforma: bordes más visibles, textos más legibles" },
      { tag: "ui", text: "Quiz CTA compacto en posición 2 del home para mejor visibilidad" },
      { tag: "ui", text: "Noticias del home mejoradas: avatares de fuente y bordes por tipo de verificación" },
      { tag: "ui", text: "WhatsApp FAB reposicionado al lateral derecho en mobile, sin conflicto con bottom nav" },
      { tag: "ui", text: "Ticker de noticias: arranca expandido, colapsable con toggle, pill push-notification en desktop" },
      { tag: "ui", text: "Actualizaciones recientes: acceso directo a /actualizaciones sin desplegable" },
      { tag: "ui", text: "Títulos de secciones con mayor peso visual (extrabold)" },
    ],
  },
  {
    date: "2 mar 2026",
    entries: [
      { tag: "ai", text: "Homepage Composer (Brain Job 7): bloques dinámicos curados por IA — trending, análisis editorial, fact-checks destacados" },
      { tag: "ai", text: "Bloques dinámicos con diseño diferenciado por tipo: tendencia (rojo), análisis (gris editorial), verificación (verde/ámbar)" },
      { tag: "infra", text: "Tabla homepage_blocks en Supabase con TTL de 12h y refresco automático por el Brain" },
      { tag: "feature", text: "Admin Brain ampliado: visualización de bloques del homepage con preview en tiempo real" },
    ],
  },
  {
    date: "1 mar 2026",
    version: "0.13.0",
    entries: [
      { tag: "feature", text: "Admin Quiz: panel de analítica con total de completados, tendencia diaria, candidato más compatible y distribución de respuestas" },
      { tag: "fix", text: "Monitor de salud del Brain: corregido bug que mostraba 'hace nunca' cuando no había artículos recientes en Colombia" },
      { tag: "fix", text: "Alertas de salud en admin: deduplicación mejorada por sistema en vez de por mensaje exacto" },
      { tag: "infra", text: "SEO: corregido BASE_URL en sitemap, robots.txt y metadata — URLs ahora apuntan correctamente a www.condorlatam.com" },
      { tag: "infra", text: "Indexación solicitada en Google Search Console para las 8 URLs prioritarias de Perú" },
    ],
  },
  {
    date: "28 feb 2026",
    version: "0.12.0",
    entries: [
      { tag: "feature", text: "Radiografía migrada a datos reales: perfiles verificables compilados automáticamente por la IA desde fuentes públicas" },
      { tag: "ai", text: "Nuevo Job — Profile Researcher: investiga candidatos cruzando noticias, compila biografía, trayectoria, controversias y situación legal" },
      { tag: "ui", text: "Radiografía rediseñada: 4 secciones verificables (Trayectoria, Controversias, Situación Legal, Historial Partidario)" },
      { tag: "data", text: "Primeros perfiles verificados: López Aliaga, Fujimori, Acuña (PE) + Cepeda, De la Espriella, Claudia López (CO)" },
      { tag: "ui", text: "Badges de estado: PERFIL VERIFICADO, PERFIL BÁSICO y EN INVESTIGACIÓN según confianza del perfil" },
      { tag: "infra", text: "Base de datos de perfiles con educación, carrera, controversias, fuentes y nivel de confianza" },
      { tag: "infra", text: "Brain ampliado de 5 a 6 jobs — Profile Researcher se ejecuta automáticamente en el cron diario" },
      { tag: "feature", text: "SEO optimizado y verificado para indexación en buscadores" },
      { tag: "fix", text: "Cron jobs reordenados: scraping primero, análisis de IA después, para siempre tener noticias frescas" },
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
      { tag: "feature", text: "Verificador conectado a noticias reales en tiempo real" },
      { tag: "ai", text: "La IA verifica noticias automáticamente con Claude" },
      { tag: "data", text: "Verificaciones con variedad: verdadero, falso, engañoso, parcial" },
      { tag: "feature", text: "Historial de cambios en el sidebar" },
    ],
  },
  {
    date: "18 feb 2026",
    version: "0.6.0",
    entries: [
      { tag: "data", text: "Toda la plataforma ahora usa datos reales de la base de datos" },
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
          &gt; inteligencia electoral con IA &middot; datos abiertos para {country.name.toLowerCase()}
        </p>
      </div>
    </div>
  );
}
