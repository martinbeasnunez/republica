import type { Metadata } from "next";
import { fetchCandidates } from "@/lib/data/candidates";
import { getCountrySeo, getCountryKeywords } from "@/lib/seo/metadata";
import { FAQPageJsonLd, BreadcrumbJsonLd, ItemListJsonLd } from "@/components/seo/json-ld";
import { getCountryConfig, isInRunoffPhase, type CountryCode } from "@/lib/config/countries";
import { CandidatosClient } from "./candidatos-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const seo = getCountrySeo(country, "/candidatos");

  return {
    title: `Todos los Candidatos Presidenciales ${seo.name} ${seo.year} — Perfiles y Propuestas`,
    description: `Lista completa de candidatos presidenciales ${seo.name} ${seo.year}. Perfiles, propuestas, encuestas, comparador y análisis con IA. Encuentra tu candidato ideal.`,
    keywords: getCountryKeywords(country, "candidatos"),
    alternates: seo.alternates,
    openGraph: {
      ...seo.openGraph,
      title: `Candidatos Presidenciales ${seo.name} ${seo.year}`,
      description: `Todos los candidatos para las elecciones de ${seo.name} ${seo.year}. Compara propuestas, encuestas e ideología lado a lado.`,
      type: "website",
    },
  };
}

export const dynamic = "force-dynamic";

