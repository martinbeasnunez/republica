import { ImageResponse } from "next/og";
import { getCountryConfig } from "@/lib/config/countries";

export const runtime = "edge";
export const alt = "CONDOR — Inteligencia Electoral con IA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const config = getCountryConfig(country);

  const primary = config?.theme.primary ?? "#8B1A1A";
  const primaryLight = config?.theme.primaryLight ?? "#A52525";
  const countryName = config?.name ?? "Latinoamerica";
  const year = config?.electionDate.slice(0, 4) ?? "2026";
  const electionType = config?.electionType ?? "Elecciones";

  const isColombia = country === "co";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#08060a",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background gradient */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            background: `radial-gradient(ellipse 80% 60% at 50% 45%, ${primary}22 0%, transparent 70%)`,
          }}
        />

        {/* Grid pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            backgroundImage: `linear-gradient(${primary}08 1px, transparent 1px), linear-gradient(90deg, ${primary}08 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            display: "flex",
            background: `linear-gradient(90deg, transparent 5%, ${primary}, ${primaryLight}, ${primary}, transparent 95%)`,
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            padding: "60px 80px 40px",
          }}
        >
          {/* Country flag — inline SVG */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 28,
              borderRadius: 8,
              overflow: "hidden",
              border: "2px solid rgba(255,255,255,0.18)",
              boxShadow: `0 4px 24px ${primary}30`,
            }}
          >
            {isColombia ? (
              <svg
                width="96"
                height="64"
                viewBox="0 0 6 4"
                style={{ display: "flex" }}
              >
                <rect fill="#FCD116" width="6" height="2" />
                <rect fill="#003893" y="2" width="6" height="1" />
                <rect fill="#CE1126" y="3" width="6" height="1" />
              </svg>
            ) : (
              <svg
                width="96"
                height="64"
                viewBox="0 0 3 2"
                style={{ display: "flex" }}
              >
                <rect fill="#D91023" width="1" height="2" />
                <rect fill="#FFFFFF" x="1" width="1" height="2" />
                <rect fill="#D91023" x="2" width="1" height="2" />
              </svg>
            )}
          </div>

          {/* Election type label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
              padding: "6px 20px",
              borderRadius: 20,
              background: `${primary}18`,
              border: `1px solid ${primary}40`,
            }}
          >
            <span
              style={{
                fontSize: 14,
                letterSpacing: "0.2em",
                color: primaryLight,
                fontFamily: "system-ui",
                fontWeight: 700,
              }}
            >
              {`${electionType.toUpperCase()} ${year}`}
            </span>
          </div>

          {/* Country name — hero */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0,
            }}
          >
            <span
              style={{
                fontSize: 72,
                fontWeight: 900,
                color: "#f1f5f9",
                fontFamily: "system-ui",
                textAlign: "center",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {countryName}
            </span>
          </div>

          {/* Tagline */}
          <span
            style={{
              fontSize: 22,
              color: "rgba(148, 163, 184, 0.8)",
              marginTop: 20,
              fontFamily: "system-ui",
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            Candidatos, encuestas y noticias verificadas con IA
          </span>

          {/* Feature pills */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 32,
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontFamily: "monospace",
                  color: "#10b981",
                  fontWeight: 600,
                }}
              >
                FACT-CHECK
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontFamily: "monospace",
                  color: "#3b82f6",
                  fontWeight: 600,
                }}
              >
                ENCUESTAS
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontFamily: "monospace",
                  color: "#f59e0b",
                  fontWeight: 600,
                }}
              >
                CANDIDATOS
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontFamily: "monospace",
                  color: "#a78bfa",
                  fontWeight: 600,
                }}
              >
                PLANES
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 32px",
            height: 56,
            borderTop: `1px solid ${primary}20`,
            background: `${primary}08`,
          }}
        >
          {/* Logo */}
          <div
            style={{
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
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  color: "rgba(241, 245, 249, 0.85)",
                  fontFamily: "system-ui",
                }}
              >
                CONDOR
              </span>
              <span
                style={{
                  fontSize: 9,
                  letterSpacing: "0.2em",
                  color: "rgba(148, 163, 184, 0.5)",
                  fontFamily: "monospace",
                }}
              >
                INTELIGENCIA ELECTORAL
              </span>
            </div>
          </div>

          {/* Status + URL */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#10b981",
                  display: "flex",
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "monospace",
                  color: "#10b981",
                }}
              >
                AI ONLINE
              </span>
            </div>
            <span
              style={{
                fontSize: 13,
                fontFamily: "monospace",
                color: "rgba(148, 163, 184, 0.5)",
                letterSpacing: "0.05em",
              }}
            >
              {`condorlatam.com/${country}`}
            </span>
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            display: "flex",
            background: `linear-gradient(90deg, transparent 5%, ${primary}, ${primaryLight}, ${primary}, transparent 95%)`,
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
