import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 36,
          background: "linear-gradient(135deg, #8B1A1A 0%, #C42B2B 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <span
          style={{
            fontSize: 80,
            fontWeight: 900,
            color: "white",
            fontFamily: "system-ui",
            lineHeight: 1,
          }}
        >
          C
        </span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.15em",
            color: "rgba(255,255,255,0.8)",
            fontFamily: "system-ui",
          }}
        >
          CONDOR
        </span>
      </div>
    ),
    { ...size }
  );
}
