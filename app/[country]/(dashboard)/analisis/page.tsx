import type { Metadata } from "next";
import { getCountryConfig } from "@/lib/config/countries";
import { getCountrySeo } from "@/lib/seo/metadata";
import { getSupabase } from "@/lib/supabase";
import AnalisisListClient from "./analisis-list-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const config = getCountryConfig(country);
  const name = config?.name ?? "Latinoamérica";
  const seo = getCountrySeo(country);

  return {
    title: `Análisis Electoral Diario — ${name} 2026 | CONDOR AI`,
    description: `Análisis electoral diario generado con inteligencia artificial para las elecciones de ${name} 2026. Resumen de encuestas, noticias clave y movimientos políticos.`,
    keywords: [
      `análisis electoral ${name.toLowerCase()} 2026`,
      `resumen elecciones ${name.toLowerCase()}`,
      `noticias electorales ${name.toLowerCase()} hoy`,
      "inteligencia artificial elecciones",
      "CONDOR AI análisis",
    ],
    alternates: {
      canonical: `https://www.condorlatam.com/${country}/analisis`,
      languages: {
        "es-PE": "https://www.condorlatam.com/pe/analisis",
        "es-CO": "https://www.condorlatam.com/co/analisis",
        "x-default": "https://www.condorlatam.com/pe/analisis",
      },
    },
    openGraph: {
      ...seo.openGraph,
      title: `Análisis Electoral Diario — ${name} 2026 | CONDOR AI`,
      description: `Análisis electoral diario con IA. Resumen de encuestas, noticias y movimientos en ${name} 2026.`,
      type: "website",
    },
  };
}

interface BriefingSummary {
  briefing_date: string;
  editorial_summary: string;
}

async function fetchAllBriefings(country: string): Promise<BriefingSummary[]> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("brain_briefings")
      .select("briefing_date, editorial_summary")
      .eq("country_code", country)
      .not("editorial_summary", "is", null)
      .order("briefing_date", { ascending: false })
      .limit(30);

    return (data as BriefingSummary[]) || [];
  } catch {
    return [];
  }
}

export default async function AnalisisListPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const briefings = await fetchAllBriefings(country);

  return <AnalisisListClient briefings={briefings} />;
}
