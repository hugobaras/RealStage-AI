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
  return {
    "Content-Type": "application/json",
    ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
  };
}

export async function createOrResumeChatSession(idToken) {
  const response = await fetch("/api/chat/sessions", {
    method: "POST",
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function fetchChatHistory(idToken) {
  const response = await fetch("/api/chat/sessions/history", {
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function fetchChatMessages(idToken, sessionId) {
  const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}

export async function sendChatMessage(idToken, sessionId, content) {
  const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
    method: "POST",
    headers: authHeaders(idToken),
    body: JSON.stringify({ content }),
  });
  return parseResponse(response);
}

export async function escalateChatSession(idToken, sessionId) {
  const response = await fetch(`/api/chat/sessions/${sessionId}/escalate`, {
    method: "POST",
    headers: authHeaders(idToken),
  });
  return parseResponse(response);
}
