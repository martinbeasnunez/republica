import type { Metadata } from "next";
import { fetchTopCandidates } from "@/lib/data/candidates";
import { getCountrySeo, getCountryKeywords } from "@/lib/seo/metadata";
import { FAQPageJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { getCountryConfig, isInRunoffPhase, type CountryCode } from "@/lib/config/countries";
import EncuestasClient from "./encuestas-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const seo = getCountrySeo(country, "/encuestas");

  return {
    title: `Encuestas Presidenciales ${seo.name} ${seo.year} — Promedio Actualizado`,
    description: `Encuestas presidenciales ${seo.name} ${seo.year}: promedio ponderado de ${country === "co" ? "Invamer, Guarumo, CELAG, GAD3, AtlasIntel, CNC" : "Ipsos, Datum, CPI, IEP"} y más. ¿Quién va ganando? Actualizado diariamente con IA.`,
    keywords: getCountryKeywords(country, "encuestas"),
    alternates: seo.alternates,
    openGraph: {
      ...seo.openGraph,
      title: `Encuestas ${seo.name} ${seo.year} — ¿Quién va ganando?`,
      description: `Promedio ponderado de todas las encuestadoras para elecciones ${seo.name} ${seo.year}. Tendencias, margen de error y análisis.`,
      type: "website",
    },
  };
}

export const dynamic = "force-dynamic";

