import { getSupabase } from "@/lib/supabase";
import { AnalyticsClient } from "./analytics-client";

async function getAnalyticsData() {
  const supabase = getSupabase();
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [viewsResult, eventsResult] = await Promise.all([
    // Recent page views
    supabase
      .from("page_views")
      .select("*")
      .gte("created_at", sevenDaysAgo)
      .order("created_at", { ascending: false })
      .limit(500),

    // Recent events
    supabase
      .from("analytics_events")
      .select("*")
      .gte("created_at", sevenDaysAgo)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const views = viewsResult.data || [];
  const events = eventsResult.data || [];

  // Aggregate by page
  const pageCounts: Record<string, number> = {};
  const referrerCounts: Record<string, number> = {};
  let mobileCount = 0;
  let desktopCount = 0;

  for (const v of views) {
    pageCounts[v.page] = (pageCounts[v.page] || 0) + 1;

    if (v.referrer) {
      try {
        const host = new URL(v.referrer).hostname || v.referrer;
        referrerCounts[host] = (referrerCounts[host] || 0) + 1;
      } catch {
        referrerCounts[v.referrer] = (referrerCounts[v.referrer] || 0) + 1;
      }
    }

    if (v.user_agent) {
      const ua = v.user_agent.toLowerCase();
      if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
        mobileCount++;
      } else {
        desktopCount++;
      }
    }
  }

  const pagesByViews = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([page, count]) => ({ page, count }));

  const referrers = Object.entries(referrerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([referrer, count]) => ({ referrer, count }));

  // Aggregate events by type
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

  // Unique sessions
  const uniqueSessions = new Set(views.map((v) => v.session_id).filter(Boolean)).size;

  return {
    totalViews: views.length,
    uniqueSessions,
    mobileCount,
    desktopCount,
    pagesByViews,
    referrers,
    topEvents,
    recentEvents: events.slice(0, 20),
  };
}

export default async function AdminAnalyticsPage() {
  let data;
  try {
    data = await getAnalyticsData();
  } catch {
    data = {
      totalViews: 0,
      uniqueSessions: 0,
      mobileCount: 0,
      desktopCount: 0,
      pagesByViews: [],
      referrers: [],
      topEvents: [],
      recentEvents: [],
    };
  }

  return <AnalyticsClient data={data} />;
}
