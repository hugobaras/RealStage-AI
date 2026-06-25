export async function fetchGenerations(idToken, { propertyId } = {}) {
  const headers = {};
  if (idToken) {
    headers.Authorization = `Bearer ${idToken}`;
  }

  const params = new URLSearchParams();
  if (propertyId) params.set("propertyId", propertyId);

  const url = params.toString()
    ? `/api/generations?${params}`
    : "/api/generations";

  const response = await fetch(url, { headers });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Impossible de charger l'historique.");
  }

  return data;
}

export async function toggleGenerationFavorite(id, favorite, idToken) {
  const headers = { "Content-Type": "application/json" };
  if (idToken) {
    headers.Authorization = `Bearer ${idToken}`;
  }

  const response = await fetch(`/api/generations/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ favorite }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Impossible de mettre à jour le favori.");
  }

  return data.generation;
}
