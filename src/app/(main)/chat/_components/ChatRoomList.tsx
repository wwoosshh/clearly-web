"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ChatRoomDetail, User } from "@/types";
import { getRoomDisplayName, getRoomAvatar, getRoomProfileImage, formatTime } from "../_hooks/useChatState";

interface ChatRoomListProps {
  rooms: ChatRoomDetail[];
  selectedRoom: ChatRoomDetail | null;
  showMobileChat: boolean;
  user: User | null;
  onSelectRoom: (room: ChatRoomDetail) => void;
}

export function ChatRoomList({
  rooms,
  selectedRoom,
  showMobileChat,
  user,
  onSelectRoom,
}: ChatRoomListProps) {
  return (
    <div
      className={cn(
        "w-full border-r border-[#e2ddd6] bg-white md:w-80 md:flex-shrink-0",
        showMobileChat ? "hidden md:block" : "block"
      )}
    >
      <div className="flex h-14 items-center border-b border-[#e2ddd6] px-5">
        <h2 className="text-[16px] font-bold text-[#141412]">채팅</h2>
      </div>

      {rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f0ede8]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#72706a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="mt-3 text-[14px] text-[#72706a]">채팅 내역이 없습니다</p>
          <p className="mt-1 text-[13px] text-[#a8a49c]">업체에 채팅 상담을 시작해보세요</p>
        </div>
      ) : (
        <div className="overflow-y-auto">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => onSelectRoom(room)}
              aria-label={`${getRoomDisplayName(room, user)} 채팅방 열기`}
              className={cn(
                "flex w-full items-center gap-3 border-b border-[#e2ddd6]/50 px-5 py-4 text-left transition-colors",
                selectedRoom?.id === room.id ? "bg-[#f0ede8]" : "hover:bg-[#f5f3ee]"
              )}
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#141412] text-[#f5f3ee] overflow-hidden">
                {getRoomProfileImage(room, user) ? (
                  <Image src={getRoomProfileImage(room, user)!} alt="" width={40} height={40} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[14px] font-semibold">{getRoomAvatar(room, user)}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-semibold text-[#141412] truncate">
                    {getRoomDisplayName(room, user)}
                  </span>
                  <span className="flex-shrink-0 text-[12px] text-[#a8a49c]">
                    {formatTime(room.lastSentAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-[13px] text-[#72706a] truncate">
                    {room.lastMessage || "대화를 시작해보세요"}
                  </p>
                  {room.unreadCount > 0 && (
                    <span className="ml-2 flex h-5 min-w-[20px] flex-shrink-0 items-center justify-center rounded-full bg-[#2d6a4f] px-1.5 text-[11px] font-bold text-[#f5f3ee]">
                      {room.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
