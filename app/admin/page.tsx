import { getSupabase } from "@/lib/supabase";
import { AdminOverviewClient } from "./overview-client";
import { COUNTRIES, type CountryCode } from "@/lib/config/countries";

export const dynamic = "force-dynamic";

/* ── Types ── */
type PageViewRow = {
  page: string;
  referrer: string | null;
  user_agent: string | null;
  session_id: string | null;
  created_at: string;
};

type NormalizedView = {
  path: string;
  referrer: string | null;
  device: string;
  session_id: string | null;
  created_at: string;
};

/* ── Fetch page_views with pagination (ALL site traffic, no country filter) ── */
async function fetchPageViews(
  supabase: ReturnType<typeof getSupabase>,
  since: string,
): Promise<PageViewRow[]> {
  const PAGE_SIZE = 1000;
  const allRows: PageViewRow[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data } = await supabase
      .from("page_views")
      .select("page, referrer, user_agent, session_id, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    const rows = (data || []) as PageViewRow[];
    allRows.push(...rows);
    hasMore = rows.length === PAGE_SIZE;
    offset += PAGE_SIZE;
  }

  return allRows;
}

/* ── Helpers ── */
function parseDevice(ua: string | null): string {
  if (!ua) return "desktop";
  if (/mobile|android|iphone|ipod/i.test(ua)) return "mobile";
  if (/tablet|ipad/i.test(ua)) return "tablet";
  return "desktop";
}

function isBot(ua: string | null): boolean {
  if (!ua) return false;
  return /bot|crawler|spider|googlebot|bingbot|yandex|baidu|duckduck|facebookexternalhit|Twitterbot|LinkedInBot|Slurp|Sogou|ia_archiver|HeadlessChrome|PhantomJS|Lighthouse/i.test(
    ua,
  );
}

function parseReferrerDomain(referrer: string | null): string | null {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    if (
      url.hostname.includes("condorlatam.com") ||
      url.hostname.includes("condorperu") ||
      url.hostname.includes("localhost") ||
      url.hostname.includes("127.0.0.1") ||
      url.hostname.includes("vercel.app")
    ) {
      return null; // Self-referral
    }
    return url.hostname.replace("www.", "");
  } catch {
    return referrer.slice(0, 200);
  }
}

/** Strip country prefix from path for display: /pe/noticias → /noticias */
function normalizePath(path: string): string {
  return path.replace(/^\/(pe|co)/, "") || "/";
}

/** Check if a page view belongs to a specific country */
function pathBelongsToCountry(path: string, country: CountryCode): boolean {
  if (path.startsWith(`/${country}/`) || path === `/${country}`) return true;
  // Legacy paths without country prefix → attribute to PE (original country)
  if (country === "pe" && !path.startsWith("/pe") && !path.startsWith("/co")) return true;
  return false;
}

