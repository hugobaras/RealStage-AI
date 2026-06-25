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

export async function fetchAgencySettings(idToken) {
  const data = await apiFetch("/api/agency-settings", { idToken });
  return data.settings;
}

export async function updateAgencySettings(idToken, settings) {
  const data = await apiFetch("/api/agency-settings", {
    idToken,
    method: "PUT",
    body: settings,
  });
  return data.settings;
}

export async function uploadAgencyLogo(idToken, imageDataUrl) {
  const data = await apiFetch("/api/agency-settings/logo", {
    idToken,
    method: "POST",
    body: { image: imageDataUrl },
  });
  return data.settings;
}
