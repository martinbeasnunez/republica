import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

// =============================================================================
// CONDOR — Story image for the live runoff count (v3: tipografía + amor)
// =============================================================================
// 1080×1920 vertical PNG, suitable for Instagram/WhatsApp stories. Fetches the
// current `/api/runoff-conteo` snapshot at request time so each share is a
// fresh capture of the moment.
//
// Design intent v3:
//   - Inter + JetBrains Mono (mismas fonts que el sitio) cargadas via Google
//     Fonts gstatic, embebidas en el PNG con la fonts option de ImageResponse.
//   - Más cariño: candidatos en cards con shadow + party-color gradient sutil,
//     leader marcado con pill ARRIBA, hero number con tracking más apretado,
//     mejor jerarquía visual de arriba abajo.
//   - Más colores peruanos: rojo bandera arriba+abajo, stripes verticales
//     finitas en bordes, names del hero en rojo bandera.
// =============================================================================

export const runtime = "edge";
export const contentType = "image/png";

const W = 1080;
const H = 1920;

// Rojo bandera Perú. Slightly punchier than the standard #D91023 so it pops
// on small previews (WhatsApp thumbnails compress hard).
const ROJO_BANDERA = "#D91023";
const ROJO_OSCURO = "#8B0F1A";
const BLANCO_CALIDO = "#FAFAF9";

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
  totalVotesEmitted: number | null;
  candidates: ApiCandidate[];
  note?: string;
}

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString("es-PE");
}

function fmtCompact(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return Math.round(n / 1_000) + "K";
  return n.toLocaleString("es-PE");
}

// Hardcoded portrait URLs for the runoff finalists. Same hosts we already
// whitelist in next.config (mpesije.jne.gob.pe). The conteo API doesn't ship
// photo URLs, and we don't need a DB roundtrip — the finalist set is stable.
const FINALIST_PHOTO: Record<string, string> = {
  "keiko-fujimori": "https://mpesije.jne.gob.pe/apidocs/251cd1c0-acc7-4338-bd8a-439ccb9238d0.jpeg",
  "roberto-sanchez": "https://mpesije.jne.gob.pe/apidocs/bb7c7465-9c6e-44eb-ac7d-e6cc7f872a1a.jpg",
};

function tightnessLabel(deltaPp: number): { label: string; bg: string; fg: string } {
  if (deltaPp < 0.5) return { label: "Prácticamente empate", bg: "#FEF3C7", fg: "#78350F" };
  if (deltaPp < 2.5) return { label: "Empate técnico", bg: "#FEF3C7", fg: "#78350F" };
  if (deltaPp < 5)   return { label: "Diferencia ajustada", bg: "#E7E5E4", fg: "#292524" };
  return { label: "Diferencia clara", bg: "#E7E5E4", fg: "#292524" };
}

