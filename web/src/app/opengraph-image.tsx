import { OG_IMAGE_SIZE, renderBrandOgImage } from "@/lib/og/render";

export const runtime = "nodejs";
export const alt = "Whobrey Studios";
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return renderBrandOgImage();
}
