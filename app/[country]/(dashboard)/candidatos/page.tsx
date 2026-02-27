import type { Metadata } from "next";
import { fetchCandidates } from "@/lib/data/candidates";
import { getCountrySeo, getCountryKeywords } from "@/lib/seo/metadata";
import { FAQPageJsonLd, BreadcrumbJsonLd, ItemListJsonLd } from "@/components/seo/json-ld";
import { getCountryConfig } from "@/lib/config/countries";
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
    url: `https://condorlatam.com/${country}/candidatos/${c.slug}`,
    position: i + 1,
  }));

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "CONDOR", url: `https://condorlatam.com/${country}` },
          { name: "Candidatos", url: `https://condorlatam.com/${country}/candidatos` },
        ]}
      />
      <ItemListJsonLd
        name={`Candidatos Presidenciales ${name} ${year}`}
        items={candidateItems}
      />
      <FAQPageJsonLd questions={faqQuestions} />
      <CandidatosClient candidates={candidates} />
    </>
  );
}
