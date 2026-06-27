export async function patchMePreferences(idToken, body) {
  const response = await fetch("/api/me/preferences", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erreur préférences.");
  return data;
}
