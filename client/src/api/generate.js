export async function generateImage(payload, idToken) {
  const headers = { "Content-Type": "application/json" };
  if (idToken) {
    headers.Authorization = `Bearer ${idToken}`;
  }

  const response = await fetch("/api/generate", {
    method: "POST",
    headers,
    body: JSON.stringify({
      mode: payload.mode ?? "meubler",
      base_image: payload.base_image,
      room_type: payload.room_type,
      style: payload.style,
      deep_thinking: payload.deep_thinking ?? false,
      room_sqm: payload.room_sqm ?? null,
      variant_group_id: payload.variant_group_id ?? null,
      variant_index: payload.variant_index ?? null,
      property_id: payload.property_id ?? null,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const err = new Error(data.error || "Generation failed");
    err.code = data.code;
    err.status = response.status;
    throw err;
  }

  return data;
}

/** @deprecated Utiliser generateImage */
export const generateStaging = generateImage;
