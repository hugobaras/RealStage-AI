import { randomUUID } from "crypto";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { initFirebaseAdmin, isFirebaseConfigured } from "./firebaseAdmin.js";

const COLLECTION = "chatSessions";
const memorySessions = new Map();
const memoryMessages = new Map();

function db() {
  initFirebaseAdmin();
  return getFirestore();
}

function sessionRef(sessionId) {
  return db().collection(COLLECTION).doc(sessionId);
}

function messagesRef(sessionId) {
  return sessionRef(sessionId).collection("messages");
}

function toMillis(value) {
  if (!value) return Date.now();
  if (typeof value === "number") return value;
  return value.toMillis?.() ?? Date.now();
}

function normalizeSession(id, data) {
  return {
    id,
    uid: data.uid,
    email: data.email ?? null,
    mode: data.mode ?? "ai",
    status: data.status ?? "open",
    discordThreadId: data.discordThreadId ?? null,
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  };
}

function normalizeMessage(id, data) {
  return {
    id,
    role: data.role,
    content: data.content,
    source: data.source ?? "web",
    agentName: data.agentName ?? null,
    createdAt: toMillis(data.createdAt),
    topics: data.topics ?? null,
  };
}

export async function findOpenSessionForUser(uid) {
  if (!isFirebaseConfigured()) {
    for (const session of memorySessions.values()) {
      if (session.uid === uid && session.status === "open") return session;
    }
    return null;
  }

  const snap = await db()
    .collection(COLLECTION)
    .where("uid", "==", uid)
    .limit(20)
    .get();

  const open = snap.docs
    .map((doc) => normalizeSession(doc.id, doc.data()))
    .filter((s) => s.status === "open")
    .sort((a, b) => b.updatedAt - a.updatedAt);

  return open[0] ?? null;
}

export async function createSession({ uid, email }) {
  const id = randomUUID();
  const now = Date.now();
  const session = {
    id,
    uid,
    email,
    mode: "ai",
    status: "open",
    discordThreadId: null,
    createdAt: now,
    updatedAt: now,
  };

  if (!isFirebaseConfigured()) {
    memorySessions.set(id, session);
    memoryMessages.set(id, []);
    return session;
  }

  await sessionRef(id).set({
    uid,
    email,
    mode: "ai",
    status: "open",
    discordThreadId: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return session;
}

export async function getSession(sessionId) {
  if (!isFirebaseConfigured()) {
    return memorySessions.get(sessionId) ?? null;
  }

  const doc = await sessionRef(sessionId).get();
  if (!doc.exists) return null;
  return normalizeSession(doc.id, doc.data());
}

export async function assertSessionOwner(sessionId, uid) {
  const session = await getSession(sessionId);
  if (!session) {
    const err = new Error("Session introuvable.");
    err.status = 404;
    throw err;
  }
  if (session.uid !== uid) {
    const err = new Error("Accès refusé à cette session.");
    err.status = 403;
    throw err;
  }
  return session;
}

export async function updateSession(sessionId, patch) {
  if (!isFirebaseConfigured()) {
    const existing = memorySessions.get(sessionId);
    if (!existing) return null;
    const updated = { ...existing, ...patch, updatedAt: Date.now() };
    memorySessions.set(sessionId, updated);
    return updated;
  }

  await sessionRef(sessionId).update({
    ...patch,
    updatedAt: FieldValue.serverTimestamp(),
  });
  return getSession(sessionId);
}

export async function addMessage(
  sessionId,
  { role, content, source = "web", topics = null, agentName = null },
) {
  const id = randomUUID();
  const message = {
    id,
    role,
    content,
    source,
    topics,
    agentName,
    createdAt: Date.now(),
  };

  if (!isFirebaseConfigured()) {
    const list = memoryMessages.get(sessionId) ?? [];
    list.push(message);
    memoryMessages.set(sessionId, list);
    const session = memorySessions.get(sessionId);
    if (session) {
      memorySessions.set(sessionId, { ...session, updatedAt: Date.now() });
    }
    return message;
  }

  await messagesRef(sessionId)
    .doc(id)
    .set({
      role,
      content,
      source,
      topics,
      ...(agentName ? { agentName } : {}),
      createdAt: FieldValue.serverTimestamp(),
    });
  await sessionRef(sessionId).update({
    updatedAt: FieldValue.serverTimestamp(),
  });

  return message;
}

export async function listMessages(sessionId, { limit = 50 } = {}) {
  if (!isFirebaseConfigured()) {
    const list = memoryMessages.get(sessionId) ?? [];
    return list.slice(-limit);
  }

  const snap = await messagesRef(sessionId)
    .orderBy("createdAt", "asc")
    .limitToLast(limit)
    .get();

  return snap.docs.map((doc) => normalizeMessage(doc.id, doc.data()));
}

export async function listSessionsForUser(
  uid,
  { status = "closed", limit = 20 } = {},
) {
  if (!isFirebaseConfigured()) {
    return [...memorySessions.values()]
      .filter((s) => s.uid === uid && (!status || s.status === status))
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit);
  }

  const snap = await db()
    .collection(COLLECTION)
    .where("uid", "==", uid)
    .limit(50)
    .get();

  return snap.docs
    .map((doc) => normalizeSession(doc.id, doc.data()))
    .filter((s) => !status || s.status === status)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit);
}

export async function findSessionByDiscordThread(
  threadId,
  { openOnly = true } = {},
) {
  if (!isFirebaseConfigured()) {
    for (const session of memorySessions.values()) {
      if (
        session.discordThreadId === threadId &&
        (!openOnly || session.status === "open")
      ) {
        return session;
      }
    }
    return null;
  }

  const snap = await db()
    .collection(COLLECTION)
    .where("discordThreadId", "==", threadId)
    .limit(1)
    .get();

  if (snap.empty) return null;
  const doc = snap.docs[0];
  const session = normalizeSession(doc.id, doc.data());
  return !openOnly || session.status === "open" ? session : null;
}
