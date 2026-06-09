import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

// =============================================================================
// CONDOR — Story image for the live runoff count
// =============================================================================
// 1080×1920 vertical PNG, suitable for Instagram/WhatsApp stories. Fetches the
// current `/api/runoff-conteo` snapshot at request time so each share is a
// fresh capture of the moment.
//
// Surface area on the image:
//   - Top red ribbon: EN VIVO · Balotaje Perú 2026 · time stamp
//   - Hero vote gap number ("23,595 votos los separan a…")
//   - Tightness pill (Empate técnico / Diferencia ajustada / …)
//   - Live momentum pill (SE ACHICA / SE AMPLÍA / SIN CAMBIOS / CAMBIO DE LÍDER)
//   - Two candidate cards stacked, with portraits, party color, %, votes
//   - Actas progress bar + "Faltan X actas, ≈ Y votos por contar (estimado)"
//   - Bottom CTA: condorlatam.com/pe
// =============================================================================

export const runtime = "edge";
export const contentType = "image/png";

const W = 1080;
const H = 1920;

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

  // Lima hour for the timestamp
  const limaTime = new Date().toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
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
    momentumSentence = `${insightLeader} sumó +${fmt(insightDeltaVotes)} votos en ${insightSince} min`;
  } else if (insightDir === "narrow" && insightDeltaVotes !== 0) {
    momentumPill = { label: "Se achica", bg: "#D1FAE5", fg: "#065F46" };
    momentumSentence = `${insightRunner} recortó ${fmt(Math.abs(insightDeltaVotes))} votos en ${insightSince} min`;
  } else if (insightDir === "flat") {
    momentumPill = { label: "Sin cambios", bg: "#E7E5E4", fg: "#44403C" };
    momentumSentence = "La distancia no se mueve";
  }

  // Build the hero "votos separan a X de Y" as separate flex children
  // because Satori does NOT handle inline <strong> inside <span> correctly.
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
          background: "#FAFAF9",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* ── Top ribbon ─────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "44px 56px",
            background: "linear-gradient(135deg, #1c1917 0%, #7f1d1d 60%, #1c1917 100%)",
            color: "white",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#dc2626",
                padding: "10px 22px",
                borderRadius: 999,
              }}
            >
              <div style={{ display: "flex", width: 14, height: 14, borderRadius: 999, background: "white" }} />
              <div style={{ display: "flex", fontSize: 24, fontWeight: 900, letterSpacing: 4, color: "white" }}>EN VIVO</div>
            </div>
            <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>Balotaje Perú 2026</div>
          </div>
          <div style={{ display: "flex", fontSize: 22, fontFamily: "monospace", color: "rgba(255,255,255,0.7)" }}>
            {limaTime} Lima
          </div>
        </div>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            paddingTop: 56,
            paddingLeft: 64,
            paddingRight: 64,
            paddingBottom: 0,
          }}
        >
          {/* "DIFERENCIA AHORA" eyebrow */}
          <div style={{ display: "flex", fontSize: 28, color: "#78716c", fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", marginBottom: 18 }}>
            Diferencia ahora
          </div>

          {/* Big vote count + "votos" */}
          {hasNumbers && voteGap != null && (
            <div style={{ display: "flex", alignItems: "baseline", marginBottom: 14 }}>
              <div style={{ display: "flex", fontSize: 200, fontWeight: 900, color: "#1c1917", lineHeight: 0.9, fontFamily: "monospace", letterSpacing: -6 }}>
                {fmt(voteGap)}
              </div>
              <div style={{ display: "flex", fontSize: 42, fontWeight: 700, color: "#57534e", marginLeft: 24 }}>votos</div>
            </div>
          )}

          {/* "los separan a X de Y" — single line broken into 3 spans */}
          {hasNumbers && (
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", marginBottom: 28, gap: 12 }}>
              <div style={{ display: "flex", fontSize: 36, color: "#44403c" }}>los separan a</div>
              <div style={{ display: "flex", fontSize: 40, color: "#1c1917", fontWeight: 800 }}>{finalist1}</div>
              <div style={{ display: "flex", fontSize: 36, color: "#44403c" }}>de</div>
              <div style={{ display: "flex", fontSize: 40, color: "#1c1917", fontWeight: 800 }}>{finalist2}</div>
            </div>
          )}

          {/* Tightness pill row */}
          {hasNumbers && ppGap != null && (
            <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
              <div
                style={{
                  display: "flex",
                  fontSize: 26,
                  fontWeight: 900,
                  background: tight.bg,
                  color: tight.fg,
                  padding: "14px 28px",
                  borderRadius: 999,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                {tight.label}
              </div>
              <div style={{ display: "flex", fontSize: 28, color: "#78716c", fontFamily: "monospace", marginLeft: 18 }}>
                {ppGap < 0.1 ? "<0.1" : ppGap.toFixed(1)}% de diferencia
              </div>
            </div>
          )}

          {/* Momentum row */}
          {hasNumbers && momentumPill && (
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
              <div
                style={{
                  display: "flex",
                  fontSize: 22,
                  fontWeight: 900,
                  background: momentumPill.bg,
                  color: momentumPill.fg,
                  padding: "12px 24px",
                  borderRadius: 999,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                {momentumPill.label}
              </div>
              <div style={{ display: "flex", fontSize: 24, color: "#44403c", fontWeight: 500, marginLeft: 16 }}>
                {momentumSentence}
              </div>
            </div>
          )}

          {!hasNumbers && (
            <div style={{ display: "flex", fontSize: 60, fontWeight: 900, color: "#1c1917", lineHeight: 1.1 }}>
              Esperando datos de ONPE
            </div>
          )}
        </div>

        {/* ── Candidate cards ───────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", padding: "48px 64px 0", gap: 20, width: "100%" }}>
          {[leader, runner].filter(Boolean).map((c) => (
            <div
              key={c!.slug ?? c!.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 28,
                padding: "26px 32px",
                background: "white",
                borderRadius: 24,
                border: `4px solid ${c!.partyColor ?? "#888"}`,
              }}
            >
              {c!.slug && FINALIST_PHOTO[c!.slug] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={FINALIST_PHOTO[c!.slug]}
                  width={140}
                  height={140}
                  style={{ borderRadius: 18, objectFit: "cover" }}
                  alt={c!.name}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    width: 140,
                    height: 140,
                    borderRadius: 18,
                    background: (c!.partyColor ?? "#888") + "33",
                  }}
                />
              )}
              <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 6 }}>
                <div style={{ display: "flex", fontSize: 20, fontWeight: 900, color: c!.partyColor ?? "#888", letterSpacing: 2, textTransform: "uppercase" }}>
                  {c!.party}
                </div>
                <div style={{ display: "flex", fontSize: 52, fontWeight: 900, color: "#1c1917", lineHeight: 1 }}>
                  {c!.shortName || c!.name}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <div style={{ display: "flex", alignItems: "baseline" }}>
                  <div style={{ display: "flex", fontSize: 108, fontWeight: 900, color: c!.partyColor ?? "#1c1917", fontFamily: "monospace", lineHeight: 1, letterSpacing: -2 }}>
                    {c!.percentage != null ? c!.percentage.toFixed(1) : "—"}
                  </div>
                  <div style={{ display: "flex", fontSize: 40, color: "#a8a29e", fontWeight: 800, marginLeft: 4 }}>%</div>
                </div>
                {c!.votes != null && (
                  <div style={{ display: "flex", fontSize: 22, color: "#78716c", fontFamily: "monospace", marginTop: 6 }}>
                    {fmt(c!.votes)} votos
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Actas progress + faltan ───────────────────────────────────── */}
        {data?.actasPct != null && data.actasPct > 0 && (
          <div style={{ display: "flex", flexDirection: "column", padding: "40px 64px 0", gap: 16, width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ display: "flex", fontSize: 22, fontWeight: 900, color: "#065F46", letterSpacing: 2, textTransform: "uppercase" }}>
                Actas escrutadas
              </div>
              <div style={{ display: "flex", fontSize: 22, color: "#047857", fontFamily: "monospace" }}>
                {fmt(data.actasCounted)} / {fmt(data.actasTotal)}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                width: "100%",
                height: 20,
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
            {/* Faltan row — single sentence so spaces render correctly */}
            {actasMissing != null && actasMissing > 0 && (
              <div style={{ display: "flex", fontSize: 24, color: "#065F46" }}>
                {estRemainingVotes != null && estRemainingVotes > 0
                  ? `Faltan ${fmt(actasMissing)} actas — ≈ ${fmt(estRemainingVotes)} votos por contar (estimado)`
                  : `Faltan ${fmt(actasMissing)} actas por escrutar`}
              </div>
            )}
            {actasMissing === 0 && (
              <div style={{ display: "flex", fontSize: 24, color: "#065F46", fontWeight: 800 }}>
                Cómputo al 100% — todas las actas escrutadas
              </div>
            )}
          </div>
        )}

        {/* ── Spacer ────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, display: "flex" }} />

        {/* ── Footer CTA ────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "44px 64px 64px",
            background: "linear-gradient(180deg, transparent 0%, #1c1917 60%)",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", fontSize: 28, color: "#a8a29e", letterSpacing: 5, textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>
            Cobertura completa
          </div>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 900, color: "white", letterSpacing: -1 }}>
            condorlatam.com/pe
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "#a8a29e", marginTop: 14 }}>
            Conteo en vivo · análisis · verificación con IA
          </div>
        </div>
      </div>
    ),
    { width: W, height: H },
  );
}
