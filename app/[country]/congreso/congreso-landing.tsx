"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, ArrowLeft, Shield, Vote } from "lucide-react";
import { cn } from "@/lib/utils";

type Tag = "Emprendimiento" | "Tecnología" | "Pymes / MYPE" | "Empleabilidad" | "Innovación" | "Finanzas / Crédito";
type Camara = "Senado" | "Diputados";

interface Candidato {
  nombre: string;
  partido: string;
  partColor: string;
  camara: Camara;
  region: string;
  tags: Tag[];
  bio: string;
  propuestas: string[];
  comoVotar: string;
  fuente: string;
  fuenteLabel: string;
}

// Solo candidatos con contenido concreto y verificado — sin presidenciales
// Ordenados de más a menos relevancia en emprendimiento real
const CANDIDATOS: Candidato[] = [
  // ── Diputados ──────────────────────────────────────────────────
  {
    nombre: "Norma Yarrow",
    partido: "Renovación Popular",
    partColor: "#ef4444",
    camara: "Diputados",
    region: "Lima Metropolitana",
    tags: ["Tecnología", "Pymes / MYPE", "Emprendimiento"],
    bio: "Arquitecta (UNIFE). Congresista 2021–2026. Secretaria General de Renovación Popular. Candidata #1 a Diputados por Lima.",
    propuestas: [
      "Centros Municipales de Innovación Tecnológica para desarrollo de software, hardware y startups",
      "Simplificación de licencias y trámites para pequeñas empresas",
      "Fondo de apoyo para jóvenes emprendedores de primera vez",
    ],
    comoVotar: "Si vives en Lima Metropolitana: en la cédula de Diputados, vota por Renovación Popular y marca preferencia por Norma Yarrow (lista #1).",
    fuente: "https://www.infobae.com/peru/2026/03/18/candidatos-de-renovacion-popular-al-senado-y-camara-de-diputados-por-lima-metropolitana-en-las-elecciones-2026/",
    fuenteLabel: "Infobae",
  },
  {
    nombre: "Gonzalo Wurst",
    partido: "Somos Perú",
    partColor: "#0ea5e9",
    camara: "Diputados",
    region: "Lima Metropolitana",
    tags: ["Finanzas / Crédito", "Emprendimiento", "Pymes / MYPE"],
    bio: "Abogado y empresario. Excongresista. Candidato a Diputados Lima #9. Propone reformas concretas para la formalización y el acceso a crédito real.",
    propuestas: [
      "Derogar la Ley 31143 (topes a tasas de interés) que excluye a pequeños negocios del crédito formal y los empuja al préstamo informal",
      "Open Finance: compartir datos de ingresos reales (con consentimiento) para que microempresarios accedan a crédito sin historial bancario",
      "Asistencia legal y contable gratuita para formalización de negocios",
      "Inversiones en seguridad de locales comerciales deducibles de impuestos",
    ],
    comoVotar: "Si vives en Lima Metropolitana: en la cédula de Diputados, vota por Somos Perú y marca preferencia por Gonzalo Wurst (lista #9).",
    fuente: "https://elcomercio.pe/politica/tribuna-electoral-las-propuestas-de-pierangeli-dodero-patricia-mejia-patricia-lengua-y-gonzalo-wurst-para-la-camara-de-diputados-elecciones-2026-noticia/",
    fuenteLabel: "El Comercio",
  },
  {
    nombre: "Patricia Mejía",
    partido: "Renovación Popular",
    partColor: "#ef4444",
    camara: "Diputados",
    region: "Lima Metropolitana",
    tags: ["Emprendimiento", "Empleabilidad"],
    bio: "Educadora y gestora pública. Candidata a Diputados Lima #15 por Renovación Popular. Enfocada en reformar la educación hacia el emprendimiento y la empleabilidad.",
    propuestas: [
      "Incluir educación tecnológica, productiva y financiera como política nacional en la Ley General de Educación, para que jóvenes puedan emprender al terminar el colegio",
      "Reforma docente con capacitación en tecnología e innovación para revalorizar la carrera magisterial",
      "Supervisar que el presupuesto educativo llegue efectivamente a colegios para sus necesidades reales",
    ],
    comoVotar: "Si vives en Lima Metropolitana: en la cédula de Diputados, vota por Renovación Popular y puedes marcar preferencia por Patricia Mejía (lista #15).",
    fuente: "https://elcomercio.pe/politica/tribuna-electoral-las-propuestas-de-pierangeli-dodero-patricia-mejia-patricia-lengua-y-gonzalo-wurst-para-la-camara-de-diputados-elecciones-2026-noticia/",
    fuenteLabel: "El Comercio",
  },
  {
    nombre: "Pierangeli Dodero",
    partido: "Fuerza Popular",
    partColor: "#f97316",
    camara: "Diputados",
    region: "Lima Metropolitana",
    tags: ["Empleabilidad", "Emprendimiento"],
    bio: "Comunicadora (ex-TV). Candidata a Diputados Lima #5 por Fuerza Popular. Propone abrir colegios a talleres de tecnología y formalizar el empleo de madres independientes.",
    propuestas: [
      "\"Escuelas Públicas Abiertas\": colegios abiertos los fines de semana con talleres de robótica, inteligencia artificial, arte y deporte",
      "\"Fuerza Mamá Perú\": capacitación técnica certificada vinculada a empleo formal, dirigida a madres solteras en situación informal",
      "Educación financiera como política en la Ley General de Educación para generar competencias emprendedoras desde el colegio",
    ],
    comoVotar: "Si vives en Lima Metropolitana: en la cédula de Diputados, vota por Fuerza Popular y puedes marcar preferencia por Pierangeli Dodero (lista #5).",
    fuente: "https://www.expreso.com.pe/politica/conductora-pierangeli-dodero-sera-candidata-a-diputada-por-fuerza-popular-cual-es-su-perfil-juli-noticia/1245383/",
    fuenteLabel: "Expreso",
  },
  // ── Senado ─────────────────────────────────────────────────────
  {
    nombre: "Carla Mares",
    partido: "Sí Creo",
    partColor: "#a855f7",
    camara: "Senado",
    region: "Nacional",
    tags: ["Emprendimiento", "Pymes / MYPE", "Innovación"],
    bio: "Economista con doctorado. Directora del Plan de Gobierno de Sí Creo. Candidata al Senado Nacional.",
    propuestas: [
      "Zonas económicas especiales en regiones: inversión privada y empleo formal descentralizado",
      "Simplificación fiscal: eliminar impuestos anti-técnicos que frenan la formalización",
      "\"A quienes producen, emprenden y cumplen — estoy con ustedes\" — reducir superposición burocrática entre entidades del Estado",
    ],
    comoVotar: "En la cédula del Congreso (Senado): vota por el partido Sí Creo a nivel nacional.",
    fuente: "https://caretas.pe/politica/reformas-y-estado-las-propuestas-de-carla-mares-en-peru-2026",
    fuenteLabel: "Caretas",
  },
  {
    nombre: "Augusto Peñaloza",
    partido: "Avanza País",
    partColor: "#10b981",
    camara: "Senado",
    region: "Nacional",
    tags: ["Emprendimiento", "Finanzas / Crédito"],
    bio: "Empresario inmobiliario. Creador de contenido digital ('Tío Rockefeller'). Candidato al Senado (lista #5). Llegó a la política desde el mundo empresarial.",
    propuestas: [
      "Perfil emprendedor: empresario que construyó patrimonio desde cero en real estate",
      "Reducir gasto estatal para liberar recursos al sector privado",
      "Transparencia en la gestión pública como base para el clima de negocios",
    ],
    comoVotar: "En la cédula del Congreso (Senado): vota por el partido Avanza País a nivel nacional.",
    fuente: "https://www.infobae.com/peru/2025/12/23/augusto-penaloza-el-tio-rockefeller-postulara-al-senado-por-avanza-pais-soy-un-conservador-pro-familia/",
    fuenteLabel: "Infobae",
  },
  {
    nombre: "Jorge Solís",
    partido: "Renovación Popular (invitado)",
    partColor: "#ef4444",
    camara: "Senado",
    region: "Nacional",
    tags: ["Pymes / MYPE", "Finanzas / Crédito"],
    bio: "Exdirector de caja municipal. Experiencia directa en microfinanzas y crédito a pequeños negocios. Candidato invitado al Senado.",
    propuestas: [
      "Acceso a crédito real para micro y pequeñas empresas: conoce el sistema desde adentro",
      "Inclusión financiera para emprendedores sin historial crediticio formal",
    ],
    comoVotar: "En la cédula del Congreso (Senado): vota por el partido Renovación Popular a nivel nacional.",
    fuente: "https://rpp.pe/peru/actualidad/elecciones-2026-quienes-son-los-candidatos-invitados-al-senado-y-por-que-agrupacion-postularan-noticia-1669011",
    fuenteLabel: "RPP",
  },
  {
    nombre: "Luis Valdez Farías",
    partido: "Alianza para el Progreso",
    partColor: "#f59e0b",
    camara: "Senado",
    region: "Lima",
    tags: ["Pymes / MYPE", "Empleabilidad"],
    bio: "Excongreísta. Secretario General de APP. Candidato al Senado por Lima Metropolitana (lista #1).",
    propuestas: [
      "Fortalecer MYPE como motor económico de Lima: agenda legislativa concreta",
      "Cerrar brechas digitales: acceso a herramientas tecnológicas para pequeñas empresas",
    ],
    comoVotar: "Si vives en Lima Metropolitana: en la cédula del Congreso (Senado), vota por el partido Alianza para el Progreso.",
    fuente: "https://elcomercio.pe/politica/congreso/tribuna-electoral-las-propuestas-de-los-candidatos-luis-valdez-app-carla-garcia-apra-carlos-tuse-pais-para-todos-y-ricardo-perez-luyo-unidad-nacional-para-el-senado-elecciones-2026-noticia/",
    fuenteLabel: "El Comercio",
  },
  {
    nombre: "Jaime Delgado",
    partido: "Ahora Nación (invitado)",
    partColor: "#0ea5e9",
    camara: "Senado",
    region: "Nacional",
    tags: ["Emprendimiento", "Pymes / MYPE"],
    bio: "Fundador de ASPEC (Asociación Peruana de Consumidores y Usuarios). Referente en derechos del consumidor y simplificación regulatoria. Candidato invitado al Senado.",
    propuestas: [
      "Simplificación administrativa: eliminar burocracia que empuja a los negocios a la informalidad",
      "Reducir barreras para la formalización y el crecimiento de pequeñas empresas",
    ],
    comoVotar: "En la cédula del Congreso (Senado): vota por el partido Ahora Nación a nivel nacional.",
    fuente: "https://rpp.pe/peru/actualidad/elecciones-2026-quienes-son-los-candidatos-invitados-al-senado-y-por-que-agrupacion-postularan-noticia-1669011",
    fuenteLabel: "RPP",
  },
];

