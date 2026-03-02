import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, referrer, sessionId, utmSource, utmMedium, utmCampaign } =
      body;

    if (!path || typeof path !== "string") {
      return NextResponse.json({ ok: true });
    }

    // Skip admin pages
    if (path.startsWith("/admin")) {
      return NextResponse.json({ ok: true });
    }

    // Get geo from Vercel headers
    const country =
      request.headers.get("x-vercel-ip-country") || null;
    const city = request.headers.get("x-vercel-ip-city")
      ? decodeURIComponent(request.headers.get("x-vercel-ip-city")!)
      : null;

    // Parse device from user agent
    const ua = request.headers.get("user-agent") || "";
    let device = "desktop";
    if (/mobile|android|iphone|ipod/i.test(ua)) device = "mobile";
    else if (/tablet|ipad/i.test(ua)) device = "tablet";

    // Skip bots
    if (/bot|crawler|spider|googlebot|bingbot|yandex|baidu|duckduck/i.test(ua)) {
      return NextResponse.json({ ok: true });
    }

    // Clean referrer — strip query params, keep domain + path
    let cleanReferrer: string | null = null;
    if (referrer && typeof referrer === "string" && referrer.length > 0) {
      try {
        const url = new URL(referrer);
        // Skip self-referrals
        if (!url.hostname.includes("condorlatam.com") && !url.hostname.includes("localhost")) {
          cleanReferrer = url.hostname.replace("www.", "");
        }
      } catch {
        cleanReferrer = referrer.slice(0, 200);
      }
    }

    const supabase = getSupabase();
    await supabase.from("analytics_events").insert({
      path: path.slice(0, 500),
      referrer: cleanReferrer,
      utm_source: utmSource?.slice(0, 100) || null,
      utm_medium: utmMedium?.slice(0, 100) || null,
      utm_campaign: utmCampaign?.slice(0, 200) || null,
      country,
      city,
      device,
      session_id: sessionId?.slice(0, 50) || null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // Never fail
  }
}
