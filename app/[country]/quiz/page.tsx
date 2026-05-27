import type { Metadata } from "next";
import { fetchCandidates } from "@/lib/data/candidates";
import { isValidCountry, getCountryConfig, isInRunoffPhase, type CountryCode } from "@/lib/config/countries";
import { getCountrySeo, getCountryKeywords } from "@/lib/seo/metadata";
import { FAQPageJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { notFound } from "next/navigation";
import QuizClient from "./quiz-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const seo = getCountrySeo(country, "/quiz");

  return {
    title: `¿Por Quién Votar en ${seo.name} ${seo.year}? Quiz Electoral — Descubre tu Candidato`,
    description: `¿No sabes por quién votar en las elecciones de ${seo.name} ${seo.year}? Resuelve 10 preguntas y descubre qué candidato presidencial es más afín a tus ideas. Quiz gratuito con IA.`,
    keywords: getCountryKeywords(country, "quiz"),
    alternates: seo.alternates,
    openGraph: {
      ...seo.openGraph,
      title: `¿No sabes por quién votar en ${seo.name}? Resuelve este quiz`,
      description: `10 preguntas → ranking personalizado de candidatos ${seo.year}. Descubre con quién coincides más.`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `¿No sabes por quién votar en ${seo.name}? Resuelve este quiz`,
      description: `10 preguntas → ranking personalizado de candidatos ${seo.year}. Descubre con quién coincides más.`,
    },
  };
}

export const dynamic = "force-dynamic";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;

  if (!isValidCountry(country)) {
    notFound();
  }

  const allCandidates = await fetchCandidates(country);
  const config = getCountryConfig(country);
  const name = config?.name ?? "Perú";
  const year = config?.electionDate.slice(0, 4) ?? "2026";

  // When the country is in runoff phase, restrict the quiz to the two finalists
  // so the matching is a head-to-head ("which finalist represents you more?").
  const runoffActive = isInRunoffPhase(country as CountryCode) && config?.runoffCandidateSlugs;
  const candidates = runoffActive
    ? allCandidates.filter((c) => config!.runoffCandidateSlugs!.includes(c.slug))
    : allCandidates;

  const faqQuestions = [
    {
      question: `¿Cómo funciona el Quiz Electoral de CONDOR?`,
      answer: `El quiz consta de 10 preguntas sobre temas clave como economía, seguridad, educación, salud y derechos. Según tus respuestas, nuestro algoritmo calcula un porcentaje de compatibilidad con cada candidato presidencial de ${name} ${year} y te muestra un ranking personalizado.`,
    },
    {
      question: `¿El quiz electoral es confiable para decidir mi voto?`,
      answer: `El quiz es una herramienta orientativa basada en las posiciones públicas de los candidatos. Te ayuda a descubrir afinidades, pero recomendamos complementarlo revisando los perfiles completos, planes de gobierno y el verificador de hechos de CONDOR antes de tomar tu decisión.`,
    },
    {
      question: `¿Por quién votar en ${name} ${year}?`,
      answer: `La decisión del voto es personal. CONDOR ofrece herramientas para un voto informado: quiz electoral para descubrir afinidades, comparador de candidatos, encuestas actualizadas, verificador de hechos y análisis de planes de gobierno. Usa todas estas herramientas para tomar la mejor decisión.`,
    },
  ];

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "CONDOR", url: `https://www.condorlatam.com/${country}` },
          { name: "Quiz Electoral", url: `https://www.condorlatam.com/${country}/quiz` },
        ]}
      />
      <FAQPageJsonLd questions={faqQuestions} />
      <QuizClient candidates={candidates} runoffMode={!!runoffActive} />

      {country === "pe" && (
        <section className="mt-12 border-t border-border/30 pt-8 pb-4 max-w-3xl mx-auto">
          <h2 className="text-lg font-bold text-foreground mb-3">
            Quiz Electoral Perú 2026: Descubre por Quién Votar
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            ¿No sabes por quién votar en las elecciones presidenciales de Perú
            2026? El Quiz Electoral de CONDOR te ayuda a descubrir qué candidato
            se parece más a tus ideas. Responde 10 preguntas sobre los temas más
            importantes del debate electoral — economía, seguridad ciudadana,
            educación, salud, medio ambiente, reforma política, lucha contra la
            corrupción y derechos sociales — y nuestro algoritmo calculará tu
            porcentaje de compatibilidad con cada candidato presidencial
            inscrito.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            El test electoral es completamente anónimo y gratuito: no
            recopilamos datos personales ni almacenamos tus respuestas. El
            algoritmo de compatibilidad compara tus posiciones con las
            propuestas públicas y declaraciones verificadas de los candidatos,
            utilizando inteligencia artificial para mantener la información
            actualizada. Al terminar, obtienes un ranking personalizado con tu
            porcentaje de afinidad con cada candidato, que puedes compartir en
            redes sociales.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Este quiz es una herramienta orientativa para votantes indecisos.
            Recomendamos complementar los resultados revisando los perfiles
            completos de los candidatos, sus planes de gobierno y el verificador
            de hechos de CONDOR. Con más de 35 candidatos en la primera vuelta
            del 12 de abril de 2026, contar con herramientas de información
            electoral es clave para un voto consciente e informado.
          </p>
          <p className="text-xs text-muted-foreground/50 mt-4">
            Última actualización: marzo 2026. Quiz desarrollado por CONDOR AI
            con datos verificados de propuestas y declaraciones públicas.
          </p>
        </section>
      )}

      {country === "co" && (
        <section className="mt-12 border-t border-border/30 pt-8 pb-4 max-w-3xl mx-auto">
          <h2 className="text-lg font-bold text-foreground mb-3">
            Quiz Electoral Colombia 2026: Descubre por Quién Votar
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            ¿No sabes por quién votar en las elecciones presidenciales de
            Colombia 2026? El Quiz Electoral de CONDOR te ayuda a descubrir qué
            candidato se alinea más con tus ideas. Responde 10 preguntas sobre
            los temas centrales del debate colombiano — implementación del
            Acuerdo de Paz, seguridad ciudadana, reforma agraria, política
            económica, salud, educación, medio ambiente y lucha contra la
            corrupción — y nuestro algoritmo calculará tu porcentaje de
            compatibilidad con cada candidato presidencial, desde Iván Cepeda
            y Abelardo de la Espriella hasta Claudia López y Daniel Quintero.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            El test electoral es completamente anónimo y gratuito: no
            recopilamos datos personales ni almacenamos tus respuestas. El
            algoritmo de compatibilidad compara tus posiciones con las
            propuestas públicas y declaraciones verificadas de los candidatos
            colombianos, utilizando inteligencia artificial para mantener la
            información actualizada. Al terminar, obtienes un ranking
            personalizado con tu porcentaje de afinidad con cada candidato,
            que puedes compartir en redes sociales.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Este quiz es una herramienta orientativa para votantes indecisos
            en Colombia. Recomendamos complementar los resultados revisando los
            perfiles completos de los candidatos, sus planes de gobierno y el
            verificador de hechos de CONDOR. En un escenario político
            polarizado tras el gobierno de Gustavo Petro, contar con
            herramientas de información electoral es clave para un voto
            consciente e informado en las elecciones colombianas de 2026.
          </p>
          <p className="text-xs text-muted-foreground/50 mt-4">
            Última actualización: marzo 2026. Quiz desarrollado por CONDOR AI
            con datos verificados de propuestas y declaraciones públicas de
            candidatos colombianos.
          </p>
        </section>
      )}
    </>
  );
}
