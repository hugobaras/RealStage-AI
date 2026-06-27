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

export async function batchAdminReports(idToken, body) {
  const response = await fetch("/api/admin/reports/batch", {
    method: "POST",
    headers: authHeaders(idToken),
    body: JSON.stringify(body),
  });
  return parseResponse(response);
}

export async function banReportAuthor(idToken, id) {
  const response = await fetch(`/api/admin/reports/${id}/ban-author`, {
    method: "POST",
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function moderateAdminGeneration(idToken, uid, id, body) {
  const response = await fetch(`/api/admin/generations/${uid}/${id}/moderate`, {
    method: "PATCH",
    headers: authHeaders(idToken),
    body: JSON.stringify(body),
  });
  return parseResponse(response);
}

export async function fetchAdminBlacklist(idToken) {
  const response = await fetch("/api/admin/blacklist", {
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function updateAdminBlacklist(idToken, body) {
  const response = await fetch("/api/admin/blacklist", {
    method: "PUT",
    headers: authHeaders(idToken),
    body: JSON.stringify(body),
  });
  return parseResponse(response);
}

export async function fetchAiLabelCompliance(idToken) {
  const response = await fetch("/api/admin/compliance/ai-label", {
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function fetchAdminBillingCoupons(idToken) {
  const response = await fetch("/api/admin/billing/coupons", {
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function createAdminBillingCoupon(idToken, body) {
  const response = await fetch("/api/admin/billing/coupons", {
    method: "POST",
    headers: authHeaders(idToken),
    body: JSON.stringify(body),
  });
  return parseResponse(response);
}

export async function fetchAdminUserInvoices(idToken, uid) {
  const response = await fetch(`/api/admin/users/${uid}/invoices`, {
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function fetchAdminAgencies(idToken) {
  const response = await fetch("/api/admin/agencies", {
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function fetchAdminAgency(idToken, id) {
  const response = await fetch(`/api/admin/agencies/${id}`, {
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function fetchAdminPlatform(idToken) {
  const response = await fetch("/api/admin/platform", {
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function updateAdminPlatform(idToken, body) {
  const response = await fetch("/api/admin/platform", {
    method: "PUT",
    headers: authHeaders(idToken),
    body: JSON.stringify(body),
  });
  return parseResponse(response);
}

export async function fetchAdminAdmins(idToken) {
  const response = await fetch("/api/admin/admins", {
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function impersonateAdminUser(idToken, uid) {
  const response = await fetch(`/api/admin/users/${uid}/impersonate`, {
    method: "POST",
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function fetchAdminEmailTemplates(idToken) {
  const response = await fetch("/api/admin/emails/templates", {
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function sendTestAdminEmail(idToken, templateId) {
  const response = await fetch("/api/admin/emails/send-test", {
    method: "POST",
    headers: authHeaders(idToken),
    body: JSON.stringify({ templateId }),
  });
  return parseResponse(response);
}

export async function fetchAdminNotifications(idToken) {
  const response = await fetch("/api/admin/notifications", {
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function updateAdminNotifications(idToken, body) {
  const response = await fetch("/api/admin/notifications", {
    method: "PUT",
    headers: authHeaders(idToken),
    body: JSON.stringify(body),
  });
  return parseResponse(response);
}

export async function testAdminTuning(idToken, body) {
  const response = await fetch("/api/admin/tuning/test", {
    method: "POST",
    headers: authHeaders(idToken),
    body: JSON.stringify(body),
  });
  return parseResponse(response);
}

export async function fetchAdminSystemHealth(idToken) {
  const response = await fetch("/api/admin/system/health", {
    headers: authHeaders(idToken),
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

export async function fetchAdminAudit(
  idToken,
  { adminUid, action, from, to, limit, cursor } = {},
) {
  const params = new URLSearchParams();
  if (adminUid) params.set("adminUid", adminUid);
  if (action) params.set("action", action);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (limit) params.set("limit", String(limit));
  if (cursor) params.set("cursor", cursor);
  const qs = params.toString();
  const response = await fetch(`/api/admin/audit${qs ? `?${qs}` : ""}`, {
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function fetchAdminStripe(idToken) {
  const response = await fetch("/api/admin/stripe", {
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function fetchAdminSearch(idToken, query) {
  const params = new URLSearchParams({ q: query });
  const response = await fetch(`/api/admin/search?${params}`, {
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function syncAdminUserStripe(idToken, uid) {
  const response = await fetch(`/api/admin/users/${uid}/sync-stripe`, {
    method: "POST",
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function forceLogoutAdminUser(idToken, uid) {
  const response = await fetch(`/api/admin/users/${uid}/force-logout`, {
    method: "POST",
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function fetchHealth() {
  const response = await fetch("/api/health");
  return parseResponse(response);
}
