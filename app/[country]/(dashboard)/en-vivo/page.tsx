import type { Metadata } from "next";
import { fetchCandidates, fetchTopCandidates } from "@/lib/data/candidates";
import { fetchArticles } from "@/lib/data/news";
import { fetchFactChecks } from "@/lib/data/fact-checks";
import { getCountrySeo, getCountryKeywords } from "@/lib/seo/metadata";
import { getSupabase } from "@/lib/supabase";
import { EnVivoClient } from "./en-vivo-client";
import type { HomepageBlock } from "@/lib/types/homepage-blocks";
import type { PublicBriefing } from "../page";
import { getActiveEvent, getNextEvent, getUpcomingEvents, type CountryCode } from "@/lib/config/countries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const seo = getCountrySeo(country, "/en-vivo");

  return {
    title: `Cobertura en Vivo — Elecciones ${seo.name} ${seo.year}`,
    description: `Seguimiento en vivo de las elecciones ${seo.name} ${seo.year}. Noticias, verificaciones, encuestas y cobertura completa en tiempo real.`,
    keywords: getCountryKeywords(country, "en-vivo"),
    alternates: seo.alternates,
    openGraph: {
      ...seo.openGraph,
      title: `En Vivo — Elecciones ${seo.name} ${seo.year}`,
      description: `Cobertura en tiempo real de las elecciones ${seo.name} ${seo.year}.`,
      type: "website",
    },
  };
}

export const dynamic = "force-dynamic";

async function fetchLatestBriefing(country: string): Promise<PublicBriefing | null> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("brain_briefings")
      .select("editorial_summary, briefing_date, top_stories, poll_movements, health_status")
      .eq("country_code", country)
      .order("briefing_date", { ascending: false })
      .limit(1);

    if (!data || data.length === 0) return null;

    const row = data[0];
    const briefing = row as PublicBriefing;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const healthStatus = (row as any).health_status;
    if (healthStatus?.key_takeaways) {
      briefing.key_takeaways = healthStatus.key_takeaways;
    }
    if (healthStatus?.timeline) {
      briefing.timeline = healthStatus.timeline;
    }
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const briefingDate = new Date(briefing.briefing_date + "T12:00:00");
    const ageMs = now.getTime() - briefingDate.getTime();
    briefing._ageHours = Math.floor(ageMs / (1000 * 60 * 60));
    briefing._isToday = briefing.briefing_date === todayStr;

    return briefing;
  } catch {
    return null;
  }
}

async function fetchHomepageBlocks(country: string): Promise<HomepageBlock[]> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("homepage_blocks")
      .select("id, country_code, block_type, position, title, subtitle, content, click_count, is_active, created_at, expires_at")
      .eq("country_code", country)
      .eq("is_active", true)
      .gt("expires_at", new Date().toISOString())
      .order("position", { ascending: true })
      .limit(6);

    return (data as HomepageBlock[]) || [];
  } catch {
    return [];
  }
}

export default async function EnVivoPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const countryCode = country as CountryCode;

  const [candidates, topCandidates, articles, factChecks, briefing, homepageBlocks, pulses] = await Promise.all([
    fetchCandidates(country),
    fetchTopCandidates(8, country),
    fetchArticles(country),
    fetchFactChecks(200, country),
    fetchLatestBriefing(country),
    fetchHomepageBlocks(country),
    fetchPulses(country, 12),
  ]);

  const activeEvent = getActiveEvent(countryCode);
  const nextEvent = getNextEvent(countryCode);
  const upcomingEvents = getUpcomingEvents(countryCode);

  return (
    <EnVivoClient
      candidates={candidates}
      topCandidates={topCandidates}
      articles={articles}
      factChecks={factChecks}
      briefing={briefing}
      homepageBlocks={homepageBlocks}
      activeEvent={activeEvent}
      nextEvent={nextEvent}
      upcomingEvents={upcomingEvents}
      pulses={pulses}
    />
  );
}

async function fetchPulses(country: string, limit = 12) {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("pulse_updates")
      .select("id, generated_at, summary, metrics, phase")
      .eq("country_code", country)
      .order("generated_at", { ascending: false })
      .limit(limit);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[]) ?? [];
  } catch {
    return [];
  }
}
