function clamp(value, min = 0, max = 255) {
  return Math.min(max, Math.max(min, value));
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function resolveImageBlob(imageSrc) {
  if (imageSrc.startsWith("data:")) {
    const response = await fetch(imageSrc);
    return response.blob();
  }

  const response = await fetch(imageSrc);
  if (!response.ok) {
    throw new Error("Impossible de charger l'image");
  }
  return response.blob();
}

/**
 * Applique luminosité et température de couleur (traitement local, sans IA).
 * brightness / temperature : -100 à 100 (0 = neutre).
 */
export async function applyImageAdjustments(
  imageSrc,
  { brightness = 0, temperature = 0 } = {},
) {
  if (!imageSrc) return null;
  if (brightness === 0 && temperature === 0) return imageSrc;

  const blob = await resolveImageBlob(imageSrc);
  const objectUrl = URL.createObjectURL(blob);

  try {
    const img = await loadImage(objectUrl);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data } = imageData;

    const brightnessOffset = (brightness / 100) * 80;
    const warmth = (temperature / 100) * 40;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = clamp(data[i] + brightnessOffset + warmth);
      data[i + 1] = clamp(data[i + 1] + brightnessOffset);
      data[i + 2] = clamp(data[i + 2] + brightnessOffset - warmth);
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.92);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function downloadImage(
  imageSrc,
  filename = "realstage-photo.jpg",
) {
  const blob = await resolveImageBlob(imageSrc);
  const objectUrl = URL.createObjectURL(blob);

  try {
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    link.rel = "noopener";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/** @deprecated Utiliser downloadImage */
export const downloadDataUrl = downloadImage;
