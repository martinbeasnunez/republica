"use client";

import { useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("condor_sid");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("condor_sid", id);
  }
  return id;
}

export function useAnalytics() {
  const pathname = usePathname();
  const tracked = useRef<string | null>(null);

  useEffect(() => {
    if (pathname === tracked.current) return;
    if (pathname.startsWith("/admin")) return; // Don't track admin pages
    tracked.current = pathname;

    const track = async () => {
      try {
        const supabase = getSupabaseBrowser();
        if (!supabase) return;

        await supabase.from("page_views").insert({
          page: pathname,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          session_id: getSessionId(),
        });
      } catch {
        // Silently fail — analytics should never break the app
      }
    };

    track();
  }, [pathname]);

  const trackEvent = useCallback(
    (event: string, target: string, metadata?: Record<string, unknown>) => {
      const track = async () => {
        try {
          const supabase = getSupabaseBrowser();
          if (!supabase) return;

          await supabase.from("analytics_events").insert({
            event,
            page: pathname,
            target,
            metadata: metadata || null,
            session_id: getSessionId(),
          });
        } catch {
          // Silently fail
        }
      };

      track();
    },
    [pathname]
  );

  return { trackEvent };
}
