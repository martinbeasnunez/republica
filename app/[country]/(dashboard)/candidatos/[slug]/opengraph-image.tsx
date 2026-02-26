import { ImageResponse } from "next/og";
import { fetchCandidateBySlug } from "@/lib/data/candidates";
import { getCountryConfig } from "@/lib/config/countries";

export const runtime = "edge";
export const alt = "Candidato Presidencial — CONDOR";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ country: string; slug: string }>;
}) {
  const { country, slug } = await params;
  const config = getCountryConfig(country);
  const primary = config?.theme.primary ?? "#8B1A1A";
  const primaryLight = config?.theme.primaryLight ?? "#A52525";
  const countryName = config?.name ?? "Peru";
  const year = config?.electionDate.slice(0, 4) ?? "2026";

  let name = "Candidato";
  let party = "Partido Politico";
  let partyColor = primary;
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

  const detailText = [profession, region].filter(Boolean).join("  |  ");

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
          background: "#08060a",
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
            display: "flex",
            backgroundImage: `linear-gradient(${partyColor}06 1px, transparent 1px), linear-gradient(90deg, ${partyColor}06 1px, transparent 1px)`,
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
            background: `${partyColor}10`,
            borderBottom: `1px solid ${partyColor}25`,
            fontSize: 11,
            letterSpacing: "0.2em",
            color: "rgba(148, 163, 184, 0.6)",
            fontFamily: "monospace",
          }}
        >
          {`CONDOR  //  CANDIDATO PRESIDENCIAL  //  ${countryName.toUpperCase()} ${year}`}
        </div>

        {/* Party color accent */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 0,
            right: 0,
            height: 4,
            display: "flex",
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
            display: "flex",
            background: `radial-gradient(ellipse, ${partyColor}20 0%, transparent 70%)`,
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
          {detailText && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: 4,
                fontSize: 16,
                color: "rgba(148, 163, 184, 0.7)",
                fontFamily: "system-ui",
              }}
            >
              {detailText}
            </div>
          )}

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
                {`${pollAverage}%`}
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
              background: `linear-gradient(135deg, ${primary}, ${primaryLight})`,
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
            display: "flex",
            background: `linear-gradient(90deg, transparent, ${partyColor}, transparent)`,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
