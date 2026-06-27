async function parseResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    const err = new Error(data.error || "Requête échouée.");
    err.code = data.code;
    err.status = response.status;
    throw err;
  }
  return data;
}

function authHeaders(idToken) {
  const headers = { "Content-Type": "application/json" };
  if (idToken) headers.Authorization = `Bearer ${idToken}`;
  return headers;
}

export async function fetchMe(idToken) {
  const response = await fetch("/api/me", {
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function fetchAdminStats(idToken) {
  const response = await fetch("/api/admin/stats", {
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function fetchAdminUsers(
  idToken,
  { pageToken, limit, search } = {},
) {
  const params = new URLSearchParams();
  if (pageToken) params.set("pageToken", pageToken);
  if (limit) params.set("limit", String(limit));
  if (search) params.set("search", search);
  const qs = params.toString();
  const response = await fetch(`/api/admin/users${qs ? `?${qs}` : ""}`, {
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function fetchAdminUser(idToken, uid) {
  const response = await fetch(`/api/admin/users/${uid}`, {
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function patchAdminUser(idToken, uid, body) {
  const response = await fetch(`/api/admin/users/${uid}`, {
    method: "PATCH",
    headers: authHeaders(idToken),
    body: JSON.stringify(body),
  });
  return parseResponse(response);
}

export async function grantAdminUser(idToken, uid, grant = true) {
  const response = await fetch(`/api/admin/users/${uid}/grant-admin`, {
    method: "POST",
    headers: authHeaders(idToken),
    body: JSON.stringify({ grant }),
  });
  return parseResponse(response);
}

export async function fetchAdminReports(idToken, { status, limit } = {}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (limit) params.set("limit", String(limit));
  const qs = params.toString();
  const response = await fetch(`/api/admin/reports${qs ? `?${qs}` : ""}`, {
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function patchAdminReport(idToken, id, body) {
  const response = await fetch(`/api/admin/reports/${id}`, {
    method: "PATCH",
    headers: authHeaders(idToken),
    body: JSON.stringify(body),
  });
  return parseResponse(response);
}

export async function fetchAdminGenerations(
  idToken,
  { uid, mode, limit } = {},
) {
  const params = new URLSearchParams();
  if (uid) params.set("uid", uid);
  if (mode) params.set("mode", mode);
  if (limit) params.set("limit", String(limit));
  const qs = params.toString();
  const response = await fetch(`/api/admin/generations${qs ? `?${qs}` : ""}`, {
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function deleteAdminGeneration(idToken, uid, id) {
  const response = await fetch(`/api/admin/generations/${uid}/${id}`, {
    method: "DELETE",
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function fetchAdminConfig(idToken, section) {
  const response = await fetch(`/api/admin/config/${section}`, {
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function updateAdminConfig(idToken, section, body) {
  const response = await fetch(`/api/admin/config/${section}`, {
    method: "PUT",
    headers: authHeaders(idToken),
    body: JSON.stringify(body),
  });
  return parseResponse(response);
}

export async function seedAdminConfig(idToken) {
  const response = await fetch("/api/admin/config/seed", {
    method: "POST",
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function fetchHealth() {
  const response = await fetch("/api/health");
  return parseResponse(response);
}
