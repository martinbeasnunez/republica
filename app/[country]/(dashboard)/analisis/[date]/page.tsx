import type { Metadata } from "next";
import { getCountryConfig } from "@/lib/config/countries";
import { getCountrySeo } from "@/lib/seo/metadata";
import { getSupabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import AnalisisClient from "./analisis-client";

export const dynamic = "force-dynamic";

interface BriefingRow {
  editorial_summary: string;
  briefing_date: string;
  top_stories: Array<{
    title: string;
    summary: string;
    source: string;
    impact_score: number;
  }>;
  poll_movements: Array<{
    candidate: string;
    previous: number;
    current: number;
    direction: "up" | "down" | "stable";
  }> | null;
}

async function fetchBriefing(country: string, date: string): Promise<BriefingRow | null> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("brain_briefings")
      .select("editorial_summary, briefing_date, top_stories, poll_movements")
      .eq("country_code", country)
      .eq("briefing_date", date)
      .limit(1);

    if (!data || data.length === 0) return null;
    return data[0] as BriefingRow;
  } catch {
    return null;
  }
}

async function fetchAdjacentDates(country: string, date: string) {
  try {
    const supabase = getSupabase();

    const [{ data: prev }, { data: next }] = await Promise.all([
      supabase
        .from("brain_briefings")
        .select("briefing_date")
        .eq("country_code", country)
        .lt("briefing_date", date)
        .order("briefing_date", { ascending: false })
        .limit(1),
      supabase
        .from("brain_briefings")
        .select("briefing_date")
        .eq("country_code", country)
        .gt("briefing_date", date)
        .order("briefing_date", { ascending: true })
        .limit(1),
    ]);

    return {
      prevDate: prev?.[0]?.briefing_date || null,
      nextDate: next?.[0]?.briefing_date || null,
    };
  } catch {
    return { prevDate: null, nextDate: null };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; date: string }>;
}): Promise<Metadata> {
  const { country, date } = await params;
  const config = getCountryConfig(country);
  const name = config?.name ?? "Latinoamérica";
  const seo = getCountrySeo(country);

  const dateFormatted = new Date(date + "T12:00:00").toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const briefing = await fetchBriefing(country, date);
  const firstSentence = briefing?.editorial_summary
    ? briefing.editorial_summary.split(". ").slice(0, 2).join(". ") + "."
    : `Análisis electoral con IA para ${name}.`;

  return {
    title: `Análisis Electoral ${name} — ${dateFormatted}`,
    description: firstSentence.slice(0, 160),
    keywords: [
      `elecciones ${name.toLowerCase()} 2026`,
      `análisis electoral ${name.toLowerCase()}`,
      `encuestas ${name.toLowerCase()} hoy`,
      `candidatos ${name.toLowerCase()} 2026`,
      `noticias elecciones ${name.toLowerCase()}`,
      "inteligencia artificial elecciones",
      "CONDOR AI",
    ],
    alternates: {
      canonical: `https://www.condorlatam.com/${country}/analisis/${date}`,
      languages: {
        "es-PE": `https://www.condorlatam.com/pe/analisis/${date}`,
        "es-CO": `https://www.condorlatam.com/co/analisis/${date}`,
        "x-default": `https://www.condorlatam.com/pe/analisis/${date}`,
      },
    },
    openGraph: {
      ...seo.openGraph,
      title: `Análisis Electoral ${name} — ${dateFormatted} | CONDOR AI`,
      description: firstSentence.slice(0, 160),
      type: "article",
    },
  };
}

export default async function AnalisisPage({
  params,
}: {
  params: Promise<{ country: string; date: string }>;
}) {
  const { country, date } = await params;

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    notFound();
  }

  const [briefing, adjacent] = await Promise.all([
    fetchBriefing(country, date),
    fetchAdjacentDates(country, date),
  ]);

  if (!briefing || !briefing.editorial_summary) {
    notFound();
  }

  return (
    <AnalisisClient
      briefing={briefing}
      prevDate={adjacent.prevDate}
      nextDate={adjacent.nextDate}
    />
  );
}
