import { ImageResponse } from "next/og";
import { getCountryConfig } from "@/lib/config/countries";

export const runtime = "edge";
export const alt = "CONDOR — Simulador Electoral con IA";
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
  const countryName = config?.name ?? "Perú";
  const year = config?.electionDate.slice(0, 4) ?? "2026";
  const isColombia = country === "co";
  const title = isColombia ? "Analisis de Escenarios" : "Simulador Electoral";

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
        {/* Grid */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            backgroundImage: `linear-gradient(${primary}0a 1px, transparent 1px), linear-gradient(90deg, ${primary}0a 1px, transparent 1px)`,
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
            background: `${primary}10`,
            borderBottom: `1px solid ${primary}30`,
            fontSize: 11,
            letterSpacing: "0.2em",
            color: "rgba(148, 163, 184, 0.6)",
            fontFamily: "monospace",
          }}
        >
          {`CONDOR  //  SIMULADOR  //  ${countryName.toUpperCase()} ${year}  //  MONTE CARLO AI`}
        </div>

        {/* Center glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 400,
            borderRadius: "50%",
            display: "flex",
            background: `radial-gradient(ellipse, ${primary}20 0%, transparent 70%)`,
          }}
        />

        {/* Title */}
        <span
          style={{
            fontSize: 52,
            fontWeight: 800,
            background: `linear-gradient(135deg, ${primary} 0%, ${isColombia ? "#3b7de8" : "#E84040"} 100%)`,
            backgroundClip: "text",
            color: "transparent",
            fontFamily: "system-ui",
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          {title}
        </span>

        <span
          style={{
            fontSize: 36,
            fontWeight: 800,
            color: "#f1f5f9",
            fontFamily: "system-ui",
            textAlign: "center",
            lineHeight: 1.2,
            marginTop: 8,
          }}
        >
          {`${countryName} ${year}`}
        </span>

        {/* Subtitle */}
        <span
          style={{
            fontSize: 18,
            color: "rgba(148, 163, 184, 0.8)",
            marginTop: 16,
            fontFamily: "system-ui",
            textAlign: "center",
          }}
        >
          10,000 simulaciones Monte Carlo · Basado en encuestas reales
        </span>

        {/* Probability bars */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 32,
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontFamily: "monospace",
              color: "rgba(148,163,184,0.5)",
              letterSpacing: "0.1em",
            }}
          >
            PROBABILIDADES
          </span>
          <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 40 }}>
            {[35, 28, 15, 12, 6, 4].map((h, i) => (
              <div
                key={i}
                style={{
                  width: 40,
                  height: h,
                  borderRadius: 3,
                  display: "flex",
                  background:
                    i === 0
                      ? `linear-gradient(180deg, ${primary}, ${primary}80)`
                      : `linear-gradient(180deg, rgba(148,163,184,${0.3 - i * 0.04}), rgba(148,163,184,0.05))`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            display: "flex",
            background: `linear-gradient(90deg, transparent, ${primary}, transparent)`,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