// ── Google Fonts loader for Satori ──────────────────────────────────────────
// Fetches the Google Fonts CSS for a (family, weight), extracts the woff2
// URL, downloads the binary. Satori supports woff2 in recent versions.
// Failures fall through to system-ui (the ImageResponse never throws).
async function loadGoogleFont(family: string, weight: number): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}`;
    const css = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
    }).then((r) => r.text());
    const match = css.match(/url\((https:\/\/[^)]+)\)\s*format\(['"]woff2['"]\)/);
    if (!match) return null;
    const fontRes = await fetch(match[1]);
    if (!fontRes.ok) return null;
    return await fontRes.arrayBuffer();
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;

  // Kick off font loads + data fetch in parallel — saves ~200ms.
  const [data, interRegular, interBold, interBlack, monoBold, monoBlack] = await Promise.all([
    fetch(`${origin}/api/runoff-conteo`, { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<ApiResponse>) : null))
      .catch(() => null),
    loadGoogleFont("Inter", 400),
    loadGoogleFont("Inter", 700),
    loadGoogleFont("Inter", 900),
    loadGoogleFont("JetBrains Mono", 700),
    loadGoogleFont("JetBrains Mono", 800),
  ]);

  const hasNumbers = !!data && data.candidates.some((c) => c.percentage != null);
  const sorted = data ? [...data.candidates].sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0)) : [];
  const leader = sorted[0];
  const runner = sorted[1];
  const voteGap = hasNumbers && leader?.votes != null && runner?.votes != null
    ? leader.votes - runner.votes
    : null;
  const ppGap = hasNumbers && leader?.percentage != null && runner?.percentage != null
    ? leader.percentage - runner.percentage
    : null;

  const sp = new URL(request.url).searchParams;
  const insightDir = sp.get("dir") as "widen" | "narrow" | "flat" | "flip" | null;
  const insightDeltaVotes = Number(sp.get("dv") ?? "0");
  const insightSince = Number(sp.get("sm") ?? "0");
  const insightLeader = sp.get("lead") || leader?.shortName || "";
  const insightRunner = sp.get("run") || runner?.shortName || "";

  const limaTime = new Date().toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Lima",
  });
  const limaDate = new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Lima",
  });

  const tight = ppGap != null ? tightnessLabel(ppGap) : { label: "Esperando ONPE", bg: "#E7E5E4", fg: "#292524" };

  const actasMissing = data?.actasCounted != null && data?.actasTotal != null
    ? Math.max(0, data.actasTotal - data.actasCounted)
    : null;
  const estRemainingVotes = (
    actasMissing != null &&
    data?.totalVotesEmitted != null &&
    data?.actasCounted != null &&
    data.actasCounted > 0
  )
    ? Math.round((data.totalVotesEmitted / data.actasCounted) * actasMissing)
    : null;

  let momentumPill: { label: string; bg: string; fg: string } | null = null;
  let momentumSentence: string = "";
  if (insightDir === "flip") {
    momentumPill = { label: "Cambió el líder", bg: "#059669", fg: "#FFFFFF" };
    momentumSentence = `Ahora va arriba ${insightLeader}`;
  } else if (insightDir === "widen" && insightDeltaVotes !== 0) {
    momentumPill = { label: "Se amplía", bg: "#FEE2E2", fg: "#9F1239" };
    momentumSentence = `${insightLeader} sumó +${fmt(insightDeltaVotes)} en ${insightSince} min`;
  } else if (insightDir === "narrow" && insightDeltaVotes !== 0) {
    momentumPill = { label: "Se achica", bg: "#D1FAE5", fg: "#065F46" };
    momentumSentence = `${insightRunner} se acercó ${fmt(Math.abs(insightDeltaVotes))} en ${insightSince} min`;
  } else if (insightDir === "flat") {
    momentumPill = { label: "Sin cambios", bg: "#E7E5E4", fg: "#44403C" };
    momentumSentence = "La distancia no se mueve";
  }

  const finalist1 = leader?.shortName ?? "—";
  const finalist2 = runner?.shortName ?? "—";

  // Build the fonts array for ImageResponse — drop entries where the fetch
  // failed; ImageResponse will fall back to system-ui for missing weights.
  const fonts = [
    interRegular && { name: "Inter", data: interRegular, style: "normal" as const, weight: 400 as const },
    interBold && { name: "Inter", data: interBold, style: "normal" as const, weight: 700 as const },
    interBlack && { name: "Inter", data: interBlack, style: "normal" as const, weight: 900 as const },
    monoBold && { name: "JetBrains Mono", data: monoBold, style: "normal" as const, weight: 700 as const },
    monoBlack && { name: "JetBrains Mono", data: monoBlack, style: "normal" as const, weight: 800 as const },
  ].filter(Boolean) as Array<{ name: string; data: ArrayBuffer; style: "normal"; weight: 400 | 700 | 900 | 800 }>;

  // Surname-only inside cards so they fit one line at 80pt without wrapping.
  const surnameOf = (c: ApiCandidate | undefined): string => {
    const n = (c?.shortName || c?.name || "—").replace(/^[A-Z]\.\s+/, "");
    return n;
  };
  const leaderSurname = surnameOf(leader);
  const runnerSurname = surnameOf(runner);

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: "flex",
          flexDirection: "column",
          background: BLANCO_CALIDO,
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Vertical rojo bandera stripes (decorative, evoke flag) */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 14, background: ROJO_BANDERA, display: "flex" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 14, background: ROJO_BANDERA, display: "flex" }} />

        {/* ── Top rojo bandera band ─────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "44px 70px 32px",
            background: `linear-gradient(135deg, ${ROJO_OSCURO} 0%, ${ROJO_BANDERA} 50%, ${ROJO_OSCURO} 100%)`,
            color: "white",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "white",
                  padding: "12px 26px",
                  borderRadius: 999,
                  boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
                }}
              >
                <div style={{ display: "flex", width: 14, height: 14, borderRadius: 999, background: ROJO_BANDERA }} />
                <div style={{ display: "flex", fontSize: 28, fontWeight: 900, letterSpacing: 5, color: ROJO_BANDERA, fontFamily: "Inter" }}>EN VIVO</div>
              </div>
              <div style={{ display: "flex", fontSize: 32, fontWeight: 700, color: "white", letterSpacing: 0.5, fontFamily: "Inter" }}>
                Balotaje Perú 2026
              </div>
            </div>
            <div style={{ display: "flex", fontSize: 30, fontFamily: "JetBrains Mono", color: "white", fontWeight: 800 }}>
              {limaTime}
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 20, color: "rgba(255,255,255,0.85)", letterSpacing: 1, fontFamily: "Inter", fontWeight: 400 }}>
            {limaDate} · hora Lima
          </div>
        </div>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            paddingTop: 56,
            paddingLeft: 72,
            paddingRight: 72,
            paddingBottom: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <div style={{ display: "flex", width: 12, height: 12, borderRadius: 999, background: ROJO_BANDERA }} />
            <div style={{ display: "flex", fontSize: 28, color: ROJO_BANDERA, fontWeight: 900, letterSpacing: 6, textTransform: "uppercase", fontFamily: "Inter" }}>
              Diferencia ahora
            </div>
          </div>

          {hasNumbers && voteGap != null && (
            <div style={{ display: "flex", alignItems: "baseline", marginBottom: 14 }}>
              <div style={{ display: "flex", fontSize: 280, fontWeight: 800, color: "#0a0a0a", lineHeight: 0.85, fontFamily: "JetBrains Mono", letterSpacing: -10 }}>
                {fmt(voteGap)}
              </div>
              <div style={{ display: "flex", fontSize: 52, fontWeight: 700, color: "#57534e", marginLeft: 22, fontFamily: "Inter" }}>votos</div>
            </div>
          )}

          {hasNumbers && (
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", marginBottom: 28, gap: 12 }}>
              <div style={{ display: "flex", fontSize: 38, color: "#44403c", fontWeight: 400, fontFamily: "Inter" }}>los separan a</div>
              <div style={{ display: "flex", fontSize: 46, color: ROJO_BANDERA, fontWeight: 900, fontFamily: "Inter" }}>{finalist1}</div>
              <div style={{ display: "flex", fontSize: 38, color: "#44403c", fontWeight: 400, fontFamily: "Inter" }}>de</div>
              <div style={{ display: "flex", fontSize: 46, color: ROJO_BANDERA, fontWeight: 900, fontFamily: "Inter" }}>{finalist2}</div>
            </div>
          )}

          {hasNumbers && ppGap != null && (
            <div style={{ display: "flex", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 16 }}>
              <div
                style={{
                  display: "flex",
                  fontSize: 28,
                  fontWeight: 900,
                  background: tight.bg,
                  color: tight.fg,
                  padding: "14px 28px",
                  borderRadius: 999,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  fontFamily: "Inter",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                {tight.label}
              </div>
              <div style={{ display: "flex", fontSize: 30, color: "#1c1917", fontFamily: "JetBrains Mono", fontWeight: 800 }}>
                {ppGap < 0.1 ? "<0.1" : ppGap.toFixed(1)}% de diferencia
              </div>
            </div>
          )}

          {hasNumbers && momentumPill && (
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
              <div
                style={{
                  display: "flex",
                  fontSize: 24,
                  fontWeight: 900,
                  background: momentumPill.bg,
                  color: momentumPill.fg,
                  padding: "12px 24px",
                  borderRadius: 999,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  fontFamily: "Inter",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                {momentumPill.label}
              </div>
              <div style={{ display: "flex", fontSize: 26, color: "#44403c", fontWeight: 500, fontFamily: "Inter" }}>
                {momentumSentence}
              </div>
            </div>
          )}

          {!hasNumbers && (
            <div style={{ display: "flex", fontSize: 72, fontWeight: 900, color: ROJO_BANDERA, lineHeight: 1.1, fontFamily: "Inter" }}>
              Esperando datos de ONPE
            </div>
          )}
        </div>

        {/* ── Candidate cards ───────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", padding: "48px 72px 0", gap: 22, width: "100%" }}>
          {[leader, runner].filter(Boolean).map((c, idx) => {
            const isLeader = idx === 0;
            const color = c!.partyColor ?? "#888";
            const surname = idx === 0 ? leaderSurname : runnerSurname;
            return (
              <div
                key={c!.slug ?? c!.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 30,
                  padding: "28px 34px",
                  background: `linear-gradient(90deg, ${color}10 0%, white 50%)`,
                  borderRadius: 28,
                  boxShadow: `0 4px 18px rgba(0,0,0,0.06), inset 8px 0 0 ${color}`,
                  position: "relative",
                }}
              >
                {c!.slug && FINALIST_PHOTO[c!.slug] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={FINALIST_PHOTO[c!.slug]}
                    width={160}
                    height={160}
                    style={{
                      borderRadius: 20,
                      objectFit: "cover",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                    }}
                    alt={c!.name}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      width: 160,
                      height: 160,
                      borderRadius: 20,
                      background: color + "33",
                    }}
                  />
                )}
                <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ display: "flex", fontSize: 22, fontWeight: 900, color: color, letterSpacing: 2, textTransform: "uppercase", fontFamily: "Inter" }}>
                      {c!.party}
                    </div>
                    {isLeader && (
                      <div
                        style={{
                          display: "flex",
                          fontSize: 16,
                          fontWeight: 900,
                          color: "white",
                          background: color,
                          padding: "4px 12px",
                          borderRadius: 999,
                          letterSpacing: 2,
                          fontFamily: "Inter",
                        }}
                      >
                        ARRIBA
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", fontSize: 80, fontWeight: 900, color: "#0a0a0a", lineHeight: 1, fontFamily: "Inter", letterSpacing: -1 }}>
                    {surname}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <div style={{ display: "flex", alignItems: "baseline" }}>
                    <div style={{ display: "flex", fontSize: 144, fontWeight: 800, color: color, fontFamily: "JetBrains Mono", lineHeight: 1, letterSpacing: -4 }}>
                      {c!.percentage != null ? c!.percentage.toFixed(1) : "—"}
                    </div>
                    <div style={{ display: "flex", fontSize: 50, color: "#a8a29e", fontWeight: 800, marginLeft: 6, fontFamily: "Inter" }}>%</div>
                  </div>
                  {c!.votes != null && (
                    <div style={{ display: "flex", fontSize: 24, color: "#57534e", fontFamily: "JetBrains Mono", fontWeight: 700, marginTop: 2 }}>
                      {fmt(c!.votes)} votos
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Actas progress + faltan ───────────────────────────────────── */}
        {data?.actasPct != null && data.actasPct > 0 && (
          <div style={{ display: "flex", flexDirection: "column", padding: "42px 72px 0", gap: 14, width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ display: "flex", fontSize: 24, fontWeight: 900, color: "#065F46", letterSpacing: 3, textTransform: "uppercase", fontFamily: "Inter" }}>
                Actas escrutadas · {data.actasPct.toFixed(1)}%
              </div>
              <div style={{ display: "flex", fontSize: 26, color: "#047857", fontFamily: "JetBrains Mono", fontWeight: 800 }}>
                {fmt(data.actasCounted)} / {fmt(data.actasTotal)}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                width: "100%",
                height: 24,
                borderRadius: 999,
                background: "#D1FAE5",
                overflow: "hidden",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: `${Math.min(100, data.actasPct)}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #10b981 0%, #059669 100%)",
                  boxShadow: "0 1px 3px rgba(5,150,105,0.4)",
                }}
              />
            </div>
            {actasMissing != null && actasMissing > 0 && (
              <div style={{ display: "flex", fontSize: 24, color: "#065F46", fontWeight: 500, fontFamily: "Inter" }}>
                {estRemainingVotes != null && estRemainingVotes > 0
                  ? `Faltan ${fmt(actasMissing)} actas — ~${fmtCompact(estRemainingVotes)} votos por contar`
                  : `Faltan ${fmt(actasMissing)} actas por escrutar`}
              </div>
            )}
            {actasMissing === 0 && (
              <div style={{ display: "flex", fontSize: 26, color: "#065F46", fontWeight: 900, fontFamily: "Inter" }}>
                Cómputo al 100% — todas las actas escrutadas
              </div>
            )}
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1, display: "flex" }} />

        {/* ── Footer rojo bandera CTA ───────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "48px 72px 60px",
            background: `linear-gradient(180deg, transparent 0%, ${ROJO_BANDERA} 40%, ${ROJO_OSCURO} 100%)`,
            width: "100%",
          }}
        >
          <div style={{ display: "flex", fontSize: 22, color: "rgba(255,255,255,0.85)", letterSpacing: 6, textTransform: "uppercase", fontWeight: 800, marginBottom: 12, fontFamily: "Inter" }}>
            Inteligencia electoral con IA
          </div>
          <div style={{ display: "flex", fontSize: 80, fontWeight: 900, color: "white", letterSpacing: -2, lineHeight: 1, fontFamily: "Inter" }}>
            condorlatam.com/pe
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 20 }}>
            <div style={{ display: "flex", fontSize: 22, color: "white", fontWeight: 800, background: "rgba(0,0,0,0.28)", padding: "8px 20px", borderRadius: 999, fontFamily: "Inter" }}>
              @condorlatam
            </div>
            <div style={{ display: "flex", fontSize: 22, color: "rgba(255,255,255,0.9)", fontWeight: 500, fontFamily: "Inter" }}>
              Conteo · análisis · verificación
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: fonts.length > 0 ? fonts : undefined,
    },
  );
}
