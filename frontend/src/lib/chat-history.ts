/**
 * Quản lý lịch sử trò chuyện AI (Chat History) trong localStorage.
 * Cho phép lưu trữ, phân tách nhiều phiên hội thoại (sessions) và đồng bộ giữa các component.
 */

export interface StoredChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  citation?: string | null;
  negotiationScript?: string | null;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: StoredChatMessage[];
}

const STORAGE_KEY = "weeb_ai_chat_sessions";
const ACTIVE_SESSION_KEY = "weeb_ai_active_session_id";
export const CHAT_HISTORY_EVENT = "weeb_chat_history_updated";

function safeGetStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Lấy danh sách tất cả các phiên chat */
export function getChatSessions(): ChatSession[] {
  const storage = safeGetStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch {
    return [];
  }
}

/** Lưu danh sách các phiên chat */
function saveChatSessions(sessions: ChatSession[]): void {
  const storage = safeGetStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(CHAT_HISTORY_EVENT));
    }
  } catch (err) {
    console.error("Failed to save chat sessions to localStorage:", err);
  }
}

/** Lấy ID của phiên chat đang mở */
export function getActiveSessionId(): string | null {
  const storage = safeGetStorage();
  if (!storage) return null;
  try {
    return storage.getItem(ACTIVE_SESSION_KEY);
  } catch {
    return null;
  }
}

/** Đặt ID của phiên chat đang mở */
export function setActiveSessionId(sessionId: string): void {
  const storage = safeGetStorage();
  if (!storage) return;
  try {
    storage.setItem(ACTIVE_SESSION_KEY, sessionId);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(CHAT_HISTORY_EVENT));
    }
  } catch {}
}

/** Tạo tiêu đề ngắn gọn từ câu hỏi đầu tiên của người dùng */
function generateTitleFromText(text: string): string {
  const clean = text.trim().replace(/^(\s*hỏi|\s*xin chào|\s*cho mình hỏi|\s*cho em hỏi)\s*/i, "");
  if (!clean) return "Cuộc trò chuyện mới";
  return clean.length > 40 ? clean.slice(0, 38) + "..." : clean;
}

/** Tạo một phiên chat mới */
export function createNewSession(initialGreeting?: string): ChatSession {
  const now = new Date().toISOString();
  const timeFormatted = new Date().toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const newSession: ChatSession = {
    id: "session_" + Date.now().toString() + "_" + Math.random().toString(36).substring(2, 7),
    title: "Cuộc trò chuyện mới",
    createdAt: now,
    updatedAt: now,
    messages: initialGreeting
      ? [
          {
            id: "msg_init_" + Date.now(),
            sender: "ai",
            text: initialGreeting,
            timestamp: timeFormatted,
          },
        ]
      : [],
  };

  const sessions = getChatSessions();
  sessions.unshift(newSession);
  saveChatSessions(sessions);
  setActiveSessionId(newSession.id);
  return newSession;
}

/** Lấy phiên chat đang hoạt động hoặc khởi tạo nếu chưa có */
export function getOrCreateCurrentSession(defaultGreeting?: string): ChatSession {
  const sessions = getChatSessions();
  const activeId = getActiveSessionId();

  if (activeId) {
    const found = sessions.find((s) => s.id === activeId);
    if (found) return found;
  }

  if (sessions.length > 0) {
    setActiveSessionId(sessions[0].id);
    return sessions[0];
  }

  return createNewSession(defaultGreeting);
}

/** Thêm tin nhắn mới vào một phiên chat */
export function addMessageToSession(sessionId: string, message: StoredChatMessage): void {
  const sessions = getChatSessions();
  const idx = sessions.findIndex((s) => s.id === sessionId);

  if (idx === -1) {
    // Nếu session không tồn tại, tạo mới
    const newSession: ChatSession = {
      id: sessionId,
      title: message.sender === "user" ? generateTitleFromText(message.text) : "Tư vấn hợp đồng",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [message],
    };
    sessions.unshift(newSession);
    saveChatSessions(sessions);
    return;
  }

  const session = sessions[idx];
  session.messages.push(message);
  session.updatedAt = new Date().toISOString();

  // Tự động cập nhật tiêu đề nếu là câu hỏi đầu tiên của người dùng
  if (
    message.sender === "user" &&
    (session.title === "Cuộc trò chuyện mới" || !session.title)
  ) {
    session.title = generateTitleFromText(message.text);
  }

  // Đưa session được cập nhật lên đầu danh sách
  sessions.splice(idx, 1);
  sessions.unshift(session);

  saveChatSessions(sessions);
}

/** Xóa một phiên chat */
export function deleteSession(sessionId: string): void {
  const sessions = getChatSessions().filter((s) => s.id !== sessionId);
  saveChatSessions(sessions);

  const activeId = getActiveSessionId();
  if (activeId === sessionId) {
    if (sessions.length > 0) {
      setActiveSessionId(sessions[0].id);
    } else {
      const storage = safeGetStorage();
      storage?.removeItem(ACTIVE_SESSION_KEY);
    }
  }
}

/** Đổi tên tiêu đề một phiên chat */
export function renameSession(sessionId: string, newTitle: string): void {
  const clean = newTitle.trim();
  if (!clean) return;
  const sessions = getChatSessions();
  const target = sessions.find((s) => s.id === sessionId);
  if (target) {
    target.title = clean;
    target.updatedAt = new Date().toISOString();
    saveChatSessions(sessions);
  }
}

/** Xóa tất cả các phiên chat */
export function clearAllChatSessions(): void {
  const storage = safeGetStorage();
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEY);
    storage.removeItem(ACTIVE_SESSION_KEY);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(CHAT_HISTORY_EVENT));
    }
  } catch {}
}