const ALL_TAGS: Tag[] = ["Emprendimiento", "Tecnología", "Pymes / MYPE", "Empleabilidad", "Innovación", "Finanzas / Crédito"];

const TAG_COLORS: Record<Tag, string> = {
  "Emprendimiento":    "bg-amber-500/10 text-amber-700 border-amber-400/30",
  "Tecnología":        "bg-indigo-500/10 text-indigo-700 border-indigo-400/30",
  "Pymes / MYPE":      "bg-emerald-500/10 text-emerald-700 border-emerald-400/30",
  "Empleabilidad":     "bg-blue-500/10 text-blue-700 border-blue-400/30",
  "Innovación":        "bg-purple-500/10 text-purple-700 border-purple-400/30",
  "Finanzas / Crédito":"bg-rose-500/10 text-rose-700 border-rose-400/30",
};

function Avatar({ nombre, color }: { nombre: string; color: string }) {
  const parts = nombre.trim().split(" ");
  const initials = ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0 ring-2 ring-background"
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

export default function CongresoLanding() {
  const [activeTag, setActiveTag] = useState<Tag | null>(null);

  const filtered = activeTag
    ? CANDIDATOS.filter((c) => c.tags.includes(activeTag))
    : CANDIDATOS;

  const senado = filtered.filter((c) => c.camara === "Senado");
  const diputados = filtered.filter((c) => c.camara === "Diputados");

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link href="/pe" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            CONDOR
          </Link>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Shield className="h-3 w-3 text-primary" />
            <span className="font-mono">condorlatam.com</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* Hero */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono text-primary">Perú · 12 de abril 2026</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            ¿Qué candidatos al Congreso proponen para los emprendedores?
          </h1>
          <p className="text-muted-foreground text-sm max-w-lg">
            Candidatos al Senado y Cámara de Diputados con propuestas concretas en emprendimiento, tecnología y pymes. Con instrucciones de cómo votar por cada uno.
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            {CANDIDATOS.length} candidatos verificados · fuentes: Caretas, El Comercio, RPP, Infobae, Panamericana
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTag(null)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
              activeTag === null
                ? "bg-foreground text-background border-foreground"
                : "text-muted-foreground border-border hover:text-foreground"
            )}
          >
            Todos ({CANDIDATOS.length})
          </button>
          {ALL_TAGS.map((tag) => {
            const n = CANDIDATOS.filter((c) => c.tags.includes(tag)).length;
            if (!n) return null;
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                  activeTag === tag
                    ? "bg-foreground text-background border-foreground"
                    : "text-muted-foreground border-border hover:text-foreground"
                )}
              >
                {tag} ({n})
              </button>
            );
          })}
        </div>

        {/* Diputados primero (más accionable: voto preferencial) */}
        {diputados.length > 0 && (
          <Section title="Cámara de Diputados" count={diputados.length}>
            {diputados.map((c) => <Card key={c.nombre} c={c} />)}
          </Section>
        )}

        {senado.length > 0 && (
          <Section title="Senado" count={senado.length}>
            {senado.map((c) => <Card key={c.nombre} c={c} />)}
          </Section>
        )}

        {filtered.length === 0 && (
          <p className="text-center py-12 text-muted-foreground text-sm">Sin candidatos con ese filtro.</p>
        )}

        {/* Footer note */}
        <p className="text-xs text-muted-foreground border-t border-border pt-4">
          Propuestas extraídas de planes de gobierno JNE y cobertura de medios verificados. No constituye endorsement.{" "}
          <a href="https://www.condorlatam.com/pe" className="text-primary hover:underline">CONDOR — Inteligencia Electoral con IA</a>
        </p>
      </main>
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-widest">{title}</h2>
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground font-mono tabular-nums">{count}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </section>
  );
}