export default async function CandidatosPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const candidates = await fetchCandidates(country);
  const config = getCountryConfig(country);
  const name = config?.name ?? "Perú";
  const year = config?.electionDate.slice(0, 4) ?? "2026";

  const runoffActive = isInRunoffPhase(country as CountryCode) && config?.runoffCandidateSlugs;
  const runoffSlugs = runoffActive ? config!.runoffCandidateSlugs : undefined;
  const runoffDateLabel = runoffActive && config?.electionDateSecondRound
    ? new Date(config.electionDateSecondRound + "T12:00:00").toLocaleDateString("es-PE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : undefined;

  const faqQuestions = [
    {
      question: `¿Cuántos candidatos presidenciales hay en ${name} ${year}?`,
      answer: `Actualmente hay ${candidates.length} candidatos activos registrados para las elecciones presidenciales de ${name} ${year}. CONDOR monitorea a todos con datos actualizados de encuestas, propuestas y antecedentes.`,
    },
    {
      question: `¿Cómo comparar candidatos en ${name} ${year}?`,
      answer: `CONDOR ofrece un comparador interactivo donde puedes seleccionar 2 o más candidatos y comparar sus propuestas, encuestas, ideología y planes de gobierno lado a lado. También puedes hacer nuestro Quiz Electoral para descubrir con qué candidato coincides más.`,
    },
    {
      question: `¿Dónde ver las propuestas de los candidatos ${year}?`,
      answer: `En CONDOR puedes ver las propuestas de cada candidato organizadas por tema (economía, seguridad, educación, salud, etc.) tanto en el perfil individual de cada candidato como en la sección de Planes de Gobierno.`,
    },
  ];

  // Build ItemList for Google rich results
  const candidateItems = candidates.map((c, i) => ({
    name: `${c.name} — ${c.party}`,
    url: `https://www.condorlatam.com/${country}/candidatos/${c.slug}`,
    position: i + 1,
  }));

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "CONDOR", url: `https://www.condorlatam.com/${country}` },
          { name: "Candidatos", url: `https://www.condorlatam.com/${country}/candidatos` },
        ]}
      />
      <ItemListJsonLd
        name={`Candidatos Presidenciales ${name} ${year}`}
        items={candidateItems}
      />
      <FAQPageJsonLd questions={faqQuestions} />
      <CandidatosClient candidates={candidates} runoffSlugs={runoffSlugs} runoffDateLabel={runoffDateLabel} />

      {country === "pe" && (
        <section className="mt-12 border-t border-border/30 pt-8 pb-4 max-w-3xl">
          <h2 className="text-lg font-bold text-foreground mb-3">
            Candidatos Presidenciales Perú 2026: Guía Completa
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Las elecciones generales de Perú 2026 cuentan con más de 35
            candidatos presidenciales inscritos ante el Jurado Nacional de
            Elecciones (JNE), convirtiendo esta contienda en una de las más
            competitivas de la historia reciente del país. Entre los principales
            aspirantes se encuentran figuras de todo el espectro político, desde
            partidos tradicionales hasta movimientos regionales e independientes.
            CONDOR ofrece perfiles detallados de cada candidato, incluyendo su
            trayectoria, propuestas de gobierno, posición ideológica y
            desempeño en las encuestas.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            El sistema electoral peruano establece que la primera vuelta se
            celebrará el 12 de abril de 2026. Si ningún candidato obtiene más
            del 50% de los votos válidos, los dos candidatos con mayor votación
            pasarán a una segunda vuelta (ballotage). Junto con la presidencia,
            los peruanos elegirán a 130 congresistas y 5 representantes ante el
            Parlamento Andino. En un contexto de alta fragmentación y
            desconfianza ciudadana, informarse sobre cada candidato es
            fundamental para ejercer un voto responsable.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            CONDOR utiliza inteligencia artificial para monitorear y actualizar
            diariamente la información de todos los candidatos: posiciones en
            encuestas, apariciones en medios, propuestas clave y alertas
            relevantes. Además, el comparador interactivo permite contrastar
            candidatos lado a lado por ideología, propuestas y encuestas,
            facilitando una decisión electoral informada.
          </p>
          <p className="text-xs text-muted-foreground/50 mt-4">
            Última actualización: marzo 2026. Información compilada por CONDOR
            AI con datos del JNE, medios nacionales y encuestadoras.
          </p>
        </section>
      )}

      {country === "co" && (
        <section className="mt-12 border-t border-border/30 pt-8 pb-4 max-w-3xl">
          <h2 className="text-lg font-bold text-foreground mb-3">
            Candidatos Presidenciales Colombia 2026: Guía Completa
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Las elecciones presidenciales de Colombia 2026 marcan un momento
            decisivo tras el gobierno de Gustavo Petro. La contienda reúne
            candidatos de todo el espectro político: Iván Cepeda por el Pacto
            Histórico busca dar continuidad a las reformas sociales, Abelardo
            de la Espriella lidera desde Colombia Justa Libres con un
            discurso de orden y seguridad, Paloma Valencia representa
            al Centro Democrático, Sergio Fajardo encabeza Dignidad y
            Compromiso desde el centro, Claudia López lidera Imparables, Roy
            Barreras concurre por La Fuerza de la Paz, Vicky Dávila desde
            Movimiento Valientes y Daniel Quintero compite por AICO. CONDOR
            ofrece perfiles detallados de cada candidato, incluyendo su trayectoria
            política, propuestas de gobierno, posición ideológica y desempeño
            en las encuestas.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            El sistema electoral colombiano establece que si ningún candidato
            obtiene más del 50% de los votos válidos en primera vuelta, los
            dos candidatos con mayor votación pasarán a un balotaje. Junto con
            la presidencia, los colombianos elegirán vicepresidente en fórmula
            única. En un contexto de polarización política y debates sobre la
            implementación del Acuerdo de Paz, la reforma agraria, la
            seguridad ciudadana y la política económica, informarse sobre cada
            candidato es fundamental para ejercer un voto responsable.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            CONDOR utiliza inteligencia artificial para monitorear y actualizar
            diariamente la información de todos los candidatos presidenciales
            de Colombia: posiciones en encuestas, apariciones en medios,
            propuestas clave y alertas relevantes. El comparador interactivo
            permite contrastar candidatos lado a lado por ideología, propuestas
            y encuestas, facilitando una decisión electoral informada.
          </p>
          <p className="text-xs text-muted-foreground/50 mt-4">
            Última actualización: marzo 2026. Información compilada por CONDOR
            AI con datos de la Registraduría Nacional, medios colombianos y
            encuestadoras.
          </p>
        </section>
      )}
    </>
  );
}
