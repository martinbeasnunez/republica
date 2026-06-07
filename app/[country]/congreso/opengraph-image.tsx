import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "¿Qué candidatos al Congreso proponen para los emprendedores? — CONDOR";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const isColombia = country === "co";
  const primary = "#8B1A1A";
  const primaryLight = "#C0392B";

  const tags = [
    "Emprendimiento",
    "Tecnología",
    "Pymes / MYPE",
    "Formalización",
    "Finanzas",
    "Empleabilidad",
  ];

  const year = "2026";
  const countryLabel = isColombia ? "COLOMBIA" : "PERÚ";

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
          background: "linear-gradient(135deg, #08060a 0%, #1a0a0a 50%, #08060a 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage: `linear-gradient(${primary}08 1px, transparent 1px), linear-gradient(90deg, ${primary}08 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Center glow */}
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 800,
            height: 500,
            borderRadius: "50%",
            display: "flex",
            background: `radial-gradient(ellipse, ${primary}1a 0%, transparent 70%)`,
          }}
        />

        {/* Watermark "?" */}
        <div
          style={{
            position: "absolute",
            top: "45%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            fontSize: 520,
            fontWeight: 900,
            color: primary,
            opacity: 0.05,
            fontFamily: "system-ui",
          }}
        >
          ?
        </div>

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
          {`CONDOR  //  CANDIDATOS AL CONGRESO  //  ${countryLabel} ${year}`}
        </div>

        {/* CONDOR logo + flag */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
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
            <svg width="40" height="27" viewBox="0 0 3 2" style={{ display: "flex" }}>
              <rect fill="#D91023" width="1" height="2" />
              <rect fill="#FFFFFF" x="1" width="1" height="2" />
              <rect fill="#D91023" x="2" width="1" height="2" />
            </svg>
          </div>
        </div>

        {/* Main headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: "rgba(148, 163, 184, 0.7)",
              letterSpacing: "0.15em",
              fontFamily: "system-ui",
              textTransform: "uppercase",
            }}
          >
            ¿Qué candidatos al Congreso proponen
          </span>
          <span
            style={{
              fontSize: 72,
              fontWeight: 900,
              background: `linear-gradient(135deg, ${primary} 0%, ${primaryLight} 40%, #E84040 80%, #FF6B35 100%)`,
              backgroundClip: "text",
              color: "transparent",
              fontFamily: "system-ui",
              lineHeight: 1.1,
              textAlign: "center",
            }}
          >
            para emprendedores?
          </span>
        </div>

        {/* Subtitle */}
        <span
          style={{
            fontSize: 20,
            color: "#e2e8f0",
            marginBottom: 28,
            fontFamily: "system-ui",
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          Candidatos al Senado y Diputados con propuestas verificadas
        </span>

        {/* Tag pills */}
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: 32,
            maxWidth: 900,
          }}
        >
          {tags.map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 18px",
                borderRadius: 20,
                background: `${primary}20`,
                border: `1px solid ${primary}40`,
                fontSize: 14,
                color: "rgba(226, 232, 240, 0.85)",
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
              {tag}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
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
          condorlatam.com/pe/congreso
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
            background: `linear-gradient(90deg, transparent, ${primary}, ${primaryLight}, #E84040, ${primary}, transparent)`,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
