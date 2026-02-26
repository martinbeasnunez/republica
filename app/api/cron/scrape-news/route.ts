import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getRssFeeds } from "@/lib/scraper/rss-sources";
import { fetchAllFeeds, type RawArticle } from "@/lib/scraper/fetch-rss";
import {
  classifyArticle,
  generateArticleId,
  type PollDataExtracted,
} from "@/lib/scraper/classify-article";
import { COUNTRY_CODES, type CountryCode } from "@/lib/config/countries";

/** Max new articles to classify per run per country (controls OpenAI costs) */
const MAX_NEW_ARTICLES = 20;

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // ─── Auth ────────────────────────────────────────────────
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ─── Country param: ?country=pe or ?country=co ────────────
  const countryParam = request.nextUrl.searchParams.get("country") as CountryCode | null;
  const countries = countryParam && COUNTRY_CODES.includes(countryParam)
    ? [countryParam]
    : COUNTRY_CODES;

  const allStats: Record<string, object> = {};

  for (const countryCode of countries) {
    const stats = await scrapeCountry(countryCode);
    allStats[countryCode] = stats;
  }

  return NextResponse.json({ success: true, stats: allStats });
}

async function scrapeCountry(countryCode: CountryCode) {
  const startTime = Date.now();
  const stats = {
    country: countryCode,
    feeds_fetched: 0,
    raw_articles: 0,
    already_exists: 0,
    classified: 0,
    not_electoral: 0,
    inserted: 0,
    polls_extracted: 0,
    polls_inserted: 0,
    candidates_updated: 0,
    errors: 0,
    duration_ms: 0,
  };

  try {
    // ─── 1. Fetch RSS feeds for this country ────────────────
    const feeds = getRssFeeds(countryCode);
    console.log(`[scrape-news][${countryCode}] Fetching ${feeds.length} feeds...`);
    const rawArticles = await fetchAllFeeds(feeds);
    stats.feeds_fetched = feeds.length;
    stats.raw_articles = rawArticles.length;
    console.log(`[scrape-news][${countryCode}] Got ${rawArticles.length} raw articles`);

    if (rawArticles.length === 0) {
      stats.duration_ms = Date.now() - startTime;
      return stats;
    }

    // ─── 2. Check which articles already exist ──────────────
    const supabase = getSupabase();
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

    const { data: existingRows } = await supabase
      .from("news_articles")
      .select("id, source_url")
      .gte("created_at", fourteenDaysAgo);

    const existingIds = new Set((existingRows || []).map((r) => r.id));
    const existingUrls = new Set(
      (existingRows || []).map((r) => r.source_url).filter(Boolean)
    );

    const newArticles = rawArticles.filter((a) => {
      const id = generateArticleId(a.link);
      return !existingIds.has(id) && !existingUrls.has(a.link);
    });

    stats.already_exists = rawArticles.length - newArticles.length;
    console.log(
      `[scrape-news][${countryCode}] ${newArticles.length} new articles (${stats.already_exists} already exist)`
    );

    if (newArticles.length === 0) {
      stats.duration_ms = Date.now() - startTime;
      return stats;
    }

    // ─── 3. Classify new articles with OpenAI ───────────────
    const toClassify = diversifyBySource(newArticles, MAX_NEW_ARTICLES, countryCode);
    const classified = [];
    const allPollData: PollDataExtracted[] = [];

    for (const raw of toClassify) {
      const result = await classifyArticle(raw, countryCode);
      if (result) {
        if (result._poll_data && result._poll_data.length > 0) {
          allPollData.push(...result._poll_data);
          stats.polls_extracted += result._poll_data.length;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _poll_data, ...articleData } = result;
        classified.push(articleData);
        stats.classified++;
      } else {
        stats.not_electoral++;
      }
    }

    console.log(
      `[scrape-news][${countryCode}] Classified ${stats.classified} electoral, ${stats.not_electoral} non-electoral, ${stats.polls_extracted} poll data points`
    );

    if (classified.length === 0 && allPollData.length === 0) {
      stats.duration_ms = Date.now() - startTime;
      return stats;
    }

    // ─── 4. Insert articles into Supabase ───────────────────
    if (classified.length > 0) {
      const { data: inserted, error } = await supabase
        .from("news_articles")
        .upsert(classified, { onConflict: "id", ignoreDuplicates: true })
        .select("id");

      if (error) {
        console.error(`[scrape-news][${countryCode}] Supabase insert error:`, error);
        stats.errors++;
      }
      stats.inserted = inserted?.length || 0;
    }

    // ─── 5. Insert poll data & recalculate averages ─────────
    if (allPollData.length > 0) {
      console.log(
        `[scrape-news][${countryCode}] Processing ${allPollData.length} poll data points...`
      );

      const seenPolls = new Set<string>();
      const uniquePolls = allPollData.filter((p) => {
        const key = `${p.candidate_id}:${p.date}`;
        if (seenPolls.has(key)) return false;
        seenPolls.add(key);
        return true;
      });

      const existingChecks = await Promise.all(
        uniquePolls.map((p) =>
          supabase
            .from("poll_data_points")
            .select("id")
            .eq("candidate_id", p.candidate_id)
            .eq("date", p.date)
            .limit(1)
        )
      );

      const newPolls = uniquePolls.filter((_, i) => {
        const result = existingChecks[i];
        return !result.data || result.data.length === 0;
      });

      if (newPolls.length > 0) {
        const { error: pollError } = await supabase
          .from("poll_data_points")
          .insert(newPolls);

        if (pollError) {
          console.error(`[scrape-news][${countryCode}] Poll insert error:`, pollError);
          stats.errors++;
        } else {
          stats.polls_inserted = newPolls.length;
          console.log(
            `[scrape-news][${countryCode}] Inserted ${newPolls.length} poll data points`
          );
        }

        const affectedCandidates = [
          ...new Set(newPolls.map((p) => p.candidate_id)),
        ];

        for (const candidateId of affectedCandidates) {
          try {
            await recalculatePollStats(supabase, candidateId);
            stats.candidates_updated++;
          } catch (err) {
            console.error(
              `[scrape-news][${countryCode}] Error recalculating ${candidateId}:`,
              err
            );
            stats.errors++;
          }
        }
      }
    }

    stats.duration_ms = Date.now() - startTime;
    console.log(
      `[scrape-news][${countryCode}] Done: ${stats.inserted} articles, ${stats.polls_inserted} polls, ${stats.candidates_updated} candidates updated in ${stats.duration_ms}ms`
    );

    return stats;
  } catch (err) {
    console.error(`[scrape-news][${countryCode}] Fatal error:`, err);
    stats.errors++;
    stats.duration_ms = Date.now() - startTime;
    return stats;
  }
}

