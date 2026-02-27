import type { Metadata } from "next";
import { fetchTopCandidates } from "@/lib/data/candidates";
import { getCountrySeo, getCountryKeywords } from "@/lib/seo/metadata";
import { FAQPageJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { getCountryConfig } from "@/lib/config/countries";
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
    description: `Encuestas presidenciales ${seo.name} ${seo.year}: promedio ponderado de ${country === "co" ? "Invamer, Guarumo, CELAG, GAD3" : "Ipsos, Datum, CPI, IEP"} y más. ¿Quién va ganando? Actualizado cada 4 horas con IA.`,
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
  const candidates = await fetchTopCandidates(8, country);
  const config = getCountryConfig(country);
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
      answer: `CONDOR actualiza los promedios de encuestas cada 4 horas automáticamente con IA. Cuando una nueva encuesta es publicada por cualquier encuestadora, nuestro sistema la detecta y recalcula los promedios.`,
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
          { name: "CONDOR", url: `https://condorlatam.com/${country}` },
          { name: "Encuestas", url: `https://condorlatam.com/${country}/encuestas` },
        ]}
      />
      <FAQPageJsonLd questions={faqQuestions} />
      <EncuestasClient candidates={candidates} />
    </>
  );
}
