import {
  assertSessionOwner,
  addMessage,
  createSession,
  findOpenSessionForUser,
  getSession,
  listMessages,
  listSessionsForUser,
  updateSession,
} from "./chatSessionStore.js";
import {
  buildChatMessages,
  formatContextSources,
  retrieve,
  sanitizeTrialPolicyResponse,
} from "./ragService.js";
import { chatCompletion, isMistralConfigured } from "./mistralService.js";
import { emitChatEvent } from "./chatRealtime.js";
import {
  createAgentThread,
  isDiscordBridgeConfigured,
  isDiscordBridgeReady,
  getDiscordBridgeError,
  relayUserMessageToDiscord,
} from "./discordBridgeService.js";

const ESCALATION_PATTERN =
  /\b(agent|humain|conseiller|conseillère|support|parler à quelqu'un|parler a quelqu'un|vrai personne|personne réelle|operateur|opérateur)\b/i;

const WELCOME_MESSAGE =
  "Bonjour ! Je suis l'assistant RealStage AI. Posez-moi une question sur l'application, les forfaits ou les modes Meubler, Remplacer et Vider. Vous pouvez aussi cliquer sur « Parler à un agent » pour un conseiller humain.";

export function wantsHumanAgent(text) {
  return ESCALATION_PATTERN.test(text ?? "");
}

export async function getOrCreateSession(user) {
  const existing = await findOpenSessionForUser(user.uid);
  if (existing) return existing;
  return createSession({ uid: user.uid, email: user.email });
}

export async function getSessionWithMessages(sessionId, uid) {
  await assertSessionOwner(sessionId, uid);
  const [session, messages] = await Promise.all([
    getSession(sessionId),
    listMessages(sessionId),
  ]);
  return { session, messages };
}

export async function ensureWelcomeMessage(sessionId) {
  const messages = await listMessages(sessionId);
  if (messages.length > 0) return null;
  const welcome = await addMessage(sessionId, {
    role: "assistant",
    content: WELCOME_MESSAGE,
    source: "system",
  });
  emitChatEvent(sessionId, "message", { message: welcome });
  return welcome;
}

async function generateAiReply(sessionId, userMessage, history) {
  if (!isMistralConfigured()) {
    return {
      content:
        "L'assistant IA n'est pas configuré sur ce serveur. Utilisez « Parler à un agent » pour contacter le support.",
      topics: [],
    };
  }

  const contextChunks = await retrieve(userMessage);
  const messages = buildChatMessages({
    contextChunks,
    history,
    userMessage,
  });
  const content = sanitizeTrialPolicyResponse(
    await chatCompletion({ messages, temperature: 0.1 }),
  );
  return {
    content,
    topics: formatContextSources(contextChunks),
  };
}

export async function escalateToAgent(sessionId, uid) {
  const session = await assertSessionOwner(sessionId, uid);
  if (session.mode === "agent") return session;

  let discordThreadId = null;
  let discordNotice = null;

  if (isDiscordBridgeConfigured()) {
    if (!isDiscordBridgeReady()) {
      const detail = getDiscordBridgeError();
      discordNotice = detail
        ? `Le bot Discord n'est pas connecté (${detail}). Redémarrez le serveur après avoir vérifié DISCORD_BOT_TOKEN.`
        : "Le bot Discord n'est pas encore connecté. Réessayez dans quelques secondes ou redémarrez le serveur.";
    } else {
      try {
        discordThreadId = await createAgentThread(session);
      } catch (err) {
        console.error("Escalade Discord:", err.message);
        discordNotice =
          "Impossible d'ouvrir un fil Discord. Vérifiez que DISCORD_SUPPORT_CHANNEL_ID est bien l'ID du salon (pas de l'application) et que le bot a accès à ce salon.";
      }
    }
  }

  const updated = await updateSession(sessionId, {
    mode: "agent",
    discordThreadId,
  });

  const notice =
    discordNotice ??
    (discordThreadId
      ? "Vous êtes maintenant en contact avec notre équipe. Un conseiller vous répondra ici sous peu."
      : "Demande transmise. Un conseiller vous répondra dès que possible (Discord non configuré sur le serveur).");

  const systemMsg = await addMessage(sessionId, {
    role: "assistant",
    content: notice,
    source: "system",
  });
  emitChatEvent(sessionId, "session_escalated", { session: updated });
  emitChatEvent(sessionId, "message", { message: systemMsg });

  return updated;
}

