import { io, type Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

let socket: Socket | null = null;

/**
 * Socket.IO 클라이언트 연결을 생성/반환합니다.
 * 싱글톤 패턴으로 하나의 연결만 유지합니다.
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(`${SOCKET_URL}/chat`, {
      autoConnect: false,
      transports: ["websocket", "polling"],
      auth: () => {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null;
        return { token };
      },
    });
  }
  return socket;
}

/**
 * 소켓 연결을 시작합니다.
 */
export function connectSocket(): void {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
}

/**
 * 소켓 연결을 종료합니다.
 */
export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}

/**
 * 소켓 연결 상태를 반환합니다.
 */
export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}

export default getSocket;
