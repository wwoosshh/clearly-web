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
      auth: () => {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null;
        return { token };
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function connectNotificationSocket(): void {
  const s = getNotificationSocket();
  if (!s.connected) {
    s.connect();
  }
}

export function disconnectNotificationSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}

export function isNotificationSocketConnected(): boolean {
  return socket?.connected ?? false;
}