export async function handleUserMessage(sessionId, uid, content) {
  const trimmed = content?.trim();
  if (!trimmed) {
    const err = new Error("Message vide.");
    err.status = 400;
    throw err;
  }

  const session = await assertSessionOwner(sessionId, uid);
  if (session.status === "closed") {
    const err = new Error(
      "Cette conversation est terminée. Ouvrez une nouvelle conversation.",
    );
    err.status = 400;
    err.code = "session_closed";
    throw err;
  }

  const userMsg = await addMessage(sessionId, {
    role: "user",
    content: trimmed,
    source: "web",
  });
  emitChatEvent(sessionId, "message", { message: userMsg });

  if (session.mode === "agent") {
    if (isDiscordBridgeConfigured()) {
      await relayUserMessageToDiscord(session, trimmed);
    }
    return { userMessage: userMsg, assistantMessage: null, escalated: false };
  }

  if (wantsHumanAgent(trimmed)) {
    const updated = await escalateToAgent(sessionId, uid);
    if (isDiscordBridgeConfigured() && updated.discordThreadId) {
      await relayUserMessageToDiscord(updated, trimmed);
    }
    return {
      userMessage: userMsg,
      assistantMessage: null,
      escalated: true,
      session: updated,
    };
  }

  const history = await listMessages(sessionId);
  const { content: reply, topics } = await generateAiReply(
    sessionId,
    trimmed,
    history,
  );

  const assistantMsg = await addMessage(sessionId, {
    role: "assistant",
    content: reply,
    source: "ai",
    topics,
  });
  emitChatEvent(sessionId, "message", { message: assistantMsg });

  return {
    userMessage: userMsg,
    assistantMessage: assistantMsg,
    escalated: false,
  };
}

export async function relayAgentMessage(sessionId, content, agentName) {
  const session = await getSession(sessionId);
  if (!session || session.status !== "open") return null;

  const message = await addMessage(sessionId, {
    role: "agent",
    content,
    source: "discord",
    agentName: agentName || "Conseiller",
  });
  emitChatEvent(sessionId, "message", { message });
  return message;
}

export async function getChatHistory(uid, { limit = 20 } = {}) {
  const sessions = await listSessionsForUser(uid, { status: "closed", limit });
  const withPreview = await Promise.all(
    sessions.map(async (session) => {
      const messages = await listMessages(session.id, { limit: 50 });
      const previewMsg = [...messages]
        .reverse()
        .find((m) => m.role === "user" || m.role === "agent");
      return {
        ...session,
        preview:
          previewMsg?.content?.slice(0, 120) ??
          messages.at(-1)?.content?.slice(0, 120) ??
          null,
      };
    }),
  );
  return withPreview;
}

export async function closeSession(sessionId, { by = "system" } = {}) {
  const session = await getSession(sessionId);
  if (!session || session.status === "closed") {
    return { closedSession: session, newSession: null };
  }

  const closedSession = await updateSession(sessionId, {
    status: "closed",
    mode: "ai",
  });

  const notice = await addMessage(sessionId, {
    role: "assistant",
    content:
      by === "agent"
        ? "La conversation a été clôturée par un conseiller. Merci de nous avoir contactés."
        : "Conversation terminée.",
    source: "system",
  });

  const newSession = await createSession({
    uid: session.uid,
    email: session.email,
  });
  await ensureWelcomeMessage(newSession.id);
  const newMessages = await listMessages(newSession.id);

  emitChatEvent(sessionId, "session_closed", {
    closedSession,
    newSession,
    newMessages,
  });

  emitChatEvent(sessionId, "message", { message: notice });

  return { closedSession, newSession, newMessages };
}
