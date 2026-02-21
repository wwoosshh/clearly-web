"use client";

import type { ChatRoomDetail } from "@/types";

interface ChatInputAreaProps {
  selectedRoom: ChatRoomDetail;
  newMessage: string;
  setNewMessage: (value: string) => void;
  onSend: () => void;
  onImageSend: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSending: boolean;
  isUploadingImage: boolean;
  imageInputRef: React.RefObject<HTMLInputElement | null>;
}

export function ChatInputArea({
  selectedRoom,
  newMessage,
  setNewMessage,
  onSend,
  onImageSend,
  isSending,
  isUploadingImage,
  imageInputRef,
}: ChatInputAreaProps) {
  if (selectedRoom.userDeclined && selectedRoom.companyDeclined) {
    return (
      <div className="border-t border-[#e2ddd6] bg-[#f0ede8] px-5 py-4">
        <p className="text-center text-[13px] text-[#a8a49c]">
          양쪽 모두 거래를 취소하여 대화가 종료되었습니다.
        </p>
      </div>
    );
  }

  if (selectedRoom.matching?.status === "COMPLETED") {
    return (
      <div className="border-t border-[#e2ddd6] bg-[#f0ede8] px-5 py-4">
        <p className="text-center text-[13px] text-[#a8a49c]">
          거래가 완료되어 대화가 종료되었습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="border-t border-[#e2ddd6] bg-white p-4">
      {isUploadingImage && (
        <div className="mb-2 text-center text-[12px] text-[#72706a]">이미지 업로드 중...</div>
      )}
      <div className="flex gap-2">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onImageSend}
        />
        <button
          onClick={() => imageInputRef.current?.click()}
          disabled={isUploadingImage}
          className="flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-lg border border-[#e2ddd6] text-[#72706a] transition-colors hover:bg-[#f0ede8] disabled:opacity-50 active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="메시지를 입력하세요"
          className="h-[44px] flex-1 rounded-lg border border-[#e2ddd6] px-4 text-[14px] placeholder:text-[#a8a49c] focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10 focus:outline-none"
        />
        <button
          onClick={onSend}
          disabled={!newMessage.trim() || isSending}
          className="flex h-[44px] w-[44px] items-center justify-center rounded-lg bg-[#2d6a4f] text-[#f5f3ee] transition-colors hover:bg-[#235840] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
