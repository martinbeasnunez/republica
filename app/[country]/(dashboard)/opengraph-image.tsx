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
  const countryNameEn = config?.nameEn ?? "Latin America";
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
        {/* Grid overlay effect */}
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

        {/* Top classification bar */}
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
          {`CONDOR  //  SISTEMA DE INTELIGENCIA ELECTORAL  //  ${countryNameEn.toUpperCase()} ${year}  //  AI-POWERED`}
        </div>

        {/* C watermark */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 400,
            fontWeight: 900,
            color: primary,
            opacity: 0.06,
            fontFamily: "system-ui",
          }}
        >
          C
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

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: `linear-gradient(135deg, ${primary}, ${primaryLight})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
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
                fontSize: 36,
                fontWeight: 900,
                letterSpacing: "0.1em",
                color: "white",
                fontFamily: "system-ui",
              }}
            >
              CONDOR
            </span>
            <span
              style={{
                fontSize: 12,
                letterSpacing: "0.3em",
                color: "rgba(148, 163, 184, 0.7)",
                fontFamily: "monospace",
              }}
            >
              ELECTORAL AI
            </span>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span
            style={{
              fontSize: 48,
              fontWeight: 800,
              background: `linear-gradient(135deg, ${primary} 0%, ${primaryLight} 50%, ${isColombia ? "#3b7de8" : "#E84040"} 100%)`,
              backgroundClip: "text",
              color: "transparent",
              fontFamily: "system-ui",
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            La primera eleccion
          </span>

          {/* Flag */}
          <div
            style={{
              display: "flex",
              borderRadius: 6,
              overflow: "hidden",
              border: "2px solid rgba(255,255,255,0.2)",
              boxShadow: `0 2px 12px ${primary}40`,
            }}
          >
            {isColombia ? (
              <svg width="60" height="40" viewBox="0 0 6 4" style={{ display: "flex" }}>
                <rect fill="#FCD116" width="6" height="2" />
                <rect fill="#003893" y="2" width="6" height="1" />
                <rect fill="#CE1126" y="3" width="6" height="1" />
              </svg>
            ) : (
              <svg width="60" height="40" viewBox="0 0 3 2" style={{ display: "flex" }}>
                <rect fill="#D91023" width="1" height="2" />
                <rect fill="#FFFFFF" x="1" width="1" height="2" />
                <rect fill="#D91023" x="2" width="1" height="2" />
              </svg>
            )}
          </div>
        </div>

        <span
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: "#f1f5f9",
            fontFamily: "system-ui",
            textAlign: "center",
            lineHeight: 1.2,
            marginTop: 4,
          }}
        >
          con inteligencia artificial.
        </span>

        {/* Subtitle */}
        <span
          style={{
            fontSize: 18,
            color: "rgba(148, 163, 184, 0.8)",
            marginTop: 20,
            fontFamily: "system-ui",
            textAlign: "center",
          }}
        >
          Analiza candidatos, verifica hechos y monitorea noticias con IA
        </span>

        {/* Status row */}
        <div
          style={{
            display: "flex",
            gap: 32,
            marginTop: 36,
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              fontFamily: "monospace",
              color: "#10b981",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#10b981",
                display: "flex",
              }}
            />
            AI ONLINE
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 13,
              fontFamily: "monospace",
              color: "rgba(148, 163, 184, 0.6)",
            }}
          >
            FACT-CHECK
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 13,
              fontFamily: "monospace",
              color: "rgba(148, 163, 184, 0.6)",
            }}
          >
            NEWS INTEL
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 13,
              fontFamily: "monospace",
              color: "rgba(148, 163, 184, 0.6)",
            }}
          >
            {`condorlatam.com/${country}`}
          </div>
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
            background: `linear-gradient(90deg, transparent, ${primary}, ${primaryLight}, ${primary}, transparent)`,
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