async function getAdminData(country: CountryCode) {
  const supabase = getSupabase();
  const countryConfig = COUNTRIES[country];

  /* ── Use country timezone (both PE and CO are UTC-5) ── */
  const TZ_OFFSET = -5 * 60 * 60 * 1000; // UTC-5
  const now = new Date();
  const localNow = new Date(now.getTime() + TZ_OFFSET);
  const sevenDaysAgo = new Date(
    now.getTime() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const thirtyDaysAgo = new Date(
    now.getTime() - 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const [
    subscribersResult,
    rawPageViews,
    newsCountResult,
    factChecksResult,
    latestNewsResult,
    latestFactCheckResult,
    candidatesResult,
  ] = await Promise.all([
    supabase
      .from("whatsapp_subscribers")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("country_code", country),

    fetchPageViews(supabase, thirtyDaysAgo),

    supabase
      .from("news_articles")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("country_code", country),

    supabase
      .from("fact_checks")
      .select("verdict, created_at")
      .eq("country_code", country)
      .order("created_at", { ascending: false })
      .limit(500),

    supabase
      .from("news_articles")
      .select("created_at")
      .eq("country_code", country)
      .order("created_at", { ascending: false })
      .limit(1),

    supabase
      .from("fact_checks")
      .select("created_at")
      .eq("country_code", country)
      .order("created_at", { ascending: false })
      .limit(1),

    supabase
      .from("candidates")
      .select("id, short_name, slug, poll_average, poll_trend, party")
      .eq("country_code", country)
      .order("poll_average", { ascending: false })
      .limit(15),
  ]);

  /* ── Normalize page_views: filter bots, admin, and by country ── */
  const allViews: NormalizedView[] = rawPageViews
    .filter(
      (pv) =>
        !pv.page.startsWith("/admin") &&
        !isBot(pv.user_agent) &&
        pathBelongsToCountry(pv.page, country),
    )
    .map((pv) => ({
      path: pv.page,
      referrer: parseReferrerDomain(pv.referrer),
      device: parseDevice(pv.user_agent),
      session_id: pv.session_id,
      created_at: pv.created_at,
    }));

  const views7d = allViews.filter((v) => v.created_at >= sevenDaysAgo);
  const todayStart = new Date(
    Date.UTC(
      localNow.getUTCFullYear(),
      localNow.getUTCMonth(),
      localNow.getUTCDate(),
    ) - TZ_OFFSET,
  ).toISOString();
  const viewsToday = allViews.filter((v) => v.created_at >= todayStart);

  /* ── Daily views chart (30d) — all site traffic ── */
  const viewsByDay: Record<string, number> = {};
  for (const row of allViews) {
    const localDate = new Date(
      new Date(row.created_at).getTime() + TZ_OFFSET,
    );
    const day = localDate.toISOString().split("T")[0];
    viewsByDay[day] = (viewsByDay[day] || 0) + 1;
  }
  const dailyViews: { date: string; views: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(localNow.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split("T")[0];
    dailyViews.push({ date: key, views: viewsByDay[key] || 0 });
  }

  /* ── Top pages (7d) — normalize paths, combine prefixed + non-prefixed ── */
  const pageCounts: Record<string, number> = {};
  for (const v of views7d) {
    const displayPage = normalizePath(v.path);
    pageCounts[displayPage] = (pageCounts[displayPage] || 0) + 1;
  }
  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([page, count]) => ({ page, count }));

  /* ── Candidate page traffic (7d) — needs country prefix ── */
  const candidatePageViews: Record<string, number> = {};
  for (const v of views7d) {
    // Match country-prefixed candidate pages
    const match = v.path.match(
      new RegExp(`^/${country}/candidatos/([^/]+)$`),
    );
    if (match) {
      candidatePageViews[match[1]] =
        (candidatePageViews[match[1]] || 0) + 1;
    }
    // Also match legacy non-prefixed candidate pages (these belong to PE)
    if (country === "pe") {
      const legacyMatch = v.path.match(/^\/candidatos\/([^/]+)$/);
      if (legacyMatch) {
        candidatePageViews[legacyMatch[1]] =
          (candidatePageViews[legacyMatch[1]] || 0) + 1;
      }
    }
  }
  const candidateTraffic = Object.entries(candidatePageViews)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([slug, views]) => ({ slug, views }));

  /* ── Device breakdown (7d) ── */
  let mobileCount = 0;
  let desktopCount = 0;
  let tabletCount = 0;
  for (const v of views7d) {
    if (v.device === "mobile") mobileCount++;
    else if (v.device === "tablet") tabletCount++;
    else desktopCount++;
  }

  /* ── Acquisition helper — computes all acquisition metrics for a set of views ── */
  const SEARCH_ENGINES = [
    "google",
    "bing",
    "yahoo",
    "duckduckgo",
    "ecosia",
    "baidu",
    "yandex",
  ];
  const SOCIAL_NETS = [
    "facebook",
    "fb.com",
    "instagram",
    "twitter",
    "t.co",
    "x.com",
    "linkedin",
    "tiktok",
    "reddit",
    "whatsapp",
    "wa.me",
    "telegram",
    "t.me",
    "youtube",
  ];

  function computeAcquisition(views: NormalizedView[]) {
    // Traffic channels
    const chCounts: Record<string, number> = {
      Directo: 0,
      "Búsqueda": 0,
      Social: 0,
      Referral: 0,
    };
    for (const v of views) {
      if (!v.referrer) chCounts["Directo"]++;
      else if (SEARCH_ENGINES.some((se) => v.referrer!.includes(se)))
        chCounts["Búsqueda"]++;
      else if (SOCIAL_NETS.some((sn) => v.referrer!.includes(sn)))
        chCounts["Social"]++;
      else chCounts["Referral"]++;
    }
    const total = views.length || 1;
    const trafficChannels = Object.entries(chCounts)
      .filter(([, c]) => c > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([channel, count]) => ({
        channel,
        count,
        pct: Math.round((count / total) * 100),
      }));

    // Countries — not available from page_views (geo tracking is collecting data)
    const topCountries: { country: string; count: number }[] = [];

    // Cities — not available from page_views
    const topCities: { city: string; count: number }[] = [];

    // Referrers
    const refCounts: Record<string, number> = {};
    for (const v of views) {
      const ref = v.referrer || "Directo";
      refCounts[ref] = (refCounts[ref] || 0) + 1;
    }
    const referrers = Object.entries(refCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([referrer, count]) => ({ referrer, count }));

    // UTM campaigns — not available from page_views
    const utmCampaigns: { campaign: string; source: string; count: number }[] =
      [];

    // Entry pages (first page per session)
    const sessionFirst: Record<string, string> = {};
    for (const v of views) {
      if (v.session_id && !sessionFirst[v.session_id]) {
        sessionFirst[v.session_id] = normalizePath(v.path);
      }
    }
    const epCounts: Record<string, number> = {};
    for (const page of Object.values(sessionFirst))
      epCounts[page] = (epCounts[page] || 0) + 1;
    const entryPages = Object.entries(epCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([page, count]) => ({ page, count }));

    return {
      trafficChannels,
      topCountries,
      topCities,
      referrers,
      utmCampaigns,
      entryPages,
      totalViews: views.length,
    };
  }

  /* ── Compute acquisition for 3 periods ── */
  const fifteenDaysAgo = new Date(
    now.getTime() - 15 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const views15d = allViews.filter((v) => v.created_at >= fifteenDaysAgo);

  const acquisition = {
    "7d": computeAcquisition(views7d),
    "15d": computeAcquisition(views15d),
    "30d": computeAcquisition(allViews),
  };

  /* ── Unique sessions (7d) ── */
  const uniqueSessions = new Set(
    views7d.map((v) => v.session_id).filter(Boolean),
  ).size;
  const uniqueSessionsToday = new Set(
    viewsToday.map((v) => v.session_id).filter(Boolean),
  ).size;

  /* ── Engagement metrics (7d) ── */
  const sessionPages: Record<string, string[]> = {};
  for (const v of views7d) {
    if (v.session_id) {
      if (!sessionPages[v.session_id]) sessionPages[v.session_id] = [];
      sessionPages[v.session_id].push(v.path);
    }
  }
  const sessionLengths = Object.values(sessionPages).map(
    (pages) => pages.length,
  );
  const avgPagesPerSession =
    sessionLengths.length > 0
      ? Math.round(
          (sessionLengths.reduce((a, b) => a + b, 0) /
            sessionLengths.length) *
            10,
        ) / 10
      : 0;
  const bounceRate =
    sessionLengths.length > 0
      ? Math.round(
          (sessionLengths.filter((l) => l === 1).length /
            sessionLengths.length) *
            100,
        )
      : 0;

  /* ── Content health ── */
  const factChecks = factChecksResult.data || [];
  const verdictBreakdown = {
    verdadero: factChecks.filter((f) => f.verdict === "VERDADERO").length,
    falso: factChecks.filter((f) => f.verdict === "FALSO").length,
    enganoso: factChecks.filter((f) => f.verdict === "ENGANOSO").length,
    parcial: factChecks.filter(
      (f) => f.verdict === "PARCIALMENTE_VERDADERO",
    ).length,
    noVerificable: factChecks.filter(
      (f) => f.verdict === "NO_VERIFICABLE",
    ).length,
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
    sessionsToday: uniqueSessionsToday,
    views7d: views7d.length,
    uniqueSessions,
    mobileCount,
    desktopCount,
    tabletCount,
    dailyViews,
    topPages,
    acquisition,
    totalNews: newsCountResult.count || 0,
    totalFactChecks: factChecks.length,
    verdictBreakdown,
    lastScrape,
    lastVerify,
    candidates,
    candidateTraffic,
    avgPagesPerSession,
    bounceRate,
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
      sessionsToday: 0,
      views7d: 0,
      uniqueSessions: 0,
      mobileCount: 0,
      desktopCount: 0,
      tabletCount: 0,
      dailyViews: [],
      topPages: [],
      acquisition: {
        "7d": {
          trafficChannels: [],
          topCountries: [],
          topCities: [],
          referrers: [],
          utmCampaigns: [],
          entryPages: [],
          totalViews: 0,
        },
        "15d": {
          trafficChannels: [],
          topCountries: [],
          topCities: [],
          referrers: [],
          utmCampaigns: [],
          entryPages: [],
          totalViews: 0,
        },
        "30d": {
          trafficChannels: [],
          topCountries: [],
          topCities: [],
          referrers: [],
          utmCampaigns: [],
          entryPages: [],
          totalViews: 0,
        },
      },
      totalNews: 0,
      totalFactChecks: 0,
      verdictBreakdown: {
        verdadero: 0,
        falso: 0,
        enganoso: 0,
        parcial: 0,
        noVerificable: 0,
      },
      lastScrape: null,
      lastVerify: null,
      candidates: [],
      candidateTraffic: [],
      avgPagesPerSession: 0,
      bounceRate: 0,
    };
  }

  return <AdminOverviewClient data={data} />;
}
