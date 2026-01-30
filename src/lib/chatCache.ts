import type { ChatRoomDetail, ChatMessageDetail } from "@/types";

const ROOMS_KEY = "chat_rooms";
const MSGS_PREFIX = "chat_msgs_";
const MAX_CACHED_MESSAGES = 200;

function safeGet<T>(key: string): T | null {
  try {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem(key) : null;
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: unknown) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // quota exceeded - 무시
  }
}

export const chatCache = {
  getRooms(): ChatRoomDetail[] | null {
    return safeGet<ChatRoomDetail[]>(ROOMS_KEY);
  },

  setRooms(rooms: ChatRoomDetail[]) {
    safeSet(ROOMS_KEY, rooms);
  },

  getMessages(roomId: string): ChatMessageDetail[] | null {
    return safeGet<ChatMessageDetail[]>(MSGS_PREFIX + roomId);
  },

  setMessages(roomId: string, messages: ChatMessageDetail[]) {
    const toCache = messages.slice(-MAX_CACHED_MESSAGES);
    safeSet(MSGS_PREFIX + roomId, toCache);
  },

  appendMessage(roomId: string, message: ChatMessageDetail) {
    const messages = this.getMessages(roomId) || [];
    if (!messages.some((m) => m.id === message.id)) {
      messages.push(message);
    }
    this.setMessages(roomId, messages);
  },

  /** temp- 접두사 메시지를 실제 메시지로 교체 */
  replaceTempMessage(
    roomId: string,
    senderId: string,
    content: string,
    real: ChatMessageDetail,
  ) {
    const messages = this.getMessages(roomId) || [];
    const idx = messages.findIndex(
      (m) =>
        m.id.startsWith("temp-") &&
        m.senderId === senderId &&
        m.content === content,
    );
    if (idx !== -1) {
      messages[idx] = real;
    } else if (!messages.some((m) => m.id === real.id)) {
      messages.push(real);
    }
    this.setMessages(roomId, messages);
  },

  updateRoom(roomId: string, patch: Partial<ChatRoomDetail>) {
    const rooms = this.getRooms();
    if (!rooms) return;
    const updated = rooms.map((r) =>
      r.id === roomId ? { ...r, ...patch } : r,
    );
    this.setRooms(updated);
  },
};
