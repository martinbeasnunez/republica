// =============================================================================
// CONDOR — Registraduría Nacional (Colombia) preconteo proxy
// =============================================================================
// Public endpoint used by https://resultados.registraduria.gov.co
//   GET /json/ACT/PR/:scopeCode.json
// where PR = "Presidente" and scopeCode "00" = Colombia nacional.
//
// We proxy + normalize so /co/en-vivo can render with a stable shape.
// Refresh cadence: the upstream config says polling.interval_MS: 5000ms; we
// cache 5s on our side to avoid hammering the origin.
// =============================================================================

import { NextResponse } from "next/server";

const REGISTRADURIA_BASE = "https://resultados.registraduria.gov.co";
const SCOPE_NACIONAL = "00";
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

// ── Upstream shape (subset we care about) ────────────────────────────────────
interface UpCandidato {
  codcan: string;
  nomcan: string;
  apecan: string;
  nomcan2?: string;
  apecan2?: string;
  vot: string;
  pvot: string;
  cedula?: string;
}
interface UpPartido {
  act: {
    codpar: string;
    vot: string;
    pvot: string;
    cantotabla: UpCandidato[];
  };
}
interface UpCamara {
  cam: string;
  partotabla: UpPartido[];
}
interface UpResponse {
  elec: string;
  amb: string;
  mdhm: string; // "05311600" → 31 may 16:00
  totales: {
    act: {
      metota: string | number;
      mesesc: string | number;
      pmesesc: string;
      meserr: string | number;
      centota: string | number;
      votant: string | number;
      pvotant: string;
      absten: string | number;
      pabsten: string;
      votnul: string | number;
      pvotnul: string;
      votblan: string | number;
      pvotblan: string;
      votval: string | number;
      pvotval: string;
    };
  };
  camaras: UpCamara[];
}

// ── Normalized shape (matches /api/onpe-results semantics) ──────────────────
interface NormCandidate {
  /** Stable Registraduría code, e.g. "1" */
  code: string;
  /** Party code in the Registraduría taxonomy */
  partyCode: string;
  /** Full president name (uppercase as upstream sends it) */
  name: string;
  /** "First name + paternal last name" — CO convention for ballot/campaign use */
  displayName: string;
  /** Running mate full name */
  runningMate?: string;
  votes: number;
  /** 0..100 (over valid votes) */
  percentage: number;
}

interface NormProgress {
  /** 0..100 share of polling tables counted */
  percentage: number;
  counted: number;
  total: number;
  pending: number;
  totalVotesEmitted: number;
  totalValidVotes: number;
  /** ms-since-epoch when the data was last produced (server time) */
  updatedAt: number;
}

interface NormResponse {
  source: "registraduria";
  electionCode: string;
  scopeCode: string;
  candidates: NormCandidate[];
  progress: NormProgress;
  blankVotes: number;
  nullVotes: number;
  /** Raw upstream "mdhm" datetime stamp ("MMDDhhmm") */
  upstreamStamp: string;
}

function toNum(v: string | number | undefined): number {
  if (v === undefined || v === null) return 0;
  if (typeof v === "number") return v;
  // Registraduría manda enteros con punto de miles: "4.461.691" o sin: "4461691".
  // Para enteros quitamos todo lo que no sea dígito.
  const cleaned = String(v).replace(/[^0-9-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function toPercent(v: string | number | undefined): number {
  if (v === undefined || v === null) return 0;
  if (typeof v === "number") return v;
  // Registraduría usa coma decimal: "48,44%". Lo normalizamos a punto antes de parsear.
  const cleaned = String(v).replace("%", "").trim().replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function normalize(up: UpResponse): NormResponse {
  const total = toNum(up.totales.act.metota);
  const counted = toNum(up.totales.act.mesesc);
  const validVotes = toNum(up.totales.act.votval);
  const emittedVotes = toNum(up.totales.act.votant);

  const candidates: NormCandidate[] = [];
  for (const partido of up.camaras?.[0]?.partotabla ?? []) {
    const codpar = partido.act?.codpar ?? "";
    for (const c of partido.act?.cantotabla ?? []) {
      const firstNames = (c.nomcan ?? "").trim();
      const lastNames = (c.apecan ?? "").trim();
      const president = `${firstNames} ${lastNames}`.trim();
      // CO display convention: primer nombre + primer apellido (paterno).
      // "ÓSCAR MAURICIO LIZCANO ARANGO" → "ÓSCAR LIZCANO".
      // Edge case: spanish particles like "DE LA", "DEL", "VAN DER" must not
      // be treated as the surname — extend until we hit a real word.
      // "ABELARDO" + "DE LA ESPRIELLA" → "ABELARDO DE LA ESPRIELLA"
      const firstName = firstNames.split(/\s+/)[0] ?? "";
      const lastTokens = lastNames.split(/\s+/);
      const particles = new Set(["DE", "DEL", "DELA", "LA", "LAS", "LOS", "VAN", "VON", "DA", "DOS"]);
      let surnameLen = 1;
      while (
        surnameLen <= lastTokens.length &&
        particles.has((lastTokens[surnameLen - 1] ?? "").toUpperCase())
      ) {
        surnameLen += 1;
      }
      // Always include the next non-particle token to actually carry the name
      surnameLen = Math.min(surnameLen, lastTokens.length);
      const paternalLastName = lastTokens.slice(0, surnameLen).join(" ");
      const displayName = `${firstName} ${paternalLastName}`.trim() || president;
      const runningMate = c.nomcan2 || c.apecan2
        ? `${c.nomcan2 ?? ""} ${c.apecan2 ?? ""}`.trim()
        : undefined;
      candidates.push({
        code: c.codcan,
        partyCode: codpar,
        name: president,
        displayName,
        runningMate,
        votes: toNum(c.vot),
        percentage: toPercent(c.pvot),
      });
    }
  }

  // Sort by votes desc so the UI shows the leader at top
  candidates.sort((a, b) => b.votes - a.votes);

  return {
    source: "registraduria",
    electionCode: up.elec,
    scopeCode: up.amb,
    candidates,
    progress: {
      percentage: toPercent(up.totales.act.pmesesc),
      counted,
      total,
      pending: Math.max(0, total - counted),
      totalVotesEmitted: emittedVotes,
      totalValidVotes: validVotes,
      updatedAt: Date.now(),
    },
    blankVotes: toNum(up.totales.act.votblan),
    nullVotes: toNum(up.totales.act.votnul),
    upstreamStamp: up.mdhm,
  };
}

export const revalidate = 5; // Cache 5s — matches upstream polling cadence

export async function GET() {
  try {
    const url = `${REGISTRADURIA_BASE}/json/ACT/PR/${SCOPE_NACIONAL}.json`;
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Registraduría no responde", status: res.status, detail: `Upstream ${res.status} for ${url}` },
        { status: 502 },
      );
    }
    const upstream = (await res.json()) as UpResponse;
    const normalized = normalize(upstream);
    return NextResponse.json(normalized, {
      headers: {
        // Browser cache short — match upstream polling interval
        "Cache-Control": "public, s-maxage=5, max-age=5, stale-while-revalidate=10",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Fallo al consultar Registraduría", detail: String(err) },
      { status: 502 },
    );
  }
}