// =============================================================================
// KNOWN SOURCES BY COUNTRY
// =============================================================================

const KNOWN_SOURCES_PE = new Set([
  "el comercio", "el comercio perú", "el comercio peru",
  "rpp", "rpp noticias", "la república", "la republica",
  "gestión", "gestion", "infobae", "andina",
  "agencia peruana de noticias | andina", "agencia peruana de noticias",
  "peru21", "perú21", "correo", "diario correo",
  "tvperú", "tvperu", "tv peru", "panamericana", "panamericana tv",
  "canal n", "exitosa", "la razón", "la razon", "expreso",
  "ojo", "diario uno",
]);

const KNOWN_SOURCES_CO = new Set([
  "el tiempo", "el espectador", "semana", "revista semana",
  "caracol radio", "caracol noticias", "rcn radio", "rcn noticias",
  "blu radio", "la silla vacía", "la silla vacia",
  "colombiacheck", "razón pública", "razon publica",
  "w radio", "noticias uno", "el colombiano", "la fm",
  "publimetro colombia", "las2orillas", "cambio",
]);

const KNOWN_SOURCES_INTL = new Set([
  "reuters", "bbc", "bbc news mundo", "efe", "france 24",
  "dw", "ap news", "bloomberg", "cnn en español", "cnn en espanol",
]);

function isKnownSource(source: string, countryCode: CountryCode): boolean {
  const lower = source.toLowerCase().trim();
  if (KNOWN_SOURCES_INTL.has(lower)) return true;
  if (countryCode === "pe") return KNOWN_SOURCES_PE.has(lower);
  if (countryCode === "co") return KNOWN_SOURCES_CO.has(lower);
  return false;
}

/**
 * Round-robin pick articles from different sources to ensure diversity.
 * Prioritizes known/trusted media outlets over obscure sources.
 */
function diversifyBySource(
  articles: RawArticle[],
  maxCount: number,
  countryCode: CountryCode
): RawArticle[] {
  const knownArticles = articles.filter((a) => isKnownSource(a.source, countryCode));
  const unknownArticles = articles.filter((a) => !isKnownSource(a.source, countryCode));

  const bySource = new Map<string, RawArticle[]>();
  for (const a of knownArticles) {
    const bucket = bySource.get(a.source) || [];
    bucket.push(a);
    bySource.set(a.source, bucket);
  }

  const sources = [...bySource.keys()];
  const result: RawArticle[] = [];
  const indices = new Map<string, number>(sources.map((s) => [s, 0]));

  let added = true;
  while (result.length < maxCount && added) {
    added = false;
    for (const source of sources) {
      if (result.length >= maxCount) break;
      const idx = indices.get(source)!;
      const bucket = bySource.get(source)!;
      if (idx < bucket.length) {
        result.push(bucket[idx]);
        indices.set(source, idx + 1);
        added = true;
      }
    }
  }

  for (const a of unknownArticles) {
    if (result.length >= maxCount) break;
    result.push(a);
  }

  return result;
}

/**
 * Recalculate poll_average and poll_trend for a candidate.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function recalculatePollStats(supabase: any, candidateId: string) {
  const { data: recentPolls, error: fetchError } = await supabase
    .from("poll_data_points")
    .select("value")
    .eq("candidate_id", candidateId)
    .order("date", { ascending: false })
    .limit(3);

  if (fetchError) throw fetchError;
  if (!recentPolls || recentPolls.length === 0) return;

  const poll_average =
    recentPolls.reduce(
      (sum: number, p: { value: number }) => sum + p.value,
      0
    ) / recentPolls.length;

  let poll_trend: "up" | "down" | "stable" = "stable";
  if (recentPolls.length >= 2) {
    const latest = recentPolls[0].value;
    const secondLatest = recentPolls[1].value;
    if (latest > secondLatest) poll_trend = "up";
    else if (latest < secondLatest) poll_trend = "down";
  }

  const { error: updateError } = await supabase
    .from("candidates")
    .update({
      poll_average: Math.round(poll_average * 100) / 100,
      poll_trend,
    })
    .eq("id", candidateId);

  if (updateError) throw updateError;

  console.log(
    `[scrape-news] Updated ${candidateId}: avg=${(Math.round(poll_average * 100) / 100).toFixed(1)}% trend=${poll_trend}`
  );
}
