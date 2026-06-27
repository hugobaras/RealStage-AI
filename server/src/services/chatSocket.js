import { verifyIdToken, isFirebaseConfigured } from "./firebaseAdmin.js";
import { assertSessionOwner } from "./chatSessionStore.js";

export function initChatSocket(io) {
  io.use(async (socket, next) => {
    if (!isFirebaseConfigured()) {
      socket.user = { uid: "dev-user", email: "dev@local" };
      return next();
    }

    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentification requise."));
    }

    try {
      const decoded = await verifyIdToken(token);
      socket.user = {
        uid: decoded.uid,
        email: decoded.email ?? null,
      };
      return next();
    } catch {
      return next(new Error("Session invalide."));
    }
  });

  io.on("connection", (socket) => {
    socket.on("join", async ({ sessionId }) => {
      if (!sessionId) return;
      try {
        await assertSessionOwner(sessionId, socket.user.uid);
        socket.join(`chat:${sessionId}`);
        socket.emit("joined", { sessionId });
      } catch {
        socket.emit("error", {
          message: "Impossible de rejoindre la session.",
        });
      }
    });

    socket.on("typing", async ({ sessionId }) => {
      if (!sessionId) return;
      try {
        await assertSessionOwner(sessionId, socket.user.uid);
        socket.to(`chat:${sessionId}`).emit("typing", { sessionId });
      } catch {
        // ignore
      }
    });
  });
}
