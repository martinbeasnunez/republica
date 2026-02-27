import { ImageResponse } from "next/og";
import { getCountryConfig } from "@/lib/config/countries";

export const runtime = "edge";
export const alt = "CONDOR — Encuestas Electorales en Tiempo Real";
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
          {`CONDOR  //  ENCUESTAS  //  ${countryName.toUpperCase()} ${year}  //  ACTUALIZADO EN TIEMPO REAL`}
        </div>

        {/* Chart icon - bar chart representation */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 12,
            marginBottom: 32,
            height: 120,
          }}
        >
          {[60, 90, 45, 75, 35].map((h, i) => (
            <div
              key={i}
              style={{
                width: 24,
                height: h,
                borderRadius: 4,
                display: "flex",
                background:
                  i === 1
                    ? `linear-gradient(180deg, ${primary}, ${primary}80)`
                    : `linear-gradient(180deg, rgba(148,163,184,0.3), rgba(148,163,184,0.1))`,
              }}
            />
          ))}
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
          {`Encuestas ${countryName} ${year}`}
        </span>

        {/* Subtitle */}
        <span
          style={{
            fontSize: 22,
            color: "#f1f5f9",
            marginTop: 12,
            fontFamily: "system-ui",
            textAlign: "center",
            fontWeight: 600,
          }}
        >
          Promedio ponderado de todas las encuestadoras
        </span>

        <span
          style={{
            fontSize: 16,
            color: "rgba(148, 163, 184, 0.7)",
            marginTop: 8,
            fontFamily: "system-ui",
            textAlign: "center",
          }}
        >
          {`Ipsos, Datum, CPI, IEP y mas · Actualizado cada 4 horas · condorlatam.com/${country}/encuestas`}
        </span>

        {/* Features row */}
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 32,
          }}
        >
          {["PROMEDIO PONDERADO", "MARGEN DE ERROR", "TREND HISTORICO", "MULTI-FUENTE"].map(
            (label, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  fontFamily: "monospace",
                  letterSpacing: "0.1em",
                  color: i === 0 ? "#10b981" : "rgba(148,163,184,0.5)",
                }}
              >
                {i === 0 && (
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#10b981",
                      display: "flex",
                    }}
                  />
                )}
                {label}
              </div>
            )
          )}
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
