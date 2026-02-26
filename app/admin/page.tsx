import { getSupabase } from "@/lib/supabase";
import { AdminOverviewClient } from "./overview-client";
import { COUNTRIES, type CountryCode } from "@/lib/config/countries";

export const dynamic = "force-dynamic";

/* ── bot filter ── */
const BOT_PATTERNS = [
  "headlesschrome",
  "bot",
  "crawler",
  "spider",
  "lighthouse",
  "pagespeed",
  "prerender",
  "phantom",
  "puppeteer",
  "selenium",
];

function isBot(ua: string | null | undefined): boolean {
  if (!ua) return false;
  const lower = ua.toLowerCase();
  return BOT_PATTERNS.some((p) => lower.includes(p));
}

/* ── Fetch all page_views with pagination (Supabase default limit is 1000) ── */
type PageView = { page: string; referrer: string | null; user_agent: string | null; session_id: string; created_at: string };

async function fetchAllPageViews(supabase: ReturnType<typeof getSupabase>, since: string, countryPrefix: string): Promise<PageView[]> {
  const PAGE_SIZE = 1000;
  const allRows: PageView[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data } = await supabase
      .from("page_views")
      .select("page, referrer, user_agent, session_id, created_at")
      .gte("created_at", since)
      .like("page", `${countryPrefix}%`)
      .order("created_at", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    const rows = (data || []) as PageView[];
    allRows.push(...rows);
    hasMore = rows.length === PAGE_SIZE;
    offset += PAGE_SIZE;
  }

  return allRows;
}

