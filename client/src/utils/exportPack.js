import JSZip from "jszip";
import { ROOM_TYPES } from "../constants/roomTypes";
import { getStyleById } from "../constants/styles";
import { normalizeAgencyTypography } from "../constants/agencyTypography";

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function resolveBlob(imageSrc) {
  if (imageSrc.startsWith("data:")) {
    const response = await fetch(imageSrc);
    return response.blob();
  }
  const response = await fetch(imageSrc);
  if (!response.ok) throw new Error("Impossible de charger l'image");
  return response.blob();
}

async function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function slugifyRoom(roomType) {
  if (!roomType) return "piece";
  const room = ROOM_TYPES.find((r) => r.id === roomType);
  const label = room?.label ?? roomType;
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function slugifyAddress(address) {
  if (!address?.trim()) return "bien";
  return address
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function getStyleSlug(styleId) {
  if (!styleId) return "apres";
  const style = getStyleById(styleId);
  return (style?.label ?? styleId)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function drawLabel(ctx, text, x, y, align = "left", size = 28) {
  drawStyledText(ctx, text, x, y, { align, size, bold: true });
}

function drawStyledText(
  ctx,
  text,
  x,
  y,
  { align = "left", size = 16, bold = false, color = "#ffffff" } = {},
) {
  const weight = bold ? "bold" : "normal";
  ctx.font = `${weight} ${size}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillText(text, x + 1, y + 1);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function brandingTypography(branding) {
  return normalizeAgencyTypography(branding ?? {});
}

function brandingFooterHeight(branding) {
  if (!branding?.photoSignature && !branding?.legalMentions) return 0;
  const typo = brandingTypography(branding);
  let h = 14;
  if (branding.photoSignature) h += typo.signatureFontSize + 6;
  if (branding.legalMentions) h += typo.legalFontSize + 4;
  return h;
}

function aiLabelFooterHeight(exportLabel, scale = 1) {
  if (!exportLabel?.enabled) return 0;
  return Math.round(30 * scale);
}

function exportFooterHeight(branding, exportLabel, scale = 1) {
  return (
    brandingFooterHeight(branding) + aiLabelFooterHeight(exportLabel, scale)
  );
}

function drawBrandingFooter(
  ctx,
  branding,
  canvasWidth,
  canvasHeight,
  scale = 1,
  exportLabel = null,
) {
  const typo = brandingTypography(branding ?? {});
  const marginX = Math.round(16 * scale);
  let y = canvasHeight - Math.round(8 * scale);

  if (exportLabel?.enabled) {
    drawStyledText(ctx, exportLabel.text, canvasWidth / 2, y, {
      align: "center",
      size: Math.round(13 * scale),
      color: "#d4d4d4",
    });
    y -= aiLabelFooterHeight(exportLabel, scale);
  }

  if (!branding) return;

  if (branding.legalMentions) {
    drawStyledText(ctx, branding.legalMentions, marginX, y, {
      size: Math.round(typo.legalFontSize * scale),
      bold: typo.legalBold,
    });
    y -= Math.round(typo.legalFontSize * scale) + Math.round(6 * scale);
  }

  if (branding.photoSignature) {
    drawStyledText(ctx, branding.photoSignature, marginX, y, {
      size: Math.round(typo.signatureFontSize * scale),
      bold: typo.signatureBold,
    });
  }
}

/** Ajoute une bandeau « Image générée par IA » sous une photo exportée. */
export async function applyImageLabel(imageSrc, text) {
  if (!imageSrc || !text?.trim()) return imageSrc;

  const img = await loadImage(imageSrc);
  const scale = Math.max(0.75, Math.min(1.5, img.naturalWidth / 1200));
  const barH = Math.round(36 * scale);
  const fontSize = Math.round(14 * scale);

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight + barH;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  ctx.fillStyle = "rgba(0,0,0,0.72)";
  ctx.fillRect(0, img.naturalHeight, canvas.width, barH);

  drawStyledText(
    ctx,
    text.trim(),
    canvas.width / 2,
    img.naturalHeight + barH - Math.round(12 * scale),
    {
      align: "center",
      size: fontSize,
      color: "#e5e5e5",
    },
  );

  return canvas.toDataURL("image/jpeg", 0.92);
}

function resolveLogoRect(
  position,
  { regionLeft, regionTop, regionWidth, regionHeight, logoW, logoH, margin },
) {
  const maxX = regionLeft + regionWidth - logoW - margin;
  const maxY = regionTop + regionHeight - logoH - margin;
  const minX = regionLeft + margin;
  const minY = regionTop + margin;

  switch (position) {
    case "bottom-left":
      return { x: minX, y: maxY };
    case "center":
      return {
        x: regionLeft + (regionWidth - logoW) / 2,
        y: regionTop + (regionHeight - logoH) / 2,
      };
    case "bottom-right":
    default:
      return { x: maxX, y: maxY };
  }
}

async function drawBrandingLogo(ctx, branding, region) {
  if (!branding?.logoUrl) return;

  try {
    const logo = await loadImage(branding.logoUrl);
    const logoW = Math.round(region.regionWidth * (region.logoScale ?? 0.1));
    const logoH = Math.round((logo.naturalHeight / logo.naturalWidth) * logoW);
    const { x, y } = resolveLogoRect(
      branding.watermarkPosition ?? "bottom-right",
      {
        ...region,
        logoW,
        logoH,
        margin: region.margin ?? 16,
      },
    );

    ctx.globalAlpha = branding.logoOpacity ?? 0.15;
    ctx.drawImage(logo, x, y, logoW, logoH);
    ctx.globalAlpha = 1;
  } catch {
    /* ignore */
  }
}

export async function composeSideBySide(beforeSrc, afterSrc, options = {}) {
  const branding = options.branding ?? null;
  const exportLabel = options.exportLabel ?? null;
  const [before, after] = await Promise.all([
    loadImage(beforeSrc),
    loadImage(afterSrc),
  ]);

  const h = Math.max(before.naturalHeight, after.naturalHeight);
  const w1 = Math.round((before.naturalWidth / before.naturalHeight) * h);
  const w2 = Math.round((after.naturalWidth / after.naturalHeight) * h);
  const gap = 8;
  const labelH = 48;
  const footerH = exportFooterHeight(branding, exportLabel);

  const canvas = document.createElement("canvas");
  canvas.width = w1 + w2 + gap;
  canvas.height = h + labelH + footerH;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(before, 0, labelH, w1, h);
  ctx.drawImage(after, w1 + gap, labelH, w2, h);
  drawLabel(ctx, "Avant", 16, 36);
  drawLabel(ctx, "Après", w1 + gap + 16, 36);

  await drawBrandingLogo(ctx, branding, {
    regionLeft: 0,
    regionTop: labelH,
    regionWidth: canvas.width,
    regionHeight: h,
    logoScale: 0.1,
    margin: 16,
  });

  drawBrandingFooter(
    ctx,
    branding,
    canvas.width,
    canvas.height,
    1,
    exportLabel,
  );

  return canvas.toDataURL("image/jpeg", 0.92);
}

export async function composeStory(beforeSrc, afterSrc, options = {}) {
  const branding = options.branding ?? null;
  const exportLabel = options.exportLabel ?? null;
  const [before, after] = await Promise.all([
    loadImage(beforeSrc),
    loadImage(afterSrc),
  ]);

  const width = 1080;
  const height = 1920;
  const halfH = Math.floor(height / 2);
  const gap = 4;
  const footerH = exportFooterHeight(branding, exportLabel, 1.2);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height + footerH;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  function drawCover(img, y, h) {
    const scale = Math.max(width / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = (width - dw) / 2;
    const dy = y + (h - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  drawCover(before, 0, halfH - gap / 2);
  drawCover(after, halfH + gap / 2, halfH - gap / 2);
  drawLabel(ctx, "Avant", 24, 48);
  drawLabel(ctx, "Après", 24, halfH + 48);

  if (branding) {
    await drawBrandingLogo(ctx, branding, {
      regionLeft: 0,
      regionTop: 0,
      regionWidth: width,
      regionHeight: height,
      logoScale: 120 / width,
      margin: 24,
    });

    drawBrandingFooter(
      ctx,
      branding,
      width,
      height + footerH,
      1.2,
      exportLabel,
    );
  } else if (exportLabel?.enabled) {
    drawBrandingFooter(ctx, null, width, height + footerH, 1.2, exportLabel);
  }

  return canvas.toDataURL("image/jpeg", 0.92);
}

export async function composeVariantGrid(beforeSrc, variants, options = {}) {
  const branding = options.branding ?? null;
  const exportLabel = options.exportLabel ?? null;
  const before = await loadImage(beforeSrc);
  const afterSources = await Promise.all(
    variants.map((v) => maybeLabelAfter(v.after ?? v.imageUrl, exportLabel)),
  );
  const afterImages = await Promise.all(
    afterSources.map((src) => loadImage(src)),
  );

  const count = afterImages.length + 1;
  const cellH = 400;
  const gap = 8;
  const labelH = 36;
  const footerH = exportFooterHeight(branding, exportLabel);
  const totalW = count * 320 + (count - 1) * gap;

  const canvas = document.createElement("canvas");
  canvas.width = totalW;
  canvas.height = cellH + labelH + footerH;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const images = [before, ...afterImages];
  const labels = [
    "Avant",
    ...variants.map((v, i) => {
      const letter = String.fromCharCode(65 + i);
      const styleSlug = getStyleSlug(v.style);
      return `${letter} — ${styleSlug}`;
    }),
  ];

  images.forEach((img, i) => {
    const x = i * (320 + gap);
    const scale = Math.min(320 / img.naturalWidth, cellH / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = x + (320 - dw) / 2;
    const dy = labelH + (cellH - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
    drawLabel(ctx, labels[i], x + 8, 24, "left", 16);
  });

  if (
    branding?.photoSignature ||
    branding?.legalMentions ||
    exportLabel?.enabled
  ) {
    drawBrandingFooter(
      ctx,
      branding,
      canvas.width,
      canvas.height,
      1,
      exportLabel,
    );
  }

  return canvas.toDataURL("image/jpeg", 0.92);
}

function prefixForIndex(index) {
  if (index == null || index < 1) return "";
  return `${String(index).padStart(2, "0")}-`;
}

async function maybeLabelAfter(src, exportLabel) {
  if (!exportLabel?.enabled) return src;
  return applyImageLabel(src, exportLabel.text);
}

async function buildRoomFiles({
  before,
  after,
  roomType,
  index,
  branding,
  exportLabel,
  variants,
}) {
  const slug = slugifyRoom(roomType);
  const prefix = prefixForIndex(index);
  const base = `${prefix}${slug}`;

  const composeOpts = { branding, exportLabel };

  const files = [];

  const beforeBlob = await resolveBlob(before);
  files.push({ name: `${base}-avant.jpg`, blob: beforeBlob });

  if (variants?.length >= 2) {
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      const styleSlug = getStyleSlug(v.style);
      const labeled = await maybeLabelAfter(v.after ?? v.imageUrl, exportLabel);
      const afterBlob = await resolveBlob(labeled);
      files.push({ name: `${base}-apres-${styleSlug}.jpg`, blob: afterBlob });
    }
    const grid = await composeVariantGrid(before, variants, composeOpts);
    files.push({
      name: `${base}-comparaison-variantes.jpg`,
      blob: await resolveBlob(grid),
    });
  } else {
    const labeledAfter = await maybeLabelAfter(after, exportLabel);
    const afterBlob = await resolveBlob(labeledAfter);
    files.push({ name: `${base}-apres.jpg`, blob: afterBlob });

    const [comparison, story] = await Promise.all([
      composeSideBySide(before, labeledAfter, composeOpts),
      composeStory(before, labeledAfter, composeOpts),
    ]);
    files.push({
      name: `${base}-comparaison.jpg`,
      blob: await resolveBlob(comparison),
    });
    files.push({
      name: `${base}-story.jpg`,
      blob: await resolveBlob(story),
    });
  }

  return files;
}

export async function buildListingPack({
  before,
  after,
  roomType,
  index = null,
  branding = null,
  exportLabel = null,
  variants = null,
}) {
  const files = await buildRoomFiles({
    before,
    after,
    roomType,
    index,
    branding,
    exportLabel,
    variants,
  });

  const zip = new JSZip();
  for (const f of files) {
    zip.file(f.name, f.blob);
  }
  return zip.generateAsync({ type: "blob" });
}

export async function buildBatchListingPack(
  items,
  { branding, exportLabel } = {},
) {
  const zip = new JSZip();

  for (let i = 0; i < items.length; i++) {
    const { before, after, roomType, variants } = items[i];
    const index = i + 1;
    const slug = slugifyRoom(roomType);
    const folder = `${String(index).padStart(2, "0")}-${slug}`;

    const files = await buildRoomFiles({
      before,
      after,
      roomType,
      branding,
      exportLabel,
      variants,
    });

    for (const f of files) {
      zip.file(`${folder}/${f.name}`, f.blob);
    }
  }

  return zip.generateAsync({ type: "blob" });
}

export async function buildPropertyListingPack(
  items,
  { address, label, branding, exportLabel } = {},
) {
  const zip = new JSZip();
  const root = slugifyAddress(address || label || "bien");

  const roomMap = new Map();
  for (const item of items) {
    const slug = slugifyRoom(item.roomType);
    if (!roomMap.has(slug)) roomMap.set(slug, []);
    roomMap.get(slug).push(item);
  }

  for (const [roomSlug, roomItems] of roomMap) {
    const item = roomItems[roomItems.length - 1];
    const files = await buildRoomFiles({
      before: item.before,
      after: item.after,
      roomType: item.roomType,
      branding,
      exportLabel,
      variants: item.variants,
    });

    for (const f of files) {
      zip.file(`${root}/${roomSlug}/${f.name}`, f.blob);
    }
  }

  const readme = [
    `RealStage AI — Pack annonce`,
    `Bien : ${label || address || ""}`,
    `Adresse : ${address || ""}`,
    `Date : ${new Date().toLocaleString("fr-FR")}`,
    `Pièces : ${roomMap.size}`,
  ].join("\n");
  zip.file(`${root}/README.txt`, readme);

  return zip.generateAsync({ type: "blob" });
}

export async function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.rel = "noopener";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function downloadListingPack(options) {
  const blob = await buildListingPack(options);
  const slug = slugifyRoom(options.roomType);
  await downloadBlob(blob, `realstage-${slug}-pack.zip`);
}

export async function downloadBatchListingPack(items, options = {}) {
  const blob = await buildBatchListingPack(items, options);
  await downloadBlob(blob, `realstage-annonce-pack.zip`);
}

export async function downloadPropertyListingPack(items, options = {}) {
  const blob = await buildPropertyListingPack(items, options);
  const slug = slugifyAddress(options.address || options.label);
  await downloadBlob(blob, `realstage-${slug}-pack.zip`);
}

export async function urlToBlobForPack(url) {
  const blob = await resolveBlob(url);
  return blobToDataUrl(blob);
}
