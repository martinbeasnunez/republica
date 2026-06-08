import { NextResponse } from "next/server";

const ONPE_BASE = "https://resultadoelectoral.onpe.gob.pe/presentacion-backend";
// First round = ID 10. The runoff lives on a separate idEleccion that ONPE
// only stands up when they're ready to transmit boletines. We try a few
// candidate IDs in descending order (newest first) and use the first one
// that returns runoff-shape data (≤2 candidate rows). If none does, we
// fall back to ID 10 so the route stays a working "results" probe.
const RUNOFF_CANDIDATE_IDS = [16, 15, 14, 13, 12, 11];
const FIRST_ROUND_ID = 10;

// Full browser-like headers. CloudFront's cache key includes sec-ch-ua/
// Sec-Fetch-* — without them we land in a poisoned cache bucket that
// returns a stale SPA HTML fallback with `x-cache: Error from cloudfront`.
// With them we get fresh JSON (`Hit from cloudfront`, same BOG51 edge).
const ONPE_HEADERS: HeadersInit = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
  Referer: "https://resultadoelectoral.onpe.gob.pe/main/presidenciales",
  "sec-ch-ua": '"Chromium";v="132", "Not A(Brand";v="24"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"macOS"',
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
};

async function onpeFetch(path: string, idEleccion: number) {
  return fetch(
    `${ONPE_BASE}/${path}?idEleccion=${idEleccion}&tipoFiltro=eleccion`,
    {
      method: "GET",
      headers: ONPE_HEADERS,
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
 * Pull the first ONPE election ID that:
 *   - responds with JSON, AND
 *   - has at least one candidate row.
 * Prefers runoff-shape (≤2 candidate rows) so once ONPE flips the runoff
 * endpoint we surface it immediately. Falls back to the first round if no
 * runoff ID exists yet.
 */
async function pickActiveElection(): Promise<number | null> {
  for (const id of RUNOFF_CANDIDATE_IDS) {
    try {
      const res = await onpeFetch(
        "eleccion-presidencial/participantes-ubicacion-geografica-nombre",
        id,
      );
      if (!res.ok) continue;
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) continue;
      const json = await res.json().catch(() => null);
      const cands = shapeCandidates(json?.data || []);
      if (cands.length > 0 && cands.length <= 2) return id;
    } catch {
      /* try next */
    }
  }
  return FIRST_ROUND_ID;
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
    const electionId = (await pickActiveElection()) ?? FIRST_ROUND_ID;
    const [candidatesRes, totalsRes] = await Promise.all([
      onpeFetch("eleccion-presidencial/participantes-ubicacion-geografica-nombre", electionId),
      onpeFetch("resumen-general/totales", electionId),
    ]);

    if (!candidatesRes.ok || !totalsRes.ok) {
      return NextResponse.json(
        {
          error: "ONPE API unavailable",
          detail: `candidates=${candidatesRes.status} totals=${totalsRes.status} (idEleccion=${electionId})`,
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
      electionId,
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
