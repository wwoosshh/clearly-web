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
      withCredentials: true, // httpOnly 쿠키(accessToken) 자동 전송
    });
  }
  return socket;
}

export function connectNotificationSocket(): void {
  const s = getNotificationSocket();

  // 쿠키 기반 인증: auth.token은 사용하지 않음
  // 서버는 handshake 쿠키(accessToken)에서 토큰을 읽음
  s.auth = {};

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
