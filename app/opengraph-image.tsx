import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "The Farm 1893 — Wedding & Gathering Venue";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f7f3ec 0%, #efe7d9 55%, #e6dccb 100%)",
          fontFamily: "Georgia, serif",
          position: "relative",
        }}
      >
        {/* frame */}
        <div style={{ position: "absolute", inset: 28, border: "1px solid rgba(28,26,23,0.18)", borderRadius: 8 }} />

        {/* barn + orchard mark */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#7c8768" }} />
          <div style={{ width: 18, height: 18, borderRadius: 999, background: "#b0563b" }} />
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#b18f57" }} />
        </div>

        <div
          style={{
            fontSize: 34,
            letterSpacing: 10,
            textTransform: "uppercase",
            color: "#b18f57",
            marginBottom: 6,
            display: "flex",
          }}
        >
          Est. 1893
        </div>

        <div style={{ fontSize: 128, color: "#1c1a17", fontWeight: 600, lineHeight: 1.05, display: "flex" }}>
          The Farm 1893
        </div>

        <div style={{ width: 520, height: 1, background: "rgba(28,26,23,0.25)", margin: "22px 0" }} />

        <div style={{ fontSize: 52, color: "#7c8768", fontStyle: "italic", display: "flex" }}>
          Wedding &amp; Gathering Venue
        </div>

        <div
          style={{
            fontSize: 26,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#8b8175",
            marginTop: 28,
            display: "flex",
          }}
        >
          Berlin Heights · Ohio
        </div>
      </div>
    ),
    { ...size }
  );
}
