import { getMistralConfig } from "../config.js";

const MISTRAL_API = "https://api.mistral.ai/v1";

function requireApiKey() {
  const config = getMistralConfig();
  if (!config.configured) {
    throw new Error("MISTRAL_API_KEY non configurée.");
  }
  return config;
}

export async function embedTexts(texts) {
  const config = requireApiKey();
  const response = await fetch(`${MISTRAL_API}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.embedModel,
      input: texts,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || "Erreur Mistral embeddings.");
  }

  return data.data
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);
}

export async function embedText(text) {
  const [embedding] = await embedTexts([text]);
  return embedding;
}

export async function chatCompletion({ messages, temperature = 0.3 }) {
  const config = requireApiKey();
  const response = await fetch(`${MISTRAL_API}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.chatModel,
      messages,
      temperature,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || "Erreur Mistral chat.");
  }

  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

export function isMistralConfigured() {
  return getMistralConfig().configured;
}
