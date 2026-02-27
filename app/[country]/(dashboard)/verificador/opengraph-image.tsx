import { ImageResponse } from "next/og";
import { getCountryConfig } from "@/lib/config/countries";

export const runtime = "edge";
export const alt = "CONDOR — Verificador de Hechos Electoral con IA";
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
          {`CONDOR  //  VERIFICADOR  //  ${countryName.toUpperCase()} ${year}  //  FACT-CHECK CON IA`}
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

        {/* Shield icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: 20,
            background: `linear-gradient(135deg, ${primary}30, ${primary}10)`,
            border: `2px solid ${primary}40`,
            marginBottom: 24,
            fontSize: 40,
          }}
        >
          🛡
        </div>

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
          Verificador de Hechos
        </span>

        <span
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "#f1f5f9",
            fontFamily: "system-ui",
            textAlign: "center",
            lineHeight: 1.2,
            marginTop: 8,
          }}
        >
          {`Elecciones ${countryName} ${year}`}
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
          Fact-check automatizado con IA · Verdadero, Falso o Engañoso
        </span>

        {/* Verdict pills */}
        <div style={{ display: "flex", gap: 16, marginTop: 28 }}>
          {[
            { label: "VERDADERO", color: "#10b981" },
            { label: "FALSO", color: "#ef4444" },
            { label: "ENGAÑOSO", color: "#f59e0b" },
          ].map((v, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 6,
                border: `1px solid ${v.color}30`,
                background: `${v.color}10`,
                fontSize: 12,
                fontFamily: "monospace",
                letterSpacing: "0.1em",
                color: v.color,
              }}
            >
              {v.label}
            </div>
          ))}
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
