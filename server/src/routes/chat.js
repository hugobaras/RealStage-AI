import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { createRateLimiter } from "../middleware/rateLimit.js";
import {
  escalateToAgent,
  ensureWelcomeMessage,
  getChatHistory,
  getOrCreateSession,
  getSessionWithMessages,
  handleUserMessage,
} from "../services/chatService.js";

const router = Router();

const chatRateLimit = createRateLimiter({
  windowMs: 5 * 60_000,
  max: 30,
  keyFn: (req) => req.user?.uid ?? req.ip,
});

router.post("/chat/sessions", requireAuth, async (req, res, next) => {
  try {
    const session = await getOrCreateSession(req.user);
    await ensureWelcomeMessage(session.id);
    const { messages } = await getSessionWithMessages(session.id, req.user.uid);
    res.json({ session, messages });
  } catch (err) {
    next(err);
  }
});

router.get("/chat/sessions/history", requireAuth, async (req, res, next) => {
  try {
    const sessions = await getChatHistory(req.user.uid);
    res.json({ sessions });
  } catch (err) {
    next(err);
  }
});

router.get(
  "/chat/sessions/:id/messages",
  requireAuth,
  async (req, res, next) => {
    try {
      const { session, messages } = await getSessionWithMessages(
        req.params.id,
        req.user.uid,
      );
      res.json({ session, messages });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/chat/sessions/:id/messages",
  requireAuth,
  chatRateLimit,
  async (req, res, next) => {
    try {
      const result = await handleUserMessage(
        req.params.id,
        req.user.uid,
        req.body?.content,
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/chat/sessions/:id/escalate",
  requireAuth,
  async (req, res, next) => {
    try {
      const session = await escalateToAgent(req.params.id, req.user.uid);
      res.json({ session });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
