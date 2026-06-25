async function apiFetch(path, { idToken, method = "GET", body } = {}) {
  const headers = {};
  if (idToken) headers.Authorization = `Bearer ${idToken}`;
  if (body) headers["Content-Type"] = "application/json";

  const response = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  if (!response.ok) {
    const err = new Error(data.error || "Erreur API.");
    err.code = data.code;
    err.status = response.status;
    throw err;
  }
  return data;
}

export async function fetchProperties(idToken) {
  const data = await apiFetch("/api/properties", { idToken });
  return data.properties ?? [];
}

export async function createProperty(idToken, { label, address }) {
  const data = await apiFetch("/api/properties", {
    idToken,
    method: "POST",
    body: { label, address },
  });
  return data.property;
}

export async function updateProperty(idToken, id, updates) {
  const data = await apiFetch(`/api/properties/${id}`, {
    idToken,
    method: "PATCH",
    body: updates,
  });
  return data.property;
}

export async function deleteProperty(idToken, id) {
  return apiFetch(`/api/properties/${id}`, { idToken, method: "DELETE" });
}

export async function fetchPropertyGenerations(idToken, propertyId) {
  const data = await apiFetch(`/api/properties/${propertyId}/generations`, {
    idToken,
  });
  return data.generations ?? [];
}
