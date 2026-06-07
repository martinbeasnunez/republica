import type { Metadata } from "next";
import { fetchCandidates, fetchTopCandidates } from "@/lib/data/candidates";
import { fetchArticles } from "@/lib/data/news";
import { fetchFactChecks } from "@/lib/data/fact-checks";
import { getCountrySeo, getCountryKeywords } from "@/lib/seo/metadata";
import { getSupabase } from "@/lib/supabase";
import HomeClient from "./home-client";
import { EnVivoClient } from "./en-vivo/en-vivo-client";
import { RunoffHomeClient } from "./runoff-home-client";
import type { HomepageBlock } from "@/lib/types/homepage-blocks";
import { getActiveEvent, getNextEvent, getRecentEvent, getUpcomingEvents, getCountryConfig, isInRunoffPhase, type CountryCode } from "@/lib/config/countries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const countryCode = country as CountryCode;
  const seo = getCountrySeo(country);

  if (isInRunoffPhase(countryCode)) {
    return {
      title: `Segunda Vuelta — Elecciones ${seo.name} ${seo.year}`,
      description: `Balotaje ${seo.name} ${seo.year}: Keiko Fujimori vs Roberto Sánchez. Encuestas, propuestas comparadas, cobertura y verificación con IA — CONDOR.`,
      keywords: getCountryKeywords(country, "home"),
      alternates: seo.alternates,
      openGraph: {
        ...seo.openGraph,
        title: `Segunda Vuelta — Elecciones ${seo.name} ${seo.year}`,
        description: `Balotaje ${seo.name} ${seo.year}: head-to-head, encuestas y comparador de propuestas. CONDOR — Inteligencia Electoral.`,
        type: "website",
      },
    };
  }

  if (shouldUseLiveHome(countryCode)) {
    return {
      title: `Resultados en Vivo — Elecciones ${seo.name} ${seo.year}`,
      description: `Seguimiento en vivo de las elecciones ${seo.name} ${seo.year}. Resultados oficiales, conteo de votos y cobertura en tiempo real.`,
      keywords: getCountryKeywords(country, "en-vivo"),
      alternates: seo.alternates,
      openGraph: {
        ...seo.openGraph,
        title: `Resultados en Vivo — Elecciones ${seo.name} ${seo.year}`,
        description: `Cobertura en tiempo real de las elecciones ${seo.name} ${seo.year}. CONDOR — Inteligencia Electoral.`,
        type: "website",
      },
    };
  }

  return {
    title: `Elecciones ${seo.name} ${seo.year} — Candidatos, Encuestas y Noticias`,
    description: `Resumen rápido elecciones ${seo.name} ${seo.year}. ¿Quién va ganando? Conoce a los candidatos, mira las encuestas y descubre por quién votar. Información verificada con IA.`,
    keywords: getCountryKeywords(country, "home"),
    alternates: seo.alternates,
    openGraph: {
      ...seo.openGraph,
      title: `Elecciones ${seo.name} ${seo.year} — Candidatos, Encuestas y Noticias`,
      description: `¿Quién va ganando? Conoce a los candidatos, mira las encuestas y descubre por quién votar. CONDOR — Inteligencia Electoral.`,
      type: "website",
    },
  };
}

export const dynamic = "force-dynamic";

// ── Briefing type (matches brain_briefings table) ──
export interface PublicBriefing {
  editorial_summary: string;
  briefing_date: string;
  top_stories: Array<{
    title: string;
    summary: string;
    source: string;
    impact_score: number;
  }>;
  poll_movements?: Array<{
    candidate: string;
    previous: number;
    current: number;
    direction: "up" | "down" | "stable";
  }>;
  /** AI-generated key takeaways (on election day: 5 insights for each category) */
  key_takeaways?: string[];
  /** Parsed timeline entries from live news coverage */
  timeline?: Array<{ time: string; text: string; source: string }>;
  /** How many hours ago the briefing was generated */
  _ageHours?: number;
  /** Whether the briefing is from today */
  _isToday?: boolean;
}

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
    // Extract key_takeaways from health_status (stored there on election day)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const healthStatus = (row as any).health_status;
    if (healthStatus?.key_takeaways) {
      briefing.key_takeaways = healthStatus.key_takeaways;
    }
    if (healthStatus?.timeline) {
      briefing.timeline = healthStatus.timeline;
    }

    // Compute staleness metadata
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

