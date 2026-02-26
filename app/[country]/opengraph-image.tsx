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

  // Country-specific theming
  const primary = config?.theme.primary ?? "#8B1A1A";
  const primaryLight = config?.theme.primaryLight ?? "#A52525";
  const countryName = config?.name ?? "Latinoamérica";
  const countryNameEn = config?.nameEn ?? "Latin America";
  const year = config?.electionDate.slice(0, 4) ?? "2026";
  const flag = country === "co" ? "🇨🇴" : country === "pe" ? "🇵🇪" : "🌎";
  const electionType = config?.electionType ?? "Elecciones";
  const electorateSize = config?.electorateSize ?? "";

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
          background: "linear-gradient(135deg, #08060a 0%, #0d0d14 50%, #08060a 100%)",
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
            backgroundImage: `linear-gradient(${primary}10 1px, transparent 1px), linear-gradient(90deg, ${primary}10 1px, transparent 1px)`,
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
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${primary}12`,
            borderBottom: `1px solid ${primary}30`,
            fontSize: 12,
            letterSpacing: "0.2em",
            color: "rgba(148, 163, 184, 0.6)",
            fontFamily: "monospace",
          }}
        >
          {`CONDOR    //    SISTEMA DE INTELIGENCIA ELECTORAL    //    ${countryNameEn.toUpperCase()} ${year}    //    AI-POWERED`}
        </div>

        {/* Country color accent line */}
        <div
          style={{
            position: "absolute",
            top: 44,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, transparent, ${primary}, ${primaryLight}, ${primary}, transparent)`,
          }}
        />

        {/* Center glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700,
            height: 450,
            borderRadius: "50%",
            background: `radial-gradient(ellipse, ${primary}18 0%, transparent 70%)`,
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 20,
            padding: "6px 18px",
            borderRadius: 20,
            background: `${primary}15`,
            border: `1px solid ${primary}35`,
            fontSize: 13,
            letterSpacing: "0.15em",
            color: primaryLight,
            fontFamily: "monospace",
          }}
        >
          ✦ INTELIGENCIA ARTIFICIAL ELECTORAL
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span
              style={{
                fontSize: 54,
                fontWeight: 800,
                color: primaryLight,
                fontFamily: "system-ui",
                textAlign: "center",
                lineHeight: 1.2,
              }}
            >
              La primera elección
            </span>
            <span style={{ fontSize: 50 }}>{flag}</span>
          </div>
          <span
            style={{
              fontSize: 54,
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
            color: "rgba(148, 163, 184, 0.75)",
            marginTop: 24,
            fontFamily: "system-ui",
            textAlign: "center",
            maxWidth: 800,
          }}
        >
          {`CONDOR analiza candidatos, verifica hechos y monitorea noticias en tiempo real con IA`}
        </span>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 36,
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
            CONDOR AI ONLINE
          </div>
          <div
            style={{
              fontSize: 13,
              fontFamily: "monospace",
              color: "rgba(148, 163, 184, 0.5)",
            }}
          >
            {`${electionType.toUpperCase()} ${year}`}
          </div>
          {electorateSize && (
            <div
              style={{
                fontSize: 13,
                fontFamily: "monospace",
                color: "rgba(148, 163, 184, 0.5)",
              }}
            >
              {electorateSize}
            </div>
          )}
        </div>

        {/* CONDOR logo — bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 32,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${primary}, ${primaryLight})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
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
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: "0.1em",
                color: "rgba(241, 245, 249, 0.8)",
                fontFamily: "system-ui",
              }}
            >
              CONDOR
            </span>
            <span
              style={{
                fontSize: 9,
                letterSpacing: "0.25em",
                color: "rgba(148, 163, 184, 0.5)",
                fontFamily: "monospace",
              }}
            >
              ELECTORAL AI
            </span>
          </div>
        </div>

        {/* URL — bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            right: 32,
            fontSize: 13,
            fontFamily: "monospace",
            color: "rgba(148, 163, 184, 0.4)",
            letterSpacing: "0.05em",
          }}
        >
          condorlatam.com/{country}
        </div>

        {/* Bottom gradient bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
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
