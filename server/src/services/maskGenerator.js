import sharp from "sharp";

const WHITE_THRESHOLD = 240;

/**
 * Génère un masque binaire à partir de layout_image.
 * Blanc = zones à inpainter (placeholders), noir = zone à préserver.
 */
export async function generateMask(layoutImageBuffer) {
  const { data, info } = await sharp(layoutImageBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const maskData = Buffer.alloc(width * height * 3);

  for (let i = 0; i < width * height; i++) {
    const offset = i * channels;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    const isWhite =
      r > WHITE_THRESHOLD && g > WHITE_THRESHOLD && b > WHITE_THRESHOLD;
    const value = isWhite ? 255 : 0;
    const maskOffset = i * 3;
    maskData[maskOffset] = value;
    maskData[maskOffset + 1] = value;
    maskData[maskOffset + 2] = value;
  }

  return sharp(maskData, { raw: { width, height, channels: 3 } })
    .png()
    .toBuffer();
}

export function bufferToDataUrl(buffer, mimeType = "image/png") {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

export function dataUrlToBuffer(dataUrl) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid data URL format");
  }
  return Buffer.from(match[2], "base64");
}