/** Fetch the N most recent briefings (today first), for the runoff "Pulso" timeline. */
async function fetchRecentBriefings(country: string, limit = 3): Promise<PublicBriefing[]> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("brain_briefings")
      .select("editorial_summary, briefing_date, top_stories, poll_movements, health_status")
      .eq("country_code", country)
      .order("briefing_date", { ascending: false })
      .limit(limit);
    if (!data || data.length === 0) return [];
    const todayStr = new Date().toISOString().split("T")[0];
    return data.map((row) => {
      const briefing = row as PublicBriefing;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const healthStatus = (row as any).health_status;
      if (healthStatus?.key_takeaways) briefing.key_takeaways = healthStatus.key_takeaways;
      if (healthStatus?.timeline) briefing.timeline = healthStatus.timeline;
      const briefingDate = new Date(briefing.briefing_date + "T12:00:00");
      const ageMs = Date.now() - briefingDate.getTime();
      briefing._ageHours = Math.floor(ageMs / (1000 * 60 * 60));
      briefing._isToday = briefing.briefing_date === todayStr;
      return briefing;
    });
  } catch {
    return [];
  }
}

/** Fetch the N most recent CONDOR AI pulses for the home Pulse feed. */
export interface PublicPulse {
  id: string;
  generated_at: string;
  summary: string;
  metrics: Record<string, unknown> | null;
  phase: string | null;
}
async function fetchPulses(country: string, limit = 12): Promise<PublicPulse[]> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("pulse_updates")
      .select("id, generated_at, summary, metrics, phase")
      .eq("country_code", country)
      .order("generated_at", { ascending: false })
      .limit(limit);
    return (data as PublicPulse[]) ?? [];
  } catch {
    return [];
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

// Check if we're in the post-election results window for a country
// Window: election day + 7 days (while official count is still in progress).
// Considers both the first round date and the runoff date if defined.
function isElectionWindow(countryCode: CountryCode): boolean {
  const config = getCountryConfig(countryCode);
  if (!config) return false;
  const tz = countryCode === "pe" ? "America/Lima" : "America/Bogota";
  const localDate = new Date().toLocaleDateString("en-CA", { timeZone: tz });
  const localDateObj = new Date(localDate + "T12:00:00");
  const targets = [config.electionDate, config.electionDateSecondRound].filter(Boolean) as string[];
  for (const d of targets) {
    const electionDate = new Date(d + "T12:00:00");
    const daysDiff = Math.floor((localDateObj.getTime() - electionDate.getTime()) / 86400000);
    // Window: 7 days BEFORE the election (víspera coverage) through 7 days AFTER (results)
    if (daysDiff >= -7 && daysDiff <= 7) return true;
  }
  return false;
}

function shouldUseLiveHome(countryCode: CountryCode): boolean {
  return isElectionWindow(countryCode);
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const countryCode = country as CountryCode;

  // Runoff mode: between the first round and the runoff, the home is 100%
  // a head-to-head of the two finalists. ONPE first-round results stay on /en-vivo.
  if (isInRunoffPhase(countryCode)) {
    const config = getCountryConfig(countryCode);
    const runoffSlugs = config?.runoffCandidateSlugs;
    if (runoffSlugs) {
      const [candidates, articles, briefings] = await Promise.all([
        fetchCandidates(country),
        fetchArticles(country),
        fetchRecentBriefings(country, 3),
      ]);
      const bySlug = new Map(candidates.map((c) => [c.slug, c]));
      const a = bySlug.get(runoffSlugs[0]);
      const b = bySlug.get(runoffSlugs[1]);
      if (a && b) {
        return (
          <RunoffHomeClient
            finalists={[a, b]}
            articles={articles}
            candidatesForPhotos={candidates}
            briefings={briefings}
          />
        );
      }
    }
  }

  // Live mode: show full coverage hub as homepage during election week
  // (first round or runoff day + 7d).
  if (shouldUseLiveHome(countryCode)) {
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

  const [candidates, topCandidates, articles, factChecks, briefing, homepageBlocks] = await Promise.all([
    fetchCandidates(country),
    fetchTopCandidates(5, country),
    fetchArticles(country),
    fetchFactChecks(200, country),
    fetchLatestBriefing(country),
    fetchHomepageBlocks(country),
  ]);

  const activeEvent = getActiveEvent(countryCode);
  const nextEvent = getNextEvent(countryCode);
  const recentEvent = getRecentEvent(countryCode);

  return (
    <HomeClient
      candidates={candidates}
      topCandidates={topCandidates}
      articles={articles}
      factChecks={factChecks}
      briefing={briefing}
      homepageBlocks={homepageBlocks}
      activeEvent={activeEvent}
      nextEvent={nextEvent}
      recentEvent={recentEvent}
    />
  );
}
