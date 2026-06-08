import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

/**
 * Live runoff counter — single source of truth.
 *
 * Strategy:
 *  1. First try the upstream official counter (/api/onpe-results for PE). If
 *     it returns runoff-shape data (≤2 candidates), surface that as official.
 *  2. Otherwise fall back to the manually-curated row in `homepage_blocks`
 *     where `block_type = 'runoff_conteo'`. That row carries boca-de-urna,
 *     conteo rápido, or "esperando" placeholders that an editor (or a future
 *     scraper) can update via PATCH without a deploy.
 *
 * Response shape (always JSON, never throws):
 *   {
 *     source: string,            // "ONPE" | "Ipsos boca de urna" | "Esperando ONPE" | ...
 *     sourceType: "official" | "exit_poll" | "quick_count" | "waiting",
 *     isOfficial: boolean,
 *     capturedAt: string,        // ISO timestamp
 *     actasPct: number | null,   // % mesas escrutadas (0-100), null if N/A
 *     actasCounted: number | null,
 *     actasTotal: number | null,
 *     candidates: Array<{
 *       slug?: string,
 *       name: string,
 *       shortName?: string,
 *       party?: string,
 *       partyColor?: string,
 *       percentage: number | null,
 *       votes: number | null,
 *     }>,
 *     note?: string,
 *   }
 */
export const dynamic = "force-dynamic";

interface ApiCandidate {
  slug?: string;
  name: string;
  shortName?: string;
  party?: string;
  partyColor?: string;
  percentage: number | null;
  votes: number | null;
}
interface ApiResponse {
  source: string;
  sourceType: "official" | "exit_poll" | "quick_count" | "waiting";
  isOfficial: boolean;
  capturedAt: string;
  actasPct: number | null;
  actasCounted: number | null;
  actasTotal: number | null;
  candidates: ApiCandidate[];
  note?: string;
}

const RUNOFF_SLUGS = ["keiko-fujimori", "roberto-sanchez"] as const;
const PARTY_COLORS: Record<string, string> = {
  "8": "#ff6600",  // Fuerza Popular
  "10": "#7c3aed", // Juntos por el Perú
};

// Map ONPE candidate name → known slug. Cheap fuzzy match — the runoff has
// only two candidates so exact-substring is enough.
function slugForOnpeName(name: string): string | null {
  const upper = name.toUpperCase();
  if (upper.includes("FUJIMORI")) return "keiko-fujimori";
  if (upper.includes("SANCHEZ") || upper.includes("SÁNCHEZ")) return "roberto-sanchez";
  return null;
}

/**
 * Probe the upstream ONPE proxy for runoff-shape data. The proxy itself can
 * still be serving first-round leftover (>2 candidates) on the morning of
 * runoff day — we only count it as "runoff data" when ≤2 candidates come
 * back AND they match our finalist slugs.
 */
async function tryOnpeRunoff(origin: string): Promise<ApiResponse | null> {
  try {
    const res = await fetch(`${origin}/api/onpe-results`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json().catch(() => null);
    if (!json || !Array.isArray(json.candidates)) return null;

    const matched = json.candidates
      .map((c: { name: string; code?: string; votes: number; percentage: number }) => {
        const slug = slugForOnpeName(c.name);
        return slug ? { ...c, slug } : null;
      })
      .filter(Boolean) as Array<{ slug: string; name: string; code?: string; votes: number; percentage: number }>;

    // Must have exactly the two finalists. Otherwise ONPE is still serving
    // first-round leftover or partial data — defer to the manual fallback.
    const slugSet = new Set(matched.map((c) => c.slug));
    if (slugSet.size < 2 || !RUNOFF_SLUGS.every((s) => slugSet.has(s))) return null;
    if (matched.length > 4) return null; // sanity: still too many

    return {
      source: "ONPE",
      sourceType: "official",
      isOfficial: true,
      capturedAt: new Date(json.progress?.updatedAt ?? Date.now()).toISOString(),
      actasPct: typeof json.progress?.percentage === "number" ? json.progress.percentage : null,
      actasCounted: json.progress?.counted ?? null,
      actasTotal: json.progress?.total ?? null,
      candidates: matched.map((c) => ({
        slug: c.slug,
        name: c.name,
        shortName: c.slug === "keiko-fujimori" ? "K. Fujimori" : "R. Sánchez",
        party: c.slug === "keiko-fujimori" ? "Fuerza Popular" : "Juntos por el Perú",
        partyColor: PARTY_COLORS[c.code ?? ""] ?? "#888",
        percentage: c.percentage,
        votes: c.votes,
      })),
    };
  } catch {
    return null;
  }
}

/**
 * Read the manually-curated runoff block from `homepage_blocks`. Latest
 * active row wins.
 */
async function readManualBlock(): Promise<ApiResponse | null> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("homepage_blocks")
      .select("content, title, subtitle, created_at")
      .eq("country_code", "pe")
      .eq("block_type", "runoff_conteo")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1);
    if (!data || data.length === 0) return null;
    const row = data[0] as { content: Partial<ApiResponse> & { source?: string; capturedAt?: string; captured_at?: string }; title?: string; subtitle?: string; created_at: string };
    const c = row.content || {};
    return {
      source: c.source ?? row.title ?? "Conteo en vivo",
      sourceType: c.sourceType ?? "waiting",
      isOfficial: Boolean(c.isOfficial),
      capturedAt: c.capturedAt ?? c.captured_at ?? row.created_at,
      actasPct: typeof c.actasPct === "number" ? c.actasPct : null,
      actasCounted: typeof c.actasCounted === "number" ? c.actasCounted : null,
      actasTotal: typeof c.actasTotal === "number" ? c.actasTotal : null,
      candidates: Array.isArray(c.candidates) ? c.candidates : [],
      note: c.note ?? row.subtitle,
    };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const fromOnpe = await tryOnpeRunoff(origin);
  if (fromOnpe) return NextResponse.json(fromOnpe);
  const fromManual = await readManualBlock();
  if (fromManual) return NextResponse.json(fromManual);
  // Fully empty — return a "waiting" payload so the client renders the
  // expectative state instead of failing.
  return NextResponse.json({
    source: "Esperando ONPE",
    sourceType: "waiting",
    isOfficial: false,
    capturedAt: new Date().toISOString(),
    actasPct: null,
    actasCounted: null,
    actasTotal: null,
    candidates: [
      { slug: "keiko-fujimori", name: "Keiko Fujimori", shortName: "K. Fujimori", party: "Fuerza Popular", partyColor: "#ff6600", percentage: null, votes: null },
      { slug: "roberto-sanchez", name: "Roberto Sánchez", shortName: "R. Sánchez", party: "Juntos por el Perú", partyColor: "#7c3aed", percentage: null, votes: null },
    ],
    note: "ONPE inicia transmisión apenas se procesen los primeros boletines.",
  } satisfies ApiResponse);
}
