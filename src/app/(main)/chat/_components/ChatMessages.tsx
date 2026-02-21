"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";
import type { ChatMessageDetail } from "@/types";
import { isTempId } from "../_hooks/useChatState";

interface ChatMessagesProps {
  chatScrollRef: React.RefObject<HTMLDivElement | null>;
  isLoadingMessages: boolean;
  messages: ChatMessageDetail[];
  user: { id: string } | null;
  setLightboxImages: (imgs: string[]) => void;
  setLightboxIndex: (idx: number) => void;
}

/** 가상 스크롤이 적용된 채팅 메시지 영역 */
export function ChatMessages({
  chatScrollRef,
  isLoadingMessages,
  messages,
  user,
  setLightboxImages,
  setLightboxIndex,
}: ChatMessagesProps) {
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => chatScrollRef.current,
    estimateSize: () => 72,
    overscan: 10,
  });

  // 새 메시지 도착 시 맨 아래로 스크롤
  useEffect(() => {
    if (messages.length > 0) {
      virtualizer.scrollToIndex(messages.length - 1, { align: "end" });
    }
  }, [messages.length, virtualizer]);

  return (
    <div ref={chatScrollRef} className="flex-1 overflow-y-auto px-5 py-4">
      {isLoadingMessages && messages.length === 0 && (
        <div className="space-y-4 animate-pulse">
          <div className="flex gap-2 justify-start">
            <div className="h-8 w-8 rounded-full bg-[#e2ddd6] flex-shrink-0 mt-5" />
            <div>
              <div className="h-3 w-12 bg-[#e2ddd6] rounded mb-2" />
              <div className="h-10 w-48 bg-[#e2ddd6] rounded-2xl rounded-bl-md" />
            </div>
          </div>
          <div className="flex justify-end">
            <div className="h-10 w-40 bg-[#d4ede4] rounded-2xl rounded-br-md" />
          </div>
          <div className="flex gap-2 justify-start">
            <div className="h-8 w-8 rounded-full bg-[#e2ddd6] flex-shrink-0 mt-5" />
            <div>
              <div className="h-3 w-12 bg-[#e2ddd6] rounded mb-2" />
              <div className="h-10 w-56 bg-[#e2ddd6] rounded-2xl rounded-bl-md" />
            </div>
          </div>
        </div>
      )}
      {messages.length > 0 && (
        <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const msg = messages[virtualRow.index];
            const isMe = msg.senderId === user?.id;
            const isSystem = msg.messageType === "SYSTEM";
            const isTemp = isTempId(msg.id);

            return (
              <div
                key={msg.id}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {isSystem ? (
                  <div className="flex justify-center my-3">
                    <span className="rounded-full bg-[#e2ddd6] px-3 py-1 text-[12px] text-[#72706a]">
                      {msg.content}
                    </span>
                  </div>
                ) : (
                  <div className={cn("mb-3 flex gap-2", isMe ? "justify-end" : "justify-start")}>
                    {!isMe && msg.sender && (
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#e2ddd6] text-[#72706a] overflow-hidden mt-5">
                        {msg.sender.profileImage ? (
                          <Image src={msg.sender.profileImage} alt="" width={32} height={32} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[12px] font-semibold">{msg.sender.name.charAt(0)}</span>
                        )}
                      </div>
                    )}
                    <div className={cn("max-w-[70%]", isMe ? "items-end" : "items-start")}>
                      {!isMe && msg.sender && (
                        <p className="mb-1 text-[12px] text-[#72706a]">{msg.sender.name}</p>
                      )}
                      {msg.messageType === "IMAGE" && msg.fileUrl ? (
                        <Image
                          src={msg.fileUrl}
                          alt="전송된 이미지"
                          width={200}
                          height={200}
                          className={cn(
                            "max-w-[200px] max-h-[200px] rounded-xl object-cover cursor-pointer border border-[#e2ddd6] transition-opacity",
                            isTemp && "opacity-60"
                          )}
                          onClick={() => {
                            setLightboxImages([msg.fileUrl!]);
                            setLightboxIndex(0);
                          }}
                        />
                      ) : (
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-2.5 text-[14px] transition-opacity",
                            isMe
                              ? "bg-[#2d6a4f] text-[#f5f3ee] rounded-br-md"
                              : "bg-white text-[#1a1918] border border-[#e2ddd6] rounded-bl-md",
                            isTemp && "opacity-60"
                          )}
                        >
                          {msg.content}
                        </div>
                      )}
                      <div className={cn("flex items-center gap-1 mt-1", isMe ? "flex-row-reverse" : "flex-row")}>
                        {isMe && !isTemp && !msg.isRead && (
                          <span className="text-[11px] font-semibold text-[#4a8c6a]">1</span>
                        )}
                        <span className="text-[11px] text-[#a8a49c]">
                          {isTemp
                            ? "전송중..."
                            : new Date(msg.createdAt).toLocaleTimeString("ko-KR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
