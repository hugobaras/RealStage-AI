export async function reportGeneration(
  { generationId, reason, comment },
  idToken,
) {
  const headers = { "Content-Type": "application/json" };
  if (idToken) {
    headers.Authorization = `Bearer ${idToken}`;
  }

  const response = await fetch("/api/reports/generation", {
    method: "POST",
    headers,
    body: JSON.stringify({
      generation_id: generationId,
      reason,
      comment: comment || null,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Impossible d'envoyer le signalement.");
  }

  return data;
}
