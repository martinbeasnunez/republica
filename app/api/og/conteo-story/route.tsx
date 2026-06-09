import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

// =============================================================================
// CONDOR — Story image for the live runoff count (v2: más Perú, más love)
// =============================================================================
// 1080×1920 vertical PNG, suitable for Instagram/WhatsApp stories. Fetches the
// current `/api/runoff-conteo` snapshot at request time so each share is a
// fresh capture of the moment.
//
// Design intent (per user feedback):
//   - "letra más grande" — hero number ~280pt, everything bumped one tier
//   - "más colores peruanos" — rojo bandera (#D91023) as top + bottom bands,
//     evoking the vertical rojo-blanco-rojo of the Peruvian flag
//   - "más diseño, más amor" — bigger portraits, cleaner cards, hierarchy
//   - "más compartible" — @condorlatam handle, date stamp, prominent CTA
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

// Format a vote count compactly for tight rows: 798,042 → 798K
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

export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;
  let data: ApiResponse | null = null;
  try {
    const res = await fetch(`${origin}/api/runoff-conteo`, { cache: "no-store" });
    if (res.ok) data = await res.json();
  } catch {
    /* render the waiting state below */
  }

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

  // Insight from query params (the client supplies them so we don't have to
  // recompute snapshot deltas server-side — that data only lives in the
  // browser session's ref).
  const sp = new URL(request.url).searchParams;
  const insightDir = sp.get("dir") as "widen" | "narrow" | "flat" | "flip" | null;
  const insightDeltaVotes = Number(sp.get("dv") ?? "0");
  const insightSince = Number(sp.get("sm") ?? "0");
  const insightLeader = sp.get("lead") || leader?.shortName || "";
  const insightRunner = sp.get("run") || runner?.shortName || "";

  // Lima hour + date for the timestamp ribbon (gives shareable context: "this
  // image is from XX:XX on Domingo 7 jun" — not just a percent floating in
  // time).
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

  // Momentum copy
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
    momentumSentence = `${insightRunner} recortó ${fmt(Math.abs(insightDeltaVotes))} en ${insightSince} min`;
  } else if (insightDir === "flat") {
    momentumPill = { label: "Sin cambios", bg: "#E7E5E4", fg: "#44403C" };
    momentumSentence = "La distancia no se mueve";
  }

  // Build the hero "votos separan a X de Y" — each candidate name is a
  // separate flex child so Satori spaces them correctly.
  const finalist1 = leader?.shortName ?? "—";
  const finalist2 = runner?.shortName ?? "—";

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: "flex",
          flexDirection: "column",
          background: BLANCO_CALIDO,
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* ── Vertical rojo bandera stripes (decorative, evoke flag) ──────── */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 14, background: ROJO_BANDERA, display: "flex" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 14, background: ROJO_BANDERA, display: "flex" }} />

        {/* ── Top rojo bandera band ─────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "44px 70px 36px",
            background: `linear-gradient(135deg, ${ROJO_OSCURO} 0%, ${ROJO_BANDERA} 50%, ${ROJO_OSCURO} 100%)`,
            color: "white",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "white",
                  padding: "12px 26px",
                  borderRadius: 999,
                }}
              >
                <div style={{ display: "flex", width: 16, height: 16, borderRadius: 999, background: ROJO_BANDERA }} />
                <div style={{ display: "flex", fontSize: 30, fontWeight: 900, letterSpacing: 5, color: ROJO_BANDERA }}>EN VIVO</div>
              </div>
              <div style={{ display: "flex", fontSize: 34, fontWeight: 800, color: "white", letterSpacing: 1 }}>
                Balotaje Perú 2026
              </div>
            </div>
            <div style={{ display: "flex", fontSize: 28, fontFamily: "monospace", color: "white", fontWeight: 700 }}>
              {limaTime}
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "rgba(255,255,255,0.85)", letterSpacing: 1 }}>
            {limaDate} · hora Lima
          </div>
        </div>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            paddingTop: 60,
            paddingLeft: 72,
            paddingRight: 72,
            paddingBottom: 0,
          }}
        >
          {/* "DIFERENCIA AHORA" eyebrow */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 22,
            }}
          >
            <div style={{ display: "flex", width: 12, height: 12, borderRadius: 999, background: ROJO_BANDERA }} />
            <div style={{ display: "flex", fontSize: 32, color: ROJO_BANDERA, fontWeight: 900, letterSpacing: 6, textTransform: "uppercase" }}>
              Diferencia ahora
            </div>
          </div>

          {/* Big vote count + "votos" */}
          {hasNumbers && voteGap != null && (
            <div style={{ display: "flex", alignItems: "baseline", marginBottom: 18 }}>
              <div style={{ display: "flex", fontSize: 280, fontWeight: 900, color: "#0a0a0a", lineHeight: 0.85, fontFamily: "monospace", letterSpacing: -10 }}>
                {fmt(voteGap)}
              </div>
              <div style={{ display: "flex", fontSize: 56, fontWeight: 800, color: "#57534e", marginLeft: 28 }}>votos</div>
            </div>
          )}

          {/* "los separan a X de Y" — each name as separate flex child */}
          {hasNumbers && (
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", marginBottom: 32, gap: 14 }}>
              <div style={{ display: "flex", fontSize: 44, color: "#44403c", fontWeight: 500 }}>los separan a</div>
              <div style={{ display: "flex", fontSize: 52, color: ROJO_BANDERA, fontWeight: 900 }}>{finalist1}</div>
              <div style={{ display: "flex", fontSize: 44, color: "#44403c", fontWeight: 500 }}>de</div>
              <div style={{ display: "flex", fontSize: 52, color: ROJO_BANDERA, fontWeight: 900 }}>{finalist2}</div>
            </div>
          )}

          {/* Tightness pill row */}
          {hasNumbers && ppGap != null && (
            <div style={{ display: "flex", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 18 }}>
              <div
                style={{
                  display: "flex",
                  fontSize: 30,
                  fontWeight: 900,
                  background: tight.bg,
                  color: tight.fg,
                  padding: "16px 32px",
                  borderRadius: 999,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                }}
              >
                {tight.label}
              </div>
              <div style={{ display: "flex", fontSize: 32, color: "#1c1917", fontFamily: "monospace", fontWeight: 800 }}>
                {ppGap < 0.1 ? "<0.1" : ppGap.toFixed(1)}% de diferencia
              </div>
            </div>
          )}

          {/* Momentum row */}
          {hasNumbers && momentumPill && (
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <div
                style={{
                  display: "flex",
                  fontSize: 26,
                  fontWeight: 900,
                  background: momentumPill.bg,
                  color: momentumPill.fg,
                  padding: "14px 28px",
                  borderRadius: 999,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                }}
              >
                {momentumPill.label}
              </div>
              <div style={{ display: "flex", fontSize: 28, color: "#44403c", fontWeight: 600 }}>
                {momentumSentence}
              </div>
            </div>
          )}

          {!hasNumbers && (
            <div style={{ display: "flex", fontSize: 72, fontWeight: 900, color: ROJO_BANDERA, lineHeight: 1.1 }}>
              Esperando datos de ONPE
            </div>
          )}
        </div>

        {/* ── Candidate cards ───────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", padding: "52px 72px 0", gap: 22, width: "100%" }}>
          {[leader, runner].filter(Boolean).map((c) => (
            <div
              key={c!.slug ?? c!.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 32,
                padding: "30px 36px",
                background: "white",
                borderRadius: 28,
                border: `5px solid ${c!.partyColor ?? "#888"}`,
              }}
            >
              {c!.slug && FINALIST_PHOTO[c!.slug] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={FINALIST_PHOTO[c!.slug]}
                  width={170}
                  height={170}
                  style={{ borderRadius: 22, objectFit: "cover" }}
                  alt={c!.name}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    width: 170,
                    height: 170,
                    borderRadius: 22,
                    background: (c!.partyColor ?? "#888") + "33",
                  }}
                />
              )}
              <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 6 }}>
                <div style={{ display: "flex", fontSize: 24, fontWeight: 900, color: c!.partyColor ?? "#888", letterSpacing: 2, textTransform: "uppercase" }}>
                  {c!.party}
                </div>
                {/* Use surname-only inside the card so it fits one line at 72pt
                    without wrapping. Initial + name was wrapping K. Fujimori
                    onto two lines and compressing the % column. */}
                <div style={{ display: "flex", fontSize: 72, fontWeight: 900, color: "#0a0a0a", lineHeight: 1 }}>
                  {(c!.shortName || c!.name).replace(/^[A-Z]\.\s+/, "")}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <div style={{ display: "flex", alignItems: "baseline" }}>
                  <div style={{ display: "flex", fontSize: 140, fontWeight: 900, color: c!.partyColor ?? "#0a0a0a", fontFamily: "monospace", lineHeight: 1, letterSpacing: -4 }}>
                    {c!.percentage != null ? c!.percentage.toFixed(1) : "—"}
                  </div>
                  <div style={{ display: "flex", fontSize: 52, color: "#a8a29e", fontWeight: 800, marginLeft: 6 }}>%</div>
                </div>
                {c!.votes != null && (
                  <div style={{ display: "flex", fontSize: 26, color: "#57534e", fontFamily: "monospace", fontWeight: 700, marginTop: 4 }}>
                    {fmt(c!.votes)} votos
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Actas progress + faltan ───────────────────────────────────── */}
        {data?.actasPct != null && data.actasPct > 0 && (
          <div style={{ display: "flex", flexDirection: "column", padding: "44px 72px 0", gap: 18, width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ display: "flex", fontSize: 26, fontWeight: 900, color: "#065F46", letterSpacing: 3, textTransform: "uppercase" }}>
                Actas escrutadas · {data.actasPct.toFixed(1)}%
              </div>
              <div style={{ display: "flex", fontSize: 28, color: "#047857", fontFamily: "monospace", fontWeight: 800 }}>
                {fmt(data.actasCounted)} / {fmt(data.actasTotal)}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                width: "100%",
                height: 26,
                borderRadius: 999,
                background: "#D1FAE5",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: `${Math.min(100, data.actasPct)}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #10b981 0%, #059669 100%)",
                }}
              />
            </div>
            {/* Faltan row — single sentence so spaces render correctly. Use
                "~" instead of "≈" because Satori's font fallback can render
                the math approx glyph as a tofu box on some platforms. */}
            {actasMissing != null && actasMissing > 0 && (
              <div style={{ display: "flex", fontSize: 28, color: "#065F46", fontWeight: 600 }}>
                {estRemainingVotes != null && estRemainingVotes > 0
                  ? `Faltan ${fmt(actasMissing)} actas — ~${fmtCompact(estRemainingVotes)} votos por contar`
                  : `Faltan ${fmt(actasMissing)} actas por escrutar`}
              </div>
            )}
            {actasMissing === 0 && (
              <div style={{ display: "flex", fontSize: 28, color: "#065F46", fontWeight: 800 }}>
                Cómputo al 100% — todas las actas escrutadas
              </div>
            )}
          </div>
        )}

        {/* ── Spacer ────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, display: "flex" }} />

        {/* ── Footer rojo bandera CTA ───────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "52px 72px 64px",
            background: `linear-gradient(180deg, transparent 0%, ${ROJO_BANDERA} 40%, ${ROJO_OSCURO} 100%)`,
            width: "100%",
          }}
        >
          <div style={{ display: "flex", fontSize: 26, color: "rgba(255,255,255,0.85)", letterSpacing: 6, textTransform: "uppercase", fontWeight: 800, marginBottom: 16 }}>
            Cobertura completa con IA
          </div>
          <div style={{ display: "flex", fontSize: 86, fontWeight: 900, color: "white", letterSpacing: -2, lineHeight: 1 }}>
            condorlatam.com/pe
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 22 }}>
            <div style={{ display: "flex", fontSize: 24, color: "white", fontWeight: 800, background: "rgba(0,0,0,0.25)", padding: "8px 20px", borderRadius: 999 }}>
              @condorlatam
            </div>
            <div style={{ display: "flex", fontSize: 24, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
              Conteo · análisis · verificación
            </div>
          </div>
        </div>
      </div>
    ),
    { width: W, height: H },
  );
}
