"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = sessionStorage.getItem("condor_sid");
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("condor_sid", sid);
  }
  return sid;
}

function AnalyticsTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTracked = useRef("");

  useEffect(() => {
    // Skip admin users
    if (localStorage.getItem("condor_admin") === "1") return;

    // Skip admin pages
    if (pathname.startsWith("/admin")) return;

    // Deduplicate same page
    const key = pathname + (searchParams.toString() ? "?" + searchParams.toString() : "");
    if (key === lastTracked.current) return;
    lastTracked.current = key;

    const sessionId = getSessionId();

    // Small delay to not block initial render
    const timer = setTimeout(() => {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: pathname,
          referrer: document.referrer || null,
          sessionId,
          utmSource: searchParams.get("utm_source"),
          utmMedium: searchParams.get("utm_medium"),
          utmCampaign: searchParams.get("utm_campaign"),
        }),
        keepalive: true,
      }).catch(() => {});
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsTracker() {
  return <AnalyticsTrackerInner />;
}
