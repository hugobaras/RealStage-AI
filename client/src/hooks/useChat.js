import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  createOrResumeChatSession,
  escalateChatSession,
  fetchChatHistory,
  fetchChatMessages,
  sendChatMessage,
} from "../api/chat.js";

export function useChat({ getIdToken, enabled = true }) {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [historySessions, setHistorySessions] = useState([]);
  const [viewingHistoryId, setViewingHistoryId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);
  const openRef = useRef(false);
  const liveSessionRef = useRef(null);

  useEffect(() => {
    openRef.current = open;
    if (open) setUnreadCount(0);
  }, [open]);

  const appendMessage = useCallback((message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      if (!openRef.current && message.role !== "user") {
        setUnreadCount((c) => c + 1);
      }
      return [...prev, message];
    });
  }, []);

  const clearUnread = useCallback(() => setUnreadCount(0), []);

  const connectSocket = useCallback(
    async (sessionId) => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      const token = await getIdToken();
      const socket = io({
        path: "/socket.io",
        auth: { token },
        transports: ["websocket", "polling"],
      });

      socket.on("connect", () => {
        socket.emit("join", { sessionId });
      });

      socket.on("message", ({ message }) => {
        appendMessage(message);
      });

      socket.on("session_escalated", ({ session: updated }) => {
        setSession(updated);
        liveSessionRef.current = updated;
      });

      socket.on("session_closed", ({ newSession, newMessages }) => {
        if (newSession) {
          setSession(newSession);
          liveSessionRef.current = newSession;
          setMessages(newMessages ?? []);
          setViewingHistoryId(null);
          setShowHistory(false);
          socket.emit("join", { sessionId: newSession.id });
        }
      });

      socketRef.current = socket;
    },
    [appendMessage, getIdToken],
  );

  const initSession = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getIdToken();
      const data = await createOrResumeChatSession(token);
      setSession(data.session);
      liveSessionRef.current = data.session;
      setMessages(data.messages ?? []);
      setViewingHistoryId(null);
      await connectSocket(data.session.id);
    } catch (err) {
      setError(err.message || "Impossible de démarrer le chat.");
    } finally {
      setLoading(false);
    }
  }, [connectSocket, enabled, getIdToken]);

  const loadHistory = useCallback(async () => {
    try {
      const token = await getIdToken();
      const data = await fetchChatHistory(token);
      setHistorySessions(data.sessions ?? []);
    } catch (err) {
      setError(err.message || "Impossible de charger l'historique.");
    }
  }, [getIdToken]);

  const openHistorySession = useCallback(
    async (sessionId) => {
      setLoading(true);
      setError(null);
      try {
        const token = await getIdToken();
        const data = await fetchChatMessages(token, sessionId);
        setSession(data.session);
        setMessages(data.messages ?? []);
        setViewingHistoryId(sessionId);
        setShowHistory(false);
      } catch (err) {
        setError(err.message || "Impossible de charger la conversation.");
      } finally {
        setLoading(false);
      }
    },
    [getIdToken],
  );

  const backToLiveChat = useCallback(async () => {
    if (!liveSessionRef.current) {
      await initSession();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = await getIdToken();
      const data = await fetchChatMessages(token, liveSessionRef.current.id);
      setSession(data.session);
      setMessages(data.messages ?? []);
      setViewingHistoryId(null);
      await connectSocket(data.session.id);
    } catch (err) {
      setError(err.message || "Impossible de reprendre le chat.");
    } finally {
      setLoading(false);
    }
  }, [connectSocket, getIdToken, initSession]);

  useEffect(() => {
    if (open && !session && enabled) {
      initSession();
    }
  }, [open, session, enabled, initSession]);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const sendMessage = useCallback(
    async (content) => {
      if (!session?.id || sending || viewingHistoryId) return;
      setSending(true);
      setError(null);
      try {
        const token = await getIdToken();
        const result = await sendChatMessage(token, session.id, content);
        if (result.userMessage) appendMessage(result.userMessage);
        if (result.assistantMessage) appendMessage(result.assistantMessage);
        if (result.session) {
          setSession(result.session);
          liveSessionRef.current = result.session;
        } else if (result.escalated) {
          setSession((prev) => (prev ? { ...prev, mode: "agent" } : prev));
        }
      } catch (err) {
        setError(err.message || "Envoi impossible.");
      } finally {
        setSending(false);
      }
    },
    [appendMessage, getIdToken, sending, session?.id, viewingHistoryId],
  );

  const escalate = useCallback(async () => {
    if (!session?.id || sending || viewingHistoryId) return;
    setSending(true);
    setError(null);
    try {
      const token = await getIdToken();
      const data = await escalateChatSession(token, session.id);
      setSession(data.session);
      liveSessionRef.current = data.session;
    } catch (err) {
      setError(err.message || "Escalade impossible.");
    } finally {
      setSending(false);
    }
  }, [getIdToken, sending, session?.id, viewingHistoryId]);

  const toggleHistory = useCallback(async () => {
    if (showHistory) {
      setShowHistory(false);
      return;
    }
    await loadHistory();
    setShowHistory(true);
  }, [loadHistory, showHistory]);

  return {
    open,
    setOpen,
    session,
    messages,
    historySessions,
    showHistory,
    viewingHistoryId,
    loading,
    sending,
    error,
    sendMessage,
    escalate,
    toggleHistory,
    openHistorySession,
    backToLiveChat,
    isAgentMode: session?.mode === "agent" && !viewingHistoryId,
    isClosed: session?.status === "closed" || Boolean(viewingHistoryId),
    isViewingHistory: Boolean(viewingHistoryId),
    unreadCount,
    clearUnread,
  };
}
