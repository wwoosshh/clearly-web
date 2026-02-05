import { io, type Socket } from "socket.io-client";

function getSocketUrl(): string {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
  return apiUrl.replace(/\/api\/?$/, "");
}

const SOCKET_URL = getSocketUrl();

let socket: Socket | null = null;

export function getNotificationSocket(): Socket {
  if (!socket) {
    socket = io(`${SOCKET_URL}/notification`, {
      autoConnect: false,
      transports: ["polling", "websocket"],
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 10000,
    });
  }
  return socket;
}

export function connectNotificationSocket(): void {
  const s = getNotificationSocket();

  // 매번 연결 시 최신 토큰으로 auth 설정
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;
  s.auth = { token };

  if (!s.connected) {
    s.connect();
  }
}

export function disconnectNotificationSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function isNotificationSocketConnected(): boolean {
  return socket?.connected ?? false;
}
