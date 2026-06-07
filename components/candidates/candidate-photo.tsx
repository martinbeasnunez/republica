"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Resilient candidate photo renderer.
 *
 * Why this exists: candidate photos have bitten us twice —
 *   1. DB URLs pointing at `upload.wikimedia.org/thumb/*` got HTTP 429
 *      (per-IP rate limit) when hotlinked from visitors' browsers.
 *   2. Some Wikimedia filenames went stale and 404'd.
 *
 * We already moved active CO photos to local `/candidatos/co/*.{jpg,png}`
 * files, but *anything* can still break (a new candidate whose file
 * isn't committed yet, a typo in the DB, a renamed asset). This wrapper
 * guarantees the page never shows the browser's broken-image icon:
 *
 *   • Render <img> with whatever src we have.
 *   • On `onError` → hide the <img> and paint an initials circle instead.
 *   • If `photo` is empty / not a URL to begin with → skip straight to initials.
 *
 * The parent supplies the circular container + border; this component only
 * fills it. Keep it purely presentational.
 */

function initialsFrom(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export interface CandidatePhotoProps {
  photo: string | null | undefined;
  name: string;
  /** Hex color for the initials-fallback background (tinted). */
  partyColor?: string;
  /** Applied to the <img> tag (parent owns the circle/border). */
  className?: string;
  /** Eager vs lazy load; default lazy for list views. */
  loading?: "eager" | "lazy";
}

export function CandidatePhoto({
  photo,
  name,
  partyColor = "#94a3b8",
  className,
  loading = "lazy",
}: CandidatePhotoProps) {
  const [failed, setFailed] = useState(false);

  const usable =
    typeof photo === "string" &&
    (photo.startsWith("/") || photo.startsWith("http"));

  // Fallback: initials on a tinted disc
  if (!usable || failed) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center text-[0.7rem] font-semibold uppercase tracking-wide",
          className
        )}
        style={{
          backgroundColor: partyColor + "20",
          color: partyColor,
        }}
        aria-label={name}
      >
        {initialsFrom(name)}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photo}
      alt={name}
      loading={loading}
      decoding="async"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