export default async function EncuestasPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const candidates = await fetchTopCandidates(15, country);
  const config = getCountryConfig(country);
  const runoffSlugs = isInRunoffPhase(country as CountryCode) && config?.runoffCandidateSlugs
    ? config.runoffCandidateSlugs
    : undefined;
  const name = config?.name ?? "Perú";
  const year = config?.electionDate.slice(0, 4) ?? "2026";
  const pollsters =
    country === "co"
      ? "Invamer, Guarumo, CELAG, GAD3, Datexco y CNC"
      : "Ipsos, Datum, CPI, IEP, Vox Populi y GfK";

  const faqQuestions = [
    {
      question: `¿Quién va ganando las encuestas en ${name} ${year}?`,
      answer: `CONDOR calcula un promedio ponderado de múltiples encuestadoras (${pollsters}) usando un modelo de recencia que da más peso a las encuestas más recientes. Consulta los resultados actualizados en condorlatam.com/${country}/encuestas.`,
    },
    {
      question: `¿Cómo se calcula el promedio de encuestas en CONDOR?`,
      answer: `Usamos un promedio ponderado por recencia: las encuestas de los últimos 7 días tienen 50% del peso, las de 8-14 días tienen 30%, y las de 15-30 días tienen 20%. Encuestas de más de 30 días son excluidas. Además mostramos el margen de error (±2.5pp) y detectamos empates técnicos.`,
    },
    {
      question: `¿Cada cuánto se actualizan las encuestas?`,
      answer: `CONDOR actualiza los promedios de encuestas diariamente con IA. Cada día nuestro sistema verifica si hay nuevas encuestas publicadas por las encuestadoras seguidas y recalcula los promedios ponderados automáticamente.`,
    },
    {
      question: `¿Cuándo son las elecciones presidenciales en ${name} ${year}?`,
      answer: `La primera vuelta de las elecciones presidenciales en ${name} está programada para el ${config?.electionDate ? new Date(config.electionDate + "T12:00:00").toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" }) : year}. Si ningún candidato supera el 50% de los votos, habrá segunda vuelta.`,
    },
  ];

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "CONDOR", url: `https://www.condorlatam.com/${country}` },
          { name: "Encuestas", url: `https://www.condorlatam.com/${country}/encuestas` },
        ]}
      />
      <FAQPageJsonLd questions={faqQuestions} />
      <EncuestasClient candidates={candidates} runoffSlugs={runoffSlugs} />

      {country === "pe" && (
        <section className="mt-12 border-t border-border/30 pt-8 pb-4 max-w-3xl">
          <h2 className="text-lg font-bold text-foreground mb-3">
            Encuestas Presidenciales Perú 2026: Intención de Voto Actualizada
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            CONDOR recopila y analiza diariamente las encuestas de intención de
            voto para las elecciones presidenciales de Perú 2026. Nuestro modelo
            de promedio ponderado integra datos de las principales encuestadoras
            del país — Datum, Ipsos, IEP, CPI, Vox Populi y GfK — aplicando un
            sistema de recencia que otorga mayor peso a los estudios más
            recientes. Las encuestas de los últimos 7 días representan el 50%
            del promedio, las de 8 a 14 días el 30%, y las de 15 a 30 días el
            20% restante. Estudios con más de 30 días de antigüedad se excluyen
            automáticamente para mantener la relevancia de los datos.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Con más de 35 candidatos inscritos para la primera vuelta del 13 de
            abril de 2026, el panorama electoral peruano es uno de los más
            fragmentados de la región. CONDOR muestra quién va ganando en las
            encuestas, identifica empates técnicos considerando el margen de
            error estándar de ±2.5 puntos porcentuales, y detecta tendencias
            al alza o a la baja de cada candidato. Si ningún candidato supera
            el 50% de los votos válidos en primera vuelta, los dos más votados
            pasarán a una segunda vuelta electoral.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Todas las cifras se actualizan automáticamente mediante inteligencia
            artificial. CONDOR AI verifica cada nueva encuesta publicada,
            contrasta las fuentes y recalcula los promedios sin intervención
            manual, garantizando transparencia y objetividad en el seguimiento
            de la carrera presidencial peruana.
          </p>
          <p className="text-xs text-muted-foreground/50 mt-4">
            Datos procesados por CONDOR AI con información de Datum, Ipsos, IEP,
            CPI, Vox Populi y GfK.
          </p>
        </section>
      )}

      {country === "co" && (
        <section className="mt-12 border-t border-border/30 pt-8 pb-4 max-w-3xl">
          <h2 className="text-lg font-bold text-foreground mb-3">
            Encuestas Presidenciales Colombia 2026: Intención de Voto Actualizada
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            CONDOR recopila y analiza diariamente las encuestas de intención de
            voto para las elecciones presidenciales de Colombia 2026. Nuestro
            modelo de promedio ponderado integra datos de las encuestadoras más
            reconocidas del país — Invamer, CNC, Guarumo, AtlasIntel, CELAG y
            GAD3 — aplicando un sistema de recencia que otorga mayor peso a los
            estudios más recientes. Las encuestas de los últimos 7 días
            representan el 50% del promedio, las de 8 a 14 días el 30%, y las
            de 15 a 30 días el 20% restante. Estudios con más de 30 días de
            antigüedad se excluyen automáticamente para garantizar la vigencia
            de los datos.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            La carrera presidencial colombiana de 2026 se perfila como una de
            las más disputadas en años recientes, con candidatos como Iván
            Cepeda (Pacto Histórico), Abelardo de la Espriella (Colombia Justa
            Libres), Paloma Valencia (Centro Democrático), Sergio Fajardo
            (Dignidad y Compromiso), Claudia López (Imparables), Roy Barreras
            (La Fuerza de la Paz), Vicky Dávila (Movimiento Valientes) y Daniel
            Quintero (AICO) liderando las preferencias. CONDOR muestra quién va ganando en las encuestas
            presidenciales de Colombia, identifica empates técnicos
            considerando el margen de error estándar de ±2.5 puntos
            porcentuales, y detecta tendencias al alza o a la baja. Si ningún
            candidato supera el 50% de los votos válidos en primera vuelta,
            los dos más votados pasarán a un balotaje.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Todas las cifras se actualizan automáticamente mediante inteligencia
            artificial. CONDOR AI verifica cada nueva encuesta publicada,
            contrasta las fuentes y recalcula los promedios sin intervención
            manual, garantizando transparencia y objetividad en el seguimiento
            de la carrera presidencial colombiana.
          </p>
          <p className="text-xs text-muted-foreground/50 mt-4">
            Datos procesados por CONDOR AI con información de Invamer, CNC,
            Guarumo, Datexco, CELAG, GAD3 y AtlasIntel.
          </p>
        </section>
      )}
    </>
  );
}
