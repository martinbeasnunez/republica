import { ImageResponse } from "next/og";
import { getCountryConfig } from "@/lib/config/countries";

export const runtime = "edge";
export const alt =
  "Quiz Electoral — Descubre con qué candidato coincides más";
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
  const countryName = config?.name ?? "Latinoamérica";
  const year = config?.electionDate.slice(0, 4) ?? "2026";
  const isColombia = country === "co";

  // Topic pills to show on the image
  const topics = [
    "Seguridad",
    "Economía",
    "Derechos",
    "Educación",
    "Salud",
    "Medio Ambiente",
  ];

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
          background: `linear-gradient(135deg, #08060a 0%, ${isColombia ? "#0a0a1a" : "#1a0a0a"} 50%, #08060a 100%)`,
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
            backgroundImage: `linear-gradient(${primary}08 1px, transparent 1px), linear-gradient(90deg, ${primary}08 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Large question mark watermark */}
        <div
          style={{
            position: "absolute",
            top: "45%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 500,
            fontWeight: 900,
            color: primary,
            opacity: 0.07,
            fontFamily: "system-ui",
          }}
        >
          ?
        </div>

        {/* Center glow */}
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700,
            height: 500,
            borderRadius: "50%",
            display: "flex",
            background: `radial-gradient(ellipse, ${primary}18 0%, transparent 70%)`,
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
            background: `${primary}10`,
            borderBottom: `1px solid ${primary}30`,
            fontSize: 11,
            letterSpacing: "0.2em",
            color: "rgba(148, 163, 184, 0.5)",
            fontFamily: "monospace",
          }}
        >
          {`CONDOR  //  QUIZ ELECTORAL  //  ${countryName.toUpperCase()} ${year}  //  10 PREGUNTAS`}
        </div>

        {/* CONDOR logo + badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${primary}, ${primaryLight})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 900,
              color: "white",
              fontFamily: "system-ui",
            }}
          >
            C
          </div>
          <span
            style={{
              fontSize: 24,
              fontWeight: 900,
              letterSpacing: "0.1em",
              color: "white",
              fontFamily: "system-ui",
            }}
          >
            CONDOR
          </span>
          <div
            style={{
              display: "flex",
              borderRadius: 6,
              overflow: "hidden",
              border: "2px solid rgba(255,255,255,0.15)",
            }}
          >
            {isColombia ? (
              <svg
                width="40"
                height="27"
                viewBox="0 0 6 4"
                style={{ display: "flex" }}
              >
                <rect fill="#FCD116" width="6" height="2" />
                <rect fill="#003893" y="2" width="6" height="1" />
                <rect fill="#CE1126" y="3" width="6" height="1" />
              </svg>
            ) : (
              <svg
                width="40"
                height="27"
                viewBox="0 0 3 2"
                style={{ display: "flex" }}
              >
                <rect fill="#D91023" width="1" height="2" />
                <rect fill="#FFFFFF" x="1" width="1" height="2" />
                <rect fill="#D91023" x="2" width="1" height="2" />
              </svg>
            )}
          </div>
        </div>

        {/* Main headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span
            style={{
              fontSize: 56,
              fontWeight: 900,
              background: `linear-gradient(135deg, ${primary} 0%, ${primaryLight} 50%, ${isColombia ? "#FCD116" : "#E84040"} 100%)`,
              backgroundClip: "text",
              color: "transparent",
              fontFamily: "system-ui",
              textAlign: "center",
              lineHeight: 1.15,
            }}
          >
            {`¿No sabes por quién`}
          </span>
          <span
            style={{
              fontSize: 56,
              fontWeight: 900,
              background: `linear-gradient(135deg, ${primaryLight} 0%, ${isColombia ? "#FCD116" : "#E84040"} 50%, white 100%)`,
              backgroundClip: "text",
              color: "transparent",
              fontFamily: "system-ui",
              textAlign: "center",
              lineHeight: 1.15,
            }}
          >
            {`votar en ${year}?`}
          </span>
        </div>

        {/* Subtitle */}
        <span
          style={{
            fontSize: 22,
            color: "#e2e8f0",
            marginTop: 20,
            fontFamily: "system-ui",
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          Resuelve este test y descubre tu candidato ideal
        </span>

        {/* Topic pills */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 28,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {topics.map((topic) => (
            <div
              key={topic}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 20,
                background: `${primary}20`,
                border: `1px solid ${primary}40`,
                fontSize: 14,
                color: "rgba(226, 232, 240, 0.8)",
                fontFamily: "system-ui",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: primaryLight,
                  display: "flex",
                }}
              />
              {topic}
            </div>
          ))}
        </div>

        {/* CTA button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 32,
            padding: "14px 36px",
            borderRadius: 14,
            background: `linear-gradient(135deg, ${primary}, ${primaryLight})`,
            fontSize: 18,
            fontWeight: 700,
            color: "white",
            fontFamily: "system-ui",
            boxShadow: `0 4px 24px ${primary}60`,
          }}
        >
          10 preguntas → ranking personalizado
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12h14m-7-7l7 7-7 7"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            display: "flex",
            background: `linear-gradient(90deg, transparent, ${primary}, ${primaryLight}, ${isColombia ? "#FCD116" : "#E84040"}, ${primary}, transparent)`,
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
