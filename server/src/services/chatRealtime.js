let ioInstance = null;

export function setChatIo(io) {
  ioInstance = io;
}

export function getChatIo() {
  return ioInstance;
}

export function emitChatEvent(sessionId, event, payload) {
  if (!ioInstance) return;
  ioInstance.to(`chat:${sessionId}`).emit(event, payload);
}