async function getAdminData(country: CountryCode) {
  const supabase = getSupabase();
  const countryConfig = COUNTRIES[country];
  const countryPrefix = `/${country}`;

  /* ── Use country timezone (both PE and CO are UTC-5) ── */
  const TZ_OFFSET = -5 * 60 * 60 * 1000; // UTC-5
  const now = new Date();
  const localNow = new Date(now.getTime() + TZ_OFFSET);
  const todayStart = new Date(
    Date.UTC(localNow.getUTCFullYear(), localNow.getUTCMonth(), localNow.getUTCDate()) - TZ_OFFSET
  ).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    subscribersResult,
    allPageViews,
    events7dResult,
    newsCountResult,
    factChecksResult,
    latestNewsResult,
    latestFactCheckResult,
    candidatesResult,
  ] = await Promise.all([
    // Active subscribers count — filtered by country
    supabase
      .from("whatsapp_subscribers")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("country_code", country),

    // All views (30 days) — filtered by page URL prefix
    fetchAllPageViews(supabase, thirtyDaysAgo, countryPrefix),

    // Events 7 days — filtered by page URL prefix
    supabase
      .from("analytics_events")
      .select("id, event, page, target, metadata, created_at")
      .gte("created_at", sevenDaysAgo)
      .like("page", `${countryPrefix}%`)
      .order("created_at", { ascending: false })
      .limit(500),

    // Total active news articles — filtered by country
    supabase
      .from("news_articles")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("country_code", country),

    // Fact checks count + breakdown — filtered by country
    supabase
      .from("fact_checks")
      .select("verdict, created_at")
      .eq("country_code", country)
      .order("created_at", { ascending: false })
      .limit(500),

    // Most recent news article — filtered by country
    supabase
      .from("news_articles")
      .select("created_at")
      .eq("country_code", country)
      .order("created_at", { ascending: false })
      .limit(1),

    // Most recent fact check — filtered by country
    supabase
      .from("fact_checks")
      .select("created_at")
      .eq("country_code", country)
      .order("created_at", { ascending: false })
      .limit(1),

    // Candidates with poll data — filtered by country
    supabase
      .from("candidates")
      .select("id, short_name, slug, poll_average, poll_trend, party")
      .eq("country_code", country)
      .order("poll_average", { ascending: false })
      .limit(15),
  ]);

  /* ── Filter bots ── */
  const allViews = allPageViews.filter((v) => !isBot(v.user_agent));
  const views7d = allViews.filter((v) => v.created_at >= sevenDaysAgo);
  const viewsToday = allViews.filter((v) => v.created_at >= todayStart);
  const events = events7dResult.data || [];

  /* ── Daily views chart (30d) — grouped by local date ── */
  const viewsByDay: Record<string, number> = {};
  for (const row of allViews) {
    const localDate = new Date(new Date(row.created_at).getTime() + TZ_OFFSET);
    const day = localDate.toISOString().split("T")[0];
    viewsByDay[day] = (viewsByDay[day] || 0) + 1;
  }
  const dailyViews: { date: string; views: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(localNow.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split("T")[0];
    dailyViews.push({ date: key, views: viewsByDay[key] || 0 });
  }

  /* ── Top pages (7d) — strip country prefix for readability ── */
  const pageCounts: Record<string, number> = {};
  for (const v of views7d) {
    const displayPage = v.page.replace(countryPrefix, "") || "/";
    pageCounts[displayPage] = (pageCounts[displayPage] || 0) + 1;
  }
  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([page, count]) => ({ page, count }));

  /* ── Candidate page traffic (7d) ── */
  const candidatePageViews: Record<string, number> = {};
  for (const v of views7d) {
    const match = v.page.match(new RegExp(`^/${country}/candidatos/([^/]+)$`));
    if (match) {
      const slug = match[1];
      candidatePageViews[slug] = (candidatePageViews[slug] || 0) + 1;
    }
  }
  const candidateTraffic = Object.entries(candidatePageViews)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([slug, views]) => ({ slug, views }));

  /* ── Referrers (7d) ── */
  const referrerCounts: Record<string, number> = {};
  for (const v of views7d) {
    if (v.referrer) {
      try {
        const host = new URL(v.referrer).hostname || v.referrer;
        referrerCounts[host] = (referrerCounts[host] || 0) + 1;
      } catch {
        referrerCounts[v.referrer] = (referrerCounts[v.referrer] || 0) + 1;
      }
    }
  }
  const referrers = Object.entries(referrerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([referrer, count]) => ({ referrer, count }));

  /* ── Device breakdown (7d) ── */
  let mobileCount = 0;
  let desktopCount = 0;
  for (const v of views7d) {
    if (v.user_agent) {
      const ua = v.user_agent.toLowerCase();
      if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
        mobileCount++;
      } else {
        desktopCount++;
      }
    }
  }

  /* ── Parse visitor_id from session_id (format: "v:VISITOR|s:SESSION" or legacy plain UUID) ── */
  function extractVisitorId(sid: string | null): string {
    if (!sid) return "";
    const match = sid.match(/^v:([^|]+)\|/);
    return match ? match[1] : sid; // Legacy sessions fallback to session_id as visitor proxy
  }
  function extractSessionId(sid: string | null): string {
    if (!sid) return "";
    const match = sid.match(/\|s:(.+)$/);
    return match ? match[1] : sid;
  }

  /* ── Unique visitors & sessions (7d) ── */
  const uniqueVisitors7d = new Set(views7d.map((v) => extractVisitorId(v.session_id)).filter(Boolean)).size;
  const uniqueSessions = new Set(views7d.map((v) => extractSessionId(v.session_id)).filter(Boolean)).size;
  const uniqueVisitorsToday = new Set(viewsToday.map((v) => extractVisitorId(v.session_id)).filter(Boolean)).size;

  /* ── Engagement metrics (7d) ── */
  const sessionPages: Record<string, string[]> = {};
  for (const v of views7d) {
    const sid = extractSessionId(v.session_id);
    if (sid) {
      if (!sessionPages[sid]) sessionPages[sid] = [];
      sessionPages[sid].push(v.page);
    }
  }
  const sessionLengths = Object.values(sessionPages).map((pages) => pages.length);
  const avgPagesPerSession = sessionLengths.length > 0
    ? Math.round((sessionLengths.reduce((a, b) => a + b, 0) / sessionLengths.length) * 10) / 10
    : 0;
  const bounceRate = sessionLengths.length > 0
    ? Math.round((sessionLengths.filter((l) => l === 1).length / sessionLengths.length) * 100)
    : 0;

  /* ── Entry pages (7d) — first page per session ── */
  const sessionFirstPage: Record<string, string> = {};
  for (const v of views7d) {
    const sid = extractSessionId(v.session_id);
    if (sid && !sessionFirstPage[sid]) {
      sessionFirstPage[sid] = v.page.replace(countryPrefix, "") || "/";
    }
  }
  const entryPageCounts: Record<string, number> = {};
  for (const page of Object.values(sessionFirstPage)) {
    entryPageCounts[page] = (entryPageCounts[page] || 0) + 1;
  }
  const entryPages = Object.entries(entryPageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([page, count]) => ({ page, count }));

  /* ── Top events (7d) ── */
  const eventCounts: Record<string, number> = {};
  for (const e of events) {
    const key = `${e.event}:${e.target}`;
    eventCounts[key] = (eventCounts[key] || 0) + 1;
  }
  const topEvents = Object.entries(eventCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([key, count]) => {
      const [event, target] = key.split(":");
      return { event, target, count };
    });

  /* ── Content health ── */
  const factChecks = factChecksResult.data || [];
  const verdictBreakdown = {
    verdadero: factChecks.filter((f) => f.verdict === "VERDADERO").length,
    falso: factChecks.filter((f) => f.verdict === "FALSO").length,
    enganoso: factChecks.filter((f) => f.verdict === "ENGANOSO").length,
    parcial: factChecks.filter((f) => f.verdict === "PARCIALMENTE_VERDADERO").length,
    noVerificable: factChecks.filter((f) => f.verdict === "NO_VERIFICABLE").length,
  };

  const lastScrape = latestNewsResult.data?.[0]?.created_at || null;
  const lastVerify = latestFactCheckResult.data?.[0]?.created_at || null;

  /* ── Candidates with poll data ── */
  const candidates = (candidatesResult.data || [])
    .filter((c) => c.poll_average > 0)
    .map((c) => ({
      name: c.short_name || c.slug,
      slug: c.slug,
      pollAverage: c.poll_average,
      pollTrend: c.poll_trend,
      party: c.party,
    }));

  return {
    country,
    countryName: countryConfig.name,
    countryEmoji: countryConfig.emoji,
    subscribers: subscribersResult.count || 0,
    viewsToday: viewsToday.length,
    visitorsToday: uniqueVisitorsToday,
    views7d: views7d.length,
    uniqueVisitors7d,
    uniqueSessions,
    mobileCount,
    desktopCount,
    events7d: events.length,
    dailyViews,
    topPages,
    referrers,
    topEvents,
    recentEvents: events.slice(0, 20),
    totalNews: newsCountResult.count || 0,
    totalFactChecks: factChecks.length,
    verdictBreakdown,
    lastScrape,
    lastVerify,
    candidates,
    candidateTraffic,
    avgPagesPerSession,
    bounceRate,
    entryPages,
  };
}

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string }>;
}) {
  const { country: countryParam } = await searchParams;
  const country = (countryParam === "co" ? "co" : "pe") as CountryCode;

  let data;
  try {
    data = await getAdminData(country);
  } catch {
    data = {
      country,
      countryName: COUNTRIES[country].name,
      countryEmoji: COUNTRIES[country].emoji,
      subscribers: 0,
      viewsToday: 0,
      visitorsToday: 0,
      views7d: 0,
      uniqueVisitors7d: 0,
      uniqueSessions: 0,
      mobileCount: 0,
      desktopCount: 0,
      events7d: 0,
      dailyViews: [],
      topPages: [],
      referrers: [],
      topEvents: [],
      recentEvents: [],
      totalNews: 0,
      totalFactChecks: 0,
      verdictBreakdown: { verdadero: 0, falso: 0, enganoso: 0, parcial: 0, noVerificable: 0 },
      lastScrape: null,
      lastVerify: null,
      candidates: [],
      candidateTraffic: [],
      avgPagesPerSession: 0,
      bounceRate: 0,
      entryPages: [],
    };
  }

  return <AdminOverviewClient data={data} />;
}
