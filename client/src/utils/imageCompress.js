function hasAlphaChannel(dataUrl) {
  return /^data:image\/(png|webp)/i.test(dataUrl);
}

export function compressImage(dataUrl, maxSize = 2048, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width <= maxSize && height <= maxSize) {
        resolve(dataUrl);
        return;
      }
      const scale = maxSize / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/** Redimensionne un logo en préservant la transparence PNG/WebP. */
export function compressLogo(dataUrl, maxSize = 512) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const preserveAlpha = hasAlphaChannel(dataUrl);
      let { width, height } = img;

      if (width <= maxSize && height <= maxSize) {
        resolve(dataUrl);
        return;
      }

      const scale = maxSize / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (preserveAlpha) {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/png"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}
