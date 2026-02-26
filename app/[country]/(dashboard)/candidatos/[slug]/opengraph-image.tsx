import { ImageResponse } from "next/og";
import { fetchCandidateBySlug } from "@/lib/data/candidates";

export const runtime = "edge";
export const alt = "Candidato Presidencial — CONDOR Perú 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let name = "Candidato";
  let party = "Partido Político";
  let partyColor = "#8B1A1A";
  let pollAverage = 0;
  let profession = "";
  let region = "";

  try {
    const candidate = await fetchCandidateBySlug(slug);
    if (candidate) {
      name = candidate.name;
      party = candidate.party;
      partyColor = candidate.partyColor;
      pollAverage = candidate.pollAverage;
      profession = candidate.profession;
      region = candidate.region;
    }
  } catch {
    // Use defaults
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background:
            "linear-gradient(135deg, #08060a 0%, #1a0a0a 50%, #08060a 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "linear-gradient(rgba(139, 26, 26, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 26, 26, 0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Top bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(139, 26, 26, 0.08)",
            borderBottom: "1px solid rgba(139, 26, 26, 0.2)",
            fontSize: 11,
            letterSpacing: "0.2em",
            color: "rgba(148, 163, 184, 0.6)",
            fontFamily: "monospace",
          }}
        >
          CONDOR &nbsp;&nbsp;// &nbsp;&nbsp;CANDIDATO PRESIDENCIAL
          &nbsp;&nbsp;// &nbsp;&nbsp;PERU 2026
        </div>

        {/* Party color accent */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, transparent, ${partyColor}, transparent)`,
          }}
        />

        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            height: 350,
            borderRadius: "50%",
            background: `radial-gradient(ellipse, ${partyColor}22 0%, transparent 70%)`,
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          {/* Party badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              borderRadius: 20,
              background: `${partyColor}20`,
              border: `1px solid ${partyColor}40`,
              fontSize: 14,
              color: partyColor,
              fontFamily: "system-ui",
              fontWeight: 600,
            }}
          >
            {party}
          </div>

          {/* Name */}
          <span
            style={{
              fontSize: 56,
              fontWeight: 900,
              color: "#f1f5f9",
              fontFamily: "system-ui",
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            {name}
          </span>

          {/* Details */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              marginTop: 4,
              fontSize: 16,
              color: "rgba(148, 163, 184, 0.7)",
              fontFamily: "system-ui",
            }}
          >
            {profession && <span>{profession}</span>}
            {region && (
              <span>
                {profession ? "•" : ""} {region}
              </span>
            )}
          </div>

          {/* Poll average */}
          {pollAverage > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginTop: 16,
                padding: "12px 24px",
                borderRadius: 12,
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  color: "rgba(148, 163, 184, 0.6)",
                  fontFamily: "monospace",
                  letterSpacing: "0.1em",
                }}
              >
                INTENCION DE VOTO
              </span>
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 900,
                  color: partyColor,
                  fontFamily: "system-ui",
                }}
              >
                {pollAverage}%
              </span>
            </div>
          )}
        </div>

        {/* Logo */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: 32,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #8B1A1A, #C42B2B)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 900,
              color: "white",
              fontFamily: "system-ui",
            }}
          >
            C
          </div>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "rgba(148, 163, 184, 0.5)",
              fontFamily: "system-ui",
            }}
          >
            CONDOR
          </span>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, transparent, ${partyColor}, transparent)`,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
