import type { CountryCode } from "@/lib/config/countries";
import type { RawPollRow } from "./wikipedia";

/**
 * Poll validator — strict gauntlet run on every RawPollRow before insert.
 * If ANY check fails, the row is rejected and logged. Zero tolerance for
 * ambiguous or incomplete data — the user explicitly required "solo datos
 * oficiales, sin errores".
 */

// =============================================================================
// CONFIG
// =============================================================================

/**
 * Pollster whitelist per country. Names are normalized (diacritic-free,
 * lowercased, collapsed whitespace). A pollster name passes if after
 * taking the primary publisher (everything before the first "/") and
 * normalizing, it matches any entry here.
 */
const POLLSTER_WHITELIST: Record<CountryCode, string[]> = {
  co: [
    "invamer",
    "cnc",
    "centro nacional de consultoria",
    "guarumo",
    "guarumo/ecoanalitica",
    "gad3",
    "atlasintel",
    "atlas intel",
    "celag",
    "datexco",
    "yanhaas",
    "cifras y conceptos",
  ],
  pe: [
    "ipsos",
    "ipsos peru",
    "datum",
    "datum internacional",
    "iep",
    "cpi",
    "atlas intel",
    "atlasintel",
  ],
};

/** Minimum industry-acceptable sample size for a national presidential poll. */
const MIN_SAMPLE_SIZE = 400;

/** Values outside this range are implausible for a candidate share. */
const MIN_SHARE = 0;
const MAX_SHARE = 70;

/** Sum of all captured candidate shares must be at most this (allows undecideds/blanks). */
const MAX_TOTAL_SHARE = 105;

/** Minimum number of candidates successfully mapped per row. */
const MIN_MAPPED_CANDIDATES = 2;

/** Max age (in days) of a poll before we consider it stale and skip it. */
const MAX_AGE_DAYS = 180;

// =============================================================================
// TYPES
// =============================================================================

export interface NormalizedPoll {
  pollster: string; // canonical (e.g. "Atlas Intel", "CNC")
  field_start: string | null;
  field_end: string; // ISO YYYY-MM-DD
  sample_size: number | null;
  source_url: string;
  shares: Record<string, number>;
}

export type ValidationResult =
  | { ok: true; normalized: NormalizedPoll }
  | { ok: false; reason: string; code: ValidationRejectCode };

export type ValidationRejectCode =
  | "unknown_pollster"
  | "invalid_date"
  | "future_date"
  | "stale_date"
  | "sample_too_small"
  | "missing_sample"
  | "too_few_candidates"
  | "share_out_of_range"
  | "sum_exceeds_cap"
  | "missing_source";

// =============================================================================
// HELPERS
// =============================================================================

function stripDiacritics(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalize(s: string): string {
  return stripDiacritics(s)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Extract the canonical pollster name. Wikipedia often formats joint
 * publications as "Pollster/Outlet" (e.g. "Ipsos Perú/Perú21/Latina",
 * "Guarumo/EcoAnalítica"). Take the substring before the first "/" as the
 * canonical pollster. Guarumo/EcoAnalítica is whitelisted explicitly
 * because both are known co-pollsters.
 */
function canonicalPollster(raw: string): { canonical: string; normalized: string } {
  const trimmed = raw.trim();
  // Keep "guarumo/ecoanalitica" as-is; otherwise take the first segment
  const normalizedFull = normalize(trimmed);
  if (normalizedFull.startsWith("guarumo/ecoanalitica")) {
    return { canonical: "Guarumo/EcoAnalítica", normalized: "guarumo/ecoanalitica" };
  }
  const firstSegment = trimmed.split("/")[0].trim();
  return {
    canonical: firstSegment,
    normalized: normalize(firstSegment),
  };
}

function isPollsterAllowed(
  normalized: string,
  country: CountryCode
): boolean {
  const whitelist = POLLSTER_WHITELIST[country] || [];
  return whitelist.some((w) => normalized === w || normalized.startsWith(w + " ") || normalized === w);
}

function daysBetween(isoA: string, isoB: string): number {
  return Math.round(
    (new Date(isoB).getTime() - new Date(isoA).getTime()) / (1000 * 60 * 60 * 24)
  );
}

// =============================================================================
// PUBLIC API
// =============================================================================

export function validatePoll(
  raw: RawPollRow,
  country: CountryCode,
  now: Date = new Date()
): ValidationResult {
  // 1. Pollster whitelist
  const { canonical, normalized } = canonicalPollster(raw.pollster);
  if (!normalized || !isPollsterAllowed(normalized, country)) {
    return {
      ok: false,
      code: "unknown_pollster",
      reason: `Pollster "${raw.pollster}" no reconocida para ${country}`,
    };
  }

  // 2. Date validity
  if (!raw.field_end || !/^\d{4}-\d{2}-\d{2}$/.test(raw.field_end)) {
    return { ok: false, code: "invalid_date", reason: `Fecha inválida: "${raw.field_end}"` };
  }
  const fieldEndDate = new Date(raw.field_end + "T00:00:00Z");
  if (Number.isNaN(fieldEndDate.getTime())) {
    return { ok: false, code: "invalid_date", reason: `Fecha no parseable: "${raw.field_end}"` };
  }
  if (fieldEndDate.getTime() > now.getTime() + 24 * 60 * 60 * 1000) {
    return { ok: false, code: "future_date", reason: `Fecha futura: ${raw.field_end}` };
  }
  const ageDays = daysBetween(raw.field_end, now.toISOString().slice(0, 10));
  if (ageDays > MAX_AGE_DAYS) {
    return {
      ok: false,
      code: "stale_date",
      reason: `Encuesta muy antigua (${ageDays} días): ${raw.field_end}`,
    };
  }

  // 3. Sample size
  if (raw.sample_size == null) {
    return { ok: false, code: "missing_sample", reason: `Sin muestra reportada` };
  }
  if (raw.sample_size < MIN_SAMPLE_SIZE) {
    return {
      ok: false,
      code: "sample_too_small",
      reason: `Muestra ${raw.sample_size} < ${MIN_SAMPLE_SIZE}`,
    };
  }

  // 4. Candidate shares
  const entries = Object.entries(raw.shares);
  if (entries.length < MIN_MAPPED_CANDIDATES) {
    return {
      ok: false,
      code: "too_few_candidates",
      reason: `Solo ${entries.length} candidatos mapeados (mínimo ${MIN_MAPPED_CANDIDATES})`,
    };
  }

  let total = 0;
  for (const [candidateId, value] of entries) {
    if (!Number.isFinite(value) || value < MIN_SHARE || value > MAX_SHARE) {
      return {
        ok: false,
        code: "share_out_of_range",
        reason: `${candidateId} = ${value}% fuera de rango [${MIN_SHARE}, ${MAX_SHARE}]`,
      };
    }
    total += value;
  }
  if (total > MAX_TOTAL_SHARE) {
    return {
      ok: false,
      code: "sum_exceeds_cap",
      reason: `Suma de shares ${total.toFixed(1)}% > ${MAX_TOTAL_SHARE}%`,
    };
  }

  // 5. Source URL
  if (!raw.source_url || !/^https?:\/\//.test(raw.source_url)) {
    return { ok: false, code: "missing_source", reason: `Sin URL de fuente` };
  }

  return {
    ok: true,
    normalized: {
      pollster: canonical,
      field_start: raw.field_start,
      field_end: raw.field_end,
      sample_size: raw.sample_size,
      source_url: raw.source_url,
      shares: raw.shares,
    },
  };
}
