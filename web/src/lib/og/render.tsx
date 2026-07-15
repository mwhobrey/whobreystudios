import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

export async function renderBrandOgImage() {
  const logoData = await readFile(
    join(process.cwd(), "public/brand/logo-horizontal.png"),
    "base64",
  );
  const logoSrc = `data:image/png;base64,${logoData}`;

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
          gap: 40,
          background:
            "radial-gradient(circle at 50% 42%, rgba(46,196,182,0.20) 0%, rgba(0,0,0,0) 62%), #000000",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori (next/og) only supports plain <img>, not next/image */}
        <img src={logoSrc} width={680} height={254} alt="" />
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#2ec4b6",
            letterSpacing: 5,
            textTransform: "uppercase",
          }}
        >
          Graphic Design · Vinyl Decals · Vehicle Wraps · Signage
        </div>
      </div>
    ),
    OG_IMAGE_SIZE,
  );
}
