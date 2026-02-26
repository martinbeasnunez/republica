import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CONDOR — Inteligencia Electoral con IA para Latinoamérica";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
        {/* Grid overlay effect */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "linear-gradient(rgba(139, 26, 26, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 26, 26, 0.06) 1px, transparent 1px)",
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
            background: "rgba(139, 26, 26, 0.08)",
            borderBottom: "1px solid rgba(139, 26, 26, 0.2)",
            fontSize: 11,
            letterSpacing: "0.2em",
            color: "rgba(148, 163, 184, 0.6)",
            fontFamily: "monospace",
          }}
        >
          CONDOR &nbsp;&nbsp;// &nbsp;&nbsp;SISTEMA DE INTELIGENCIA ELECTORAL &nbsp;&nbsp;// &nbsp;&nbsp;LATAM &nbsp;&nbsp;// &nbsp;&nbsp;AI-POWERED
        </div>

        {/* Condor silhouette / Wing shape */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            height: 500,
            opacity: 0.04,
            display: "flex",
            fontSize: 400,
            color: "#8B1A1A",
          }}
        >
          🦅
        </div>

        {/* Red glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(139, 26, 26, 0.15) 0%, transparent 70%)",
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
              background: "linear-gradient(135deg, #8B1A1A, #C42B2B)",
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
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 48,
              fontWeight: 800,
              background: "linear-gradient(135deg, #8B1A1A 0%, #C42B2B 50%, #E84040 100%)",
              backgroundClip: "text",
              color: "transparent",
              fontFamily: "system-ui",
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            La primera elección
          </span>
          <span
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: "#f1f5f9",
              fontFamily: "system-ui",
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            con inteligencia artificial.
          </span>
        </div>

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

        {/* AI Status indicators */}
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
              }}
            />
            AI ONLINE
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
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
              gap: 6,
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
              gap: 6,
              fontSize: 13,
              fontFamily: "monospace",
              color: "rgba(148, 163, 184, 0.6)",
            }}
          >
            PLAN ANALYSIS
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
            background: "linear-gradient(90deg, transparent, #8B1A1A, #C42B2B, #8B1A1A, transparent)",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
