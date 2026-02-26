"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  ShieldCheck,
  Database,
  BarChart3,
  Brain,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Globe,
  Scale,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  sources,
  getSourcesByCategory,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  type SourceCategory,
} from "@/lib/data/sources";
import { useCountry } from "@/lib/config/country-context";

const methodologyByCountry = {
  pe: {
    electoralAuthority: "JNE",
    pollSources: ["Ipsos", "CPI", "Datum", "IEP"],
    factCheckDescription:
      "Utilizamos modelos de IA que cruzan las afirmaciones contra bases de datos oficiales (JNE, ONPE, RENIEC, INEI) y fuentes verificadas (Ojo Público, Convoca). Cada verificación incluye nivel de confianza, fuentes consultadas y contexto. La IA no emite opinión: clasifica basándose en evidencia factual.",
    factCheckSources: ["JNE", "ONPE", "RENIEC", "INEI", "Ojo Público", "Convoca", "BM", "FMI"],
    radiografiaDescription:
      "Compilamos información pública sobre patrimonio declarado, procesos legales, redes de contactos y financiamiento de campaña. Las fuentes son documentos oficiales del JNE, declaraciones juradas, registros de la Contraloría y reportajes de investigación.",
    radiografiaSources: ["JNE", "Convoca", "Transparencia"],
    newsDescription:
      "Agregamos noticias de medios peruanos reconocidos con cobertura electoral. Cada noticia se etiqueta con nivel de verificación y se cruza con nuestro verificador de hechos para detectar afirmaciones sin sustento.",
    newsSources: ["Infobae", "Andina", "El Comercio", "La República"],
    registroOficial:
      "Encuestadoras registradas ante el JNE. Medios miembros de asociaciones de prensa.",
  },
  co: {
    electoralAuthority: "CNE",
    pollSources: ["Invamer", "Datexco", "Cifras y Conceptos", "Guarumo"],
    factCheckDescription:
      "Utilizamos modelos de IA que cruzan las afirmaciones contra bases de datos oficiales (Registraduría, CNE, DANE) y fuentes verificadas (La Silla Vacía, Colombiacheck). Cada verificación incluye nivel de confianza, fuentes consultadas y contexto. La IA no emite opinión: clasifica basándose en evidencia factual.",
    factCheckSources: ["Registraduría", "CNE", "DANE", "La Silla Vacía", "Colombiacheck", "BM", "FMI"],
    radiografiaDescription:
      "Compilamos información pública sobre patrimonio declarado, procesos legales, redes de contactos y financiamiento de campaña. Las fuentes son documentos oficiales del CNE, declaraciones juradas, registros de la Contraloría y reportajes de investigación.",
    radiografiaSources: ["CNE", "Colombiacheck", "Transparencia"],
    newsDescription:
      "Agregamos noticias de medios colombianos reconocidos con cobertura electoral. Cada noticia se etiqueta con nivel de verificación y se cruza con nuestro verificador de hechos para detectar afirmaciones sin sustento.",
    newsSources: ["El Tiempo", "Semana", "El Espectador", "La Silla Vacía"],
    registroOficial:
      "Encuestadoras autorizadas por el CNE. Medios miembros de asociaciones de prensa.",
  },
};

const categoryIcons: Record<SourceCategory, typeof Database> = {
  encuestadora: BarChart3,
  organismo_electoral: Scale,
  organismo_internacional: Globe,
  gobierno: Database,
  medio_comunicacion: BookOpen,
  fact_checking: Search,
  academia: Brain,
};

const sectionOrder: SourceCategory[] = [
  "organismo_electoral",
  "encuestadora",
  "organismo_internacional",
  "gobierno",
  "fact_checking",
  "medio_comunicacion",
  "academia",
];

function ReliabilityBar({ value }: { value: number }) {
  const color =
    value >= 95
      ? "bg-emerald"
      : value >= 90
        ? "bg-sky"
        : value >= 85
          ? "bg-indigo"
          : "bg-amber";

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-muted">
        <div
          className={cn("h-1.5 rounded-full transition-all", color)}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="font-mono text-xs tabular-nums text-muted-foreground">
        {value}%
      </span>
    </div>
  );
}

