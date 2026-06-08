import { NextResponse } from "next/server";

// ONPE deployed the runoff on a SEPARATE subdomain, not a new idEleccion on
// the same host (resultadoelectoral). Both sides use idEleccion=10. We
// prefer the runoff subdomain when it responds with runoff-shape data
// (1–2 candidates), otherwise fall back to the first-round subdomain so
// historical/late-flip behavior keeps working.
const ONPE_RUNOFF_BASE = "https://resultadosegundavuelta.onpe.gob.pe/presentacion-backend";
const ONPE_FIRST_BASE = "https://resultadoelectoral.onpe.gob.pe/presentacion-backend";
const ELECTION_ID = 10;

// Full browser-like headers. CloudFront's cache key includes sec-ch-ua/
// Sec-Fetch-* — without them we land in a poisoned cache bucket that
// returns a stale SPA HTML fallback with `x-cache: Error from cloudfront`.
// With them we get fresh JSON (`Hit from cloudfront`, same BOG51 edge).
function onpeHeaders(base: string): HeadersInit {
  // CloudFront cache is keyed on these — without them we get the SPA shell.
  // The Referer must match the host we're hitting so each subdomain serves
  // its own cached bucket.
  const host = new URL(base).host;
  return {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
    Referer: `https://${host}/main/resumen`,
    "sec-ch-ua": '"Chromium";v="132", "Not A(Brand";v="24"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
  };
}

async function onpeFetch(base: string, path: string, idEleccion: number) {
  return fetch(
    `${base}/${path}?idEleccion=${idEleccion}&tipoFiltro=eleccion`,
    {
      method: "GET",
      headers: onpeHeaders(base),
      cache: "no-store",
    }
  );
}

/**
 * Filter the raw `data` array into the candidate row shape. Drops the
 * blank / null vote pseudo-rows (codes 80/81).
 */
function shapeCandidates(rawData: Record<string, string | number>[]): Array<{
  name: string;
  party: string;
  votes: number | string;
  percentage: number | string;
  percentageEmitted: number | string;
  code: string;
  dni: string;
}> {
  return (rawData || [])
    .filter(
      (d) => d.codigoAgrupacionPolitica !== "80" && d.codigoAgrupacionPolitica !== "81"
    )
    .map((d) => ({
      name: d.nombreCandidato as string,
      party: d.nombreAgrupacionPolitica as string,
      votes: d.totalVotosValidos,
      percentage: d.porcentajeVotosValidos,
      percentageEmitted: d.porcentajeVotosEmitidos,
      code: d.codigoAgrupacionPolitica as string,
      dni: d.dniCandidato as string,
    }));
}

/**
 * Pick the ONPE host that's currently serving the active election. Tries the
 * runoff subdomain first — if it returns runoff-shape data (≤2 candidate
 * rows) that's the source of truth. Falls back to the first-round subdomain
 * (which still serves the closed 1ra vuelta dataset as historical record).
 */
async function pickActiveHost(): Promise<string> {
  try {
    const res = await onpeFetch(
      ONPE_RUNOFF_BASE,
      "eleccion-presidencial/participantes-ubicacion-geografica-nombre",
      ELECTION_ID,
    );
    if (res.ok) {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const json = await res.json().catch(() => null);
        const cands = shapeCandidates(json?.data || []);
        if (cands.length > 0 && cands.length <= 2) return ONPE_RUNOFF_BASE;
      }
    }
  } catch {
    /* fall through */
  }
  return ONPE_FIRST_BASE;
}

async function parseJsonOrFail(res: Response, label: string) {
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    // CloudFront serves the Angular SPA shell (text/html) when the origin
    // is erroring, so res.ok can be true while the body is useless HTML.
    throw new Error(
      `ONPE ${label} returned non-JSON (${contentType}, status ${res.status})`
    );
  }
  return res.json();
}

export async function GET() {
  try {
    const base = await pickActiveHost();
    const isRunoff = base === ONPE_RUNOFF_BASE;
    const [candidatesRes, totalsRes] = await Promise.all([
      onpeFetch(base, "eleccion-presidencial/participantes-ubicacion-geografica-nombre", ELECTION_ID),
      onpeFetch(base, "resumen-general/totales", ELECTION_ID),
    ]);

    if (!candidatesRes.ok || !totalsRes.ok) {
      return NextResponse.json(
        {
          error: "ONPE API unavailable",
          detail: `candidates=${candidatesRes.status} totals=${totalsRes.status} (host=${new URL(base).host})`,
        },
        { status: 502 }
      );
    }

    const [candidatesJson, totalsJson] = await Promise.all([
      parseJsonOrFail(candidatesRes, "candidates"),
      parseJsonOrFail(totalsRes, "totals"),
    ]);

    const candidates = shapeCandidates(candidatesJson.data || []);

    const totals = totalsJson.data || {};
    const blankVotes = (candidatesJson.data || []).find(
      (d: Record<string, string>) => d.codigoAgrupacionPolitica === "80"
    );
    const nullVotes = (candidatesJson.data || []).find(
      (d: Record<string, string>) => d.codigoAgrupacionPolitica === "81"
    );

    return NextResponse.json({
      electionId: ELECTION_ID,
      host: new URL(base).host,
      isRunoff,
      candidates,
      progress: {
        percentage: totals.actasContabilizadas,
        counted: totals.contabilizadas,
        total: totals.totalActas,
        pending: totals.pendientesJee,
        sentToJEE: totals.enviadasJee,
        totalVotesEmitted: totals.totalVotosEmitidos,
        totalValidVotes: totals.totalVotosValidos,
        updatedAt: totals.fechaActualizacion,
      },
      blankVotes: blankVotes?.totalVotosValidos || 0,
      nullVotes: nullVotes?.totalVotosValidos || 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    return NextResponse.json(
      { error: "Failed to fetch ONPE results", detail: message },
      { status: 502 }
    );
  }
}
