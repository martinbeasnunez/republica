import { NextResponse } from "next/server";

const ONPE_BASE = "https://resultadoelectoral.onpe.gob.pe/presentacion-backend";
const ELECTION_ID = 10; // 2026 general election

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

async function onpeFetch(path: string) {
  return fetch(
    `${ONPE_BASE}/${path}?idEleccion=${ELECTION_ID}&tipoFiltro=eleccion`,
    {
      method: "GET",
      headers: ONPE_HEADERS,
      cache: "no-store",
    }
  );
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
    const [candidatesRes, totalsRes] = await Promise.all([
      onpeFetch("eleccion-presidencial/participantes-ubicacion-geografica-nombre"),
      onpeFetch("resumen-general/totales"),
    ]);

    if (!candidatesRes.ok || !totalsRes.ok) {
      return NextResponse.json(
        {
          error: "ONPE API unavailable",
          detail: `candidates=${candidatesRes.status} totals=${totalsRes.status}`,
        },
        { status: 502 }
      );
    }

    const [candidatesJson, totalsJson] = await Promise.all([
      parseJsonOrFail(candidatesRes, "candidates"),
      parseJsonOrFail(totalsRes, "totals"),
    ]);

    const candidates = (candidatesJson.data || [])
      .filter(
        (d: Record<string, string>) =>
          d.codigoAgrupacionPolitica !== "80" &&
          d.codigoAgrupacionPolitica !== "81"
      )
      .map(
        (d: Record<string, string | number>) => ({
          name: d.nombreCandidato,
          party: d.nombreAgrupacionPolitica,
          votes: d.totalVotosValidos,
          percentage: d.porcentajeVotosValidos,
          percentageEmitted: d.porcentajeVotosEmitidos,
          code: d.codigoAgrupacionPolitica,
          dni: d.dniCandidato,
        })
      );

    const totals = totalsJson.data || {};
    const blankVotes = (candidatesJson.data || []).find(
      (d: Record<string, string>) => d.codigoAgrupacionPolitica === "80"
    );
    const nullVotes = (candidatesJson.data || []).find(
      (d: Record<string, string>) => d.codigoAgrupacionPolitica === "81"
    );

    return NextResponse.json({
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