export default function MetodologiaClient() {
  const country = useCountry();
  const m = methodologyByCountry[country.code as keyof typeof methodologyByCountry] ?? methodologyByCountry.pe;
  const grouped = getSourcesByCategory();

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            Metodología y Fuentes
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Transparencia total sobre cómo recopilamos, verificamos y procesamos
          la información electoral
        </p>
      </motion.div>

      {/* Principios */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-card border-border overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-transparent to-transparent p-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Nuestros Principios
            </h2>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Database,
                  title: "Datos Verificables",
                  description:
                    "Toda información proviene de fuentes oficiales, instituciones reconocidas o medios con trayectoria verificable.",
                },
                {
                  icon: Scale,
                  title: "Imparcialidad",
                  description:
                    "No promovemos ningún candidato o partido. Presentamos datos objetivos para que el ciudadano decida informado.",
                },
                {
                  icon: BookOpen,
                  title: "Transparencia",
                  description:
                    "Publicamos nuestras fuentes, metodología de ponderación y criterios de confiabilidad abiertamente.",
                },
                {
                  icon: Clock,
                  title: "Actualización",
                  description:
                    "Los datos se actualizan conforme las fuentes publican nueva información. Cada sección muestra su fecha de última actualización.",
                },
              ].map((p) => (
                <div key={p.title} className="rounded-lg bg-muted/50 p-4">
                  <p.icon className="h-5 w-5 text-primary mb-2" />
                  <p className="text-sm font-semibold text-foreground">
                    {p.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Metodología por sección */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              Cómo Procesamos la Información
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                {
                  title: "Agregador de Encuestas",
                  page: "/encuestas",
                  description:
                    `Recopilamos encuestas de las principales encuestadoras registradas ante el ${m.electoralAuthority}. Calculamos un promedio ponderado donde el peso de cada encuestadora depende de: (1) su confiabilidad histórica, (2) tamaño de muestra, (3) recencia de la encuesta y (4) metodología empleada.`,
                  sources: m.pollSources,
                },
                {
                  title: "Verificador de Hechos",
                  page: "/verificador",
                  description: m.factCheckDescription,
                  sources: m.factCheckSources,
                },
                {
                  title: "Radiografía de Candidatos",
                  page: "/radiografia",
                  description: m.radiografiaDescription,
                  sources: m.radiografiaSources,
                },
                {
                  title: "Simulador Electoral",
                  page: "/simulador",
                  description:
                    "Ejecutamos simulaciones Monte Carlo (hasta 10,000 iteraciones) basadas en promedios de encuestas, volatilidad histórica, porcentaje de indecisos y variación de participación. No son predicciones: son escenarios probabilísticos.",
                  sources: m.pollSources,
                },
                {
                  title: "Noticias",
                  page: "/noticias",
                  description: m.newsDescription,
                  sources: m.newsSources,
                },
              ].map((section, i) => (
                <div
                  key={section.title}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-foreground">
                        {section.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {section.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {section.sources.map((s) => (
                          <Badge
                            key={s}
                            variant="outline"
                            className="text-[10px] h-5"
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Criterios de confiabilidad */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald" />
              Criterios de Confiabilidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Evaluamos cada fuente en base a los siguientes criterios para
              asignar un puntaje de confiabilidad (0-100):
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Clock,
                  title: "Trayectoria",
                  description:
                    "Cuántas elecciones ha cubierto y qué tan cerca estuvieron sus datos del resultado real.",
                },
                {
                  icon: BookOpen,
                  title: "Metodología Transparente",
                  description:
                    "Publica ficha técnica con tamaño de muestra, margen de error y tipo de muestreo.",
                },
                {
                  icon: Scale,
                  title: "Independencia",
                  description:
                    "Quién financia la fuente, si tiene vínculos partidarios o conflictos de interés.",
                },
                {
                  icon: ShieldCheck,
                  title: "Registro Oficial",
                  description:
                    m.registroOficial,
                },
                {
                  icon: Globe,
                  title: "Reconocimiento Internacional",
                  description:
                    "Membresía en WAPOR, ESOMAR, IFCN u organismos equivalentes.",
                },
                {
                  icon: AlertTriangle,
                  title: "Historial de Errores",
                  description:
                    "Se penaliza a fuentes con antecedentes de datos erróneos o retracciones frecuentes.",
                },
              ].map((c) => (
                <div key={c.title} className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <c.icon className="h-4 w-4 text-primary" />
                    <p className="text-xs font-semibold text-foreground">
                      {c.title}
                    </p>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {c.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Fuentes por categoría */}
      {sectionOrder.map((category, catIndex) => {
        const items = grouped[category];
        if (!items.length) return null;
        const Icon = categoryIcons[category];
        const color = CATEGORY_COLORS[category];

        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + catIndex * 0.05 }}
          >
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Icon className="h-4 w-4" style={{ color }} />
                  {CATEGORY_LABELS[category]}
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-mono ml-auto"
                  >
                    {items.length} fuente{items.length > 1 ? "s" : ""}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((source) => (
                    <div
                      key={source.id}
                      className="rounded-lg border border-border p-4 hover:border-primary/20 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold text-foreground">
                              {source.name}
                            </h3>
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
                            >
                              {source.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {source.description}
                          </p>

                          {/* Details grid */}
                          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                Confiabilidad
                              </p>
                              <ReliabilityBar value={source.reliability} />
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                Actualización
                              </p>
                              <p className="text-xs text-foreground">
                                {source.updateFrequency}
                              </p>
                            </div>
                            {source.methodology && (
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                  Metodología
                                </p>
                                <p className="text-xs text-foreground">
                                  {source.methodology}
                                </p>
                              </div>
                            )}
                            {source.sampleSize && (
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                  Muestra
                                </p>
                                <p className="text-xs font-mono tabular-nums text-foreground">
                                  {source.sampleSize}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Why reliable */}
                          <div className="mt-3 rounded-md bg-primary/5 border border-primary/10 p-2.5">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                              Por qué es confiable
                            </p>
                            <p className="text-[11px] text-foreground leading-relaxed">
                              {source.whyReliable}
                            </p>
                          </div>

                          {/* Used in */}
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] text-muted-foreground">
                              Usado en:
                            </span>
                            {source.usedIn.map((page) => (
                              <Badge
                                key={page}
                                variant="outline"
                                className="text-[10px] h-5"
                              >
                                {page}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}

      {/* Limitaciones */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber" />
              Limitaciones y Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                "CONDOR es una herramienta informativa, no un organismo electoral oficial. Los resultados del simulador son escenarios probabilísticos, no predicciones.",
                "Las encuestas tienen márgenes de error inherentes (típicamente ±2-3%). El promedio ponderado reduce pero no elimina esta incertidumbre.",
                "La verificación por IA tiene limitaciones: no puede acceder a información no pública y sus resultados deben considerarse como orientativos, no definitivos.",
                "Los puntajes de confiabilidad son asignados por CONDOR en base a criterios públicos, no por las fuentes mismas. Son indicativos y actualizables.",
                "Ninguna plataforma reemplaza el juicio crítico del ciudadano. Recomendamos consultar múltiples fuentes antes de tomar decisiones.",
              ].map((text, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-lg bg-amber/5 border border-amber/10 p-3"
                >
                  <span className="font-mono text-[10px] text-amber tabular-nums mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Fuentes Totales", value: sources.length, color: "text-indigo" },
            {
              label: "Confiabilidad Promedio",
              value: `${Math.round(sources.reduce((a, s) => a + s.reliability, 0) / sources.length)}%`,
              color: "text-emerald",
            },
            {
              label: "Categorías",
              value: sectionOrder.length,
              color: "text-sky",
            },
            {
              label: "Última revisión",
              value: "Feb 2026",
              color: "text-amber",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-4 text-center"
            >
              <p
                className={cn(
                  "font-mono text-2xl font-bold tabular-nums",
                  stat.color
                )}
              >
                {stat.value}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
