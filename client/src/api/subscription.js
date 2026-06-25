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

export async function fetchSubscription(idToken) {
  const response = await fetch("/api/subscription", {
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function activateSubscription(idToken, planId) {
  const response = await fetch("/api/subscription/activate", {
    method: "POST",
    headers: authHeaders(idToken),
    body: JSON.stringify({ planId }),
  });
  return parseResponse(response);
}

export async function createCheckoutSession(idToken, planId, embedded = true) {
  const response = await fetch("/api/billing/checkout", {
    method: "POST",
    headers: authHeaders(idToken),
    body: JSON.stringify({ planId, embedded }),
  });
  return parseResponse(response);
}

export async function createBillingPortalSession(idToken) {
  const response = await fetch("/api/billing/portal", {
    method: "POST",
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function syncBillingSubscription(idToken) {
  const response = await fetch("/api/billing/sync", {
    method: "POST",
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function cancelSubscription(idToken) {
  const response = await fetch("/api/subscription/cancel", {
    method: "POST",
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}