function Card({ c }: { c: Candidato }) {
  return (
    <article className="rounded-xl border border-border bg-card p-5 hover:border-primary/20 transition-colors flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar nombre={c.nombre} color={c.partColor} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight">{c.nombre}</p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded text-white"
              style={{ backgroundColor: c.partColor }}
            >
              {c.partido}
            </span>
            <span className={cn(
              "text-[10px] font-mono px-1.5 py-0.5 rounded",
              c.camara === "Senado" ? "bg-indigo-500/10 text-indigo-600" : "bg-emerald-500/10 text-emerald-600"
            )}>
              {c.camara} · {c.region}
            </span>
          </div>
        </div>
      </div>

      {/* Bio */}
      <p className="text-xs text-muted-foreground leading-relaxed">{c.bio}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {c.tags.map((tag) => (
          <span key={tag} className={cn("text-[10px] px-2 py-0.5 rounded-full border font-medium", TAG_COLORS[tag])}>
            {tag}
          </span>
        ))}
      </div>

      {/* Proposals */}
      <ul className="space-y-1.5 flex-1">
        {c.propuestas.map((p, i) => (
          <li key={i} className="flex gap-2 text-xs text-muted-foreground">
            <span className="text-primary mt-0.5 flex-shrink-0">›</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>

      {/* How to vote */}
      <div className="rounded-lg bg-primary/5 border border-primary/15 px-3 py-2.5 flex gap-2">
        <Vote className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-xs text-foreground leading-relaxed">{c.comoVotar}</p>
      </div>

      {/* Source */}
      <a
        href={c.fuente}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
      >
        <ExternalLink className="h-3 w-3" />
        Fuente: {c.fuenteLabel}
      </a>
    </article>
  );
}
