import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Headphones,
  History,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useChat } from "../hooks/useChat";

const QUICK_PROMPTS = [
  "Quels sont les forfaits ?",
  "Comment fonctionne le mode Meubler ?",
  "Combien d'essais gratuits ?",
];

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseAgentMessage(msg) {
  if (msg.agentName) {
    return { label: msg.agentName, text: msg.content };
  }
  const legacy = msg.content?.match(/^\*\*([^*]+)\*\*\s*:\s*([\s\S]*)$/);
  if (legacy) {
    return { label: legacy[1], text: legacy[2] };
  }
  return { label: "Conseiller", text: msg.content };
}

function MessageBubble({ msg }) {
  if (msg.role === "system") {
    return (
      <div className="flex justify-center px-2 py-1">
        <p className="max-w-[90%] rounded-full border border-line/60 bg-deep/80 px-3 py-1.5 text-center text-[11px] leading-relaxed text-fg-muted">
          {msg.content}
        </p>
      </div>
    );
  }

  const isUser = msg.role === "user";
  const isAgent = msg.role === "agent";
  const parsed = isAgent ? parseAgentMessage(msg) : null;

  const Icon = isUser ? UserRound : isAgent ? Headphones : Bot;
  const label = isUser ? "Vous" : isAgent ? parsed.label : "Assistant IA";
  const body = isAgent ? parsed.text : msg.content;

  return (
    <div
      className={`flex gap-2.5 px-3 py-1.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          isUser
            ? "bg-accent/20 text-accent"
            : isAgent
              ? "bg-emerald-500/15 text-emerald-500"
              : "bg-surface text-fg-muted ring-1 ring-line/50"
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>

      <div
        className={`flex max-w-[82%] flex-col gap-0.5 ${isUser ? "items-end" : "items-start"}`}
      >
        <span className="px-1 text-[10px] font-medium tracking-wide text-fg-muted">
          {label}
        </span>
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
            isUser
              ? "rounded-br-md bg-accent text-white"
              : isAgent
                ? "rounded-bl-md border border-emerald-500/20 bg-emerald-500/10 text-fg"
                : "rounded-bl-md border border-line/60 bg-surface text-fg"
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{body}</p>
        </div>
        <span className="px-1 text-[10px] text-fg-muted/70">
          {formatTime(msg.createdAt)}
        </span>
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-2 px-4 py-3 text-sm text-fg-muted">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface ring-1 ring-line/50">
        <Bot className="h-3.5 w-3.5" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-line/60 bg-surface px-4 py-3">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-fg-muted [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-fg-muted [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-fg-muted [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function formatSessionDate(ts) {
  return new Date(ts).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatWidget() {
  const { getIdToken } = useAuth();
  const {
    open,
    setOpen,
    session,
    messages,
    historySessions,
    showHistory,
    loading,
    sending,
    error,
    sendMessage,
    escalate,
    toggleHistory,
    openHistorySession,
    backToLiveChat,
    isAgentMode,
    isClosed,
    isViewingHistory,
    unreadCount,
    clearUnread,
  } = useChat({ getIdToken });

  const [input, setInput] = useState("");
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) clearUnread();
  }, [open, clearUnread]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending, open]);

  useEffect(() => {
    if (open && !loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, loading, isAgentMode]);

  const handleSend = (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || sending || isClosed || isViewingHistory || !session) return;
    setInput("");
    sendMessage(trimmed);
  };

  const showQuickPrompts =
    !loading &&
    !isClosed &&
    !isViewingHistory &&
    !isAgentMode &&
    messages.length <= 2 &&
    !sending;

  const statusLabel = isViewingHistory
    ? "Historique — lecture seule"
    : isClosed
      ? "Conversation terminée"
      : isAgentMode
        ? "Conseiller humain"
        : "Assistant IA en ligne";

  return (
    <>
      <div className="chat-widget-root pointer-events-none fixed bottom-[calc(1rem+var(--layout-safe-bottom)+var(--layout-mobile-bar-offset))] right-4 z-40">
        {open && (
          <div
            className="pointer-events-auto mb-3 flex h-[min(560px,calc(100dvh-7rem))] w-[min(400px,calc(100vw-2rem))] animate-fade-up flex-col overflow-hidden rounded-2xl glass-panel"
            role="dialog"
            aria-label="Support RealStage AI"
          >
            {/* Header */}
            <div className="relative shrink-0 overflow-hidden border-b border-line/80">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-transparent to-accent-light/5" />
              <div className="relative flex items-center gap-3 px-4 py-3.5">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 ring-1 ring-accent/30">
                  {isAgentMode ? (
                    <Headphones className="h-5 w-5 text-accent" />
                  ) : (
                    <Sparkles className="h-5 w-5 text-accent" />
                  )}
                  {!isClosed && !isViewingHistory && (
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-panel ${
                        isAgentMode ? "bg-emerald-500" : "bg-emerald-400"
                      }`}
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-fg">
                    Support RealStage AI
                  </p>
                  <p className="truncate text-xs text-fg-muted">
                    {statusLabel}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={toggleHistory}
                    className={`rounded-lg p-2 transition ${
                      showHistory
                        ? "bg-accent/15 text-accent"
                        : "text-fg-muted hover:bg-elevated hover:text-fg"
                    }`}
                    aria-label="Historique des conversations"
                  >
                    <History className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg p-2 text-fg-muted transition hover:bg-elevated hover:text-fg"
                    aria-label="Réduire le chat"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {isViewingHistory && (
                <div className="relative border-t border-line/50 bg-deep/50 px-4 py-2">
                  <button
                    type="button"
                    onClick={backToLiveChat}
                    className="text-xs font-medium text-accent hover:underline"
                  >
                    ← Retour au chat actuel
                  </button>
                </div>
              )}

              {showHistory && !isViewingHistory && (
                <div className="relative max-h-40 overflow-y-auto border-t border-line/50 bg-deep/30 px-3 py-2">
                  <p className="mb-2 px-1 text-[11px] font-medium uppercase tracking-wide text-fg-muted">
                    Conversations précédentes
                  </p>
                  {historySessions.length === 0 ? (
                    <p className="px-1 py-2 text-xs text-fg-muted">
                      Aucun historique pour le moment.
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {historySessions.map((item) => (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => openHistorySession(item.id)}
                            className="w-full rounded-lg border border-line/50 bg-panel/80 px-3 py-2 text-left transition hover:border-accent/30 hover:bg-accent/5"
                          >
                            <span className="block text-xs font-medium text-fg">
                              {formatSessionDate(item.updatedAt)}
                            </span>
                            <span className="mt-0.5 block truncate text-[11px] text-fg-muted">
                              {item.preview ?? "Conversation clôturée"}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {isAgentMode && !isClosed && !isViewingHistory && (
              <div className="shrink-0 border-b border-emerald-500/20 bg-emerald-500/10 px-4 py-2">
                <p className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Un conseiller va vous répondre ici sous peu
                </p>
              </div>
            )}

            {!isAgentMode && !isClosed && !isViewingHistory && (
              <div className="shrink-0 border-b border-line/50 px-3 py-2">
                <button
                  type="button"
                  onClick={escalate}
                  disabled={sending || loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-line/80 bg-elevated/50 px-3 py-2 text-xs font-medium text-fg transition hover:border-accent/40 hover:bg-accent/10 hover:text-accent disabled:opacity-50"
                >
                  <Headphones className="h-3.5 w-3.5" />
                  Parler à un conseiller humain
                </button>
              </div>
            )}

            {error && (
              <div className="shrink-0 border-b border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs text-red-500 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Messages */}
            <div
              ref={listRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-panel/50 py-3"
            >
              {loading && messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                  <p className="text-sm text-fg-muted">
                    Connexion à l&apos;assistant…
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg} />
                  ))}
                  {sending && !isAgentMode && <LoadingDots />}
                </>
              )}

              {showQuickPrompts && (
                <div className="mt-2 px-3">
                  <p className="mb-2 px-1 text-[11px] font-medium uppercase tracking-wide text-fg-muted">
                    Questions fréquentes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => handleSend(prompt)}
                        disabled={sending}
                        className="rounded-full border border-line/70 bg-elevated/60 px-3 py-1.5 text-left text-xs text-fg transition hover:border-accent/40 hover:bg-accent/10 hover:text-accent disabled:opacity-50"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-line/80 bg-panel p-3">
              <form
                className="flex items-end gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
              >
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  disabled={loading || sending || isClosed || !session}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={
                    isViewingHistory
                      ? "Historique — lecture seule"
                      : isClosed
                        ? "Conversation terminée"
                        : isAgentMode
                          ? "Écrivez à votre conseiller…"
                          : "Posez votre question sur RealStage AI…"
                  }
                  className="max-h-24 min-h-[42px] flex-1 resize-none rounded-xl border border-line/80 bg-deep px-3.5 py-2.5 text-sm text-fg placeholder:text-fg-muted focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={
                    loading || sending || isClosed || !session || !input.trim()
                  }
                  className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-accent text-white shadow-md shadow-accent/25 transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Envoyer"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>
              <p className="mt-2 text-center text-[10px] text-fg-muted/80">
                Entrée pour envoyer · Maj+Entrée pour un saut de ligne
              </p>
            </div>
          </div>
        )}

        {/* FAB */}
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          {!open && (
            <span className="hidden rounded-full border border-line/60 bg-panel/95 px-3 py-1 text-xs font-medium text-fg shadow-lg backdrop-blur-sm lg:inline-block">
              Besoin d&apos;aide ?
            </span>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={`group relative flex items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-accent/30 transition hover:bg-accent-dark hover:shadow-accent/40 ${
              open ? "h-12 w-12" : "h-14 w-14 hover:scale-105"
            }`}
            aria-label={open ? "Fermer le chat" : "Ouvrir le chat support"}
          >
            {!open && unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-panel">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
            {!open && unreadCount === 0 && (
              <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-panel" />
            )}
            {open ? (
              <X className="h-5 w-5" />
            ) : (
              <MessageCircle className="h-6 w-6 transition group-hover:scale-110" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}
