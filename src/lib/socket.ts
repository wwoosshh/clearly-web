import { io, type Socket } from "socket.io-client";

/** NEXT_PUBLIC_API_URL에서 /api 접미사를 제거하여 소켓 서버 URL을 도출 */
function getSocketUrl(): string {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
  return apiUrl.replace(/\/api\/?$/, "");
}

const SOCKET_URL = getSocketUrl();

let socket: Socket | null = null;

/**
 * Socket.IO 클라이언트 연결을 생성/반환합니다.
 * 싱글톤 패턴으로 하나의 연결만 유지합니다.
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(`${SOCKET_URL}/chat`, {
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

/**
 * 소켓 연결을 시작합니다.
 */
export function connectSocket(): void {
  const s = getSocket();

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

/**
 * 소켓 연결을 종료합니다.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * 소켓 연결 상태를 반환합니다.
 */
export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}

export default getSocket;
