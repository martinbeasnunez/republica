import { getSupabase } from "@/lib/supabase";
import { AdminOverviewClient } from "./overview-client";

async function getAdminData() {
  const supabase = getSupabase();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Run all queries in parallel
  const [
    subscribersResult,
    viewsTodayResult,
    views7dResult,
    events7dResult,
    recentViewsResult,
    topPagesResult,
  ] = await Promise.all([
    // Total active subscribers
    supabase
      .from("whatsapp_subscribers")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),

    // Views today
    supabase
      .from("page_views")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayStart),

    // Views last 7 days
    supabase
      .from("page_views")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo),

    // Events last 7 days
    supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo),

    // Views per day (last 30 days) for chart
    supabase
      .from("page_views")
      .select("created_at")
      .gte("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: true }),

    // Top pages (last 7 days)
    supabase
      .from("page_views")
      .select("page")
      .gte("created_at", sevenDaysAgo),
  ]);

  // Aggregate views by day
  const viewsByDay: Record<string, number> = {};
  if (recentViewsResult.data) {
    for (const row of recentViewsResult.data) {
      const day = new Date(row.created_at).toISOString().split("T")[0];
      viewsByDay[day] = (viewsByDay[day] || 0) + 1;
    }
  }

  // Fill in missing days
  const dailyViews: { date: string; views: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split("T")[0];
    dailyViews.push({ date: key, views: viewsByDay[key] || 0 });
  }

  // Aggregate top pages
  const pageCounts: Record<string, number> = {};
  if (topPagesResult.data) {
    for (const row of topPagesResult.data) {
      pageCounts[row.page] = (pageCounts[row.page] || 0) + 1;
    }
  }
  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([page, count]) => ({ page, count }));

  return {
    subscribers: subscribersResult.count || 0,
    viewsToday: viewsTodayResult.count || 0,
    views7d: views7dResult.count || 0,
    events7d: events7dResult.count || 0,
    dailyViews,
    topPages,
  };
}

export default async function AdminOverviewPage() {
  let data;
  try {
    data = await getAdminData();
  } catch {
    data = {
      subscribers: 0,
      viewsToday: 0,
      views7d: 0,
      events7d: 0,
      dailyViews: [],
      topPages: [],
    };
  }

  return <AdminOverviewClient data={data} />;
}
