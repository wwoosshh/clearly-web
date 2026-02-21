"use client";

import type { ChatRoomDetail, User } from "@/types";
import { getRoomDisplayName } from "../_hooks/useChatState";

interface ChatHeaderProps {
  selectedRoom: ChatRoomDetail;
  user: User | null;
  onBack: () => void;
  onShowDeclineModal: () => void;
  onShowReportModal: () => void;
  onShowCompleteModal: () => void;
  onShowCompletionReportModal: () => void;
  onShowCompletionConfirmModal: () => void;
  isCompleting: boolean;
  isConfirmingCompletion: boolean;
}

export function ChatHeader({
  selectedRoom,
  user,
  onBack,
  onShowDeclineModal,
  onShowReportModal,
  onShowCompleteModal,
  onShowCompletionReportModal,
  onShowCompletionConfirmModal,
  isCompleting,
  isConfirmingCompletion,
}: ChatHeaderProps) {
  return (
    <div className="flex h-14 items-center justify-between border-b border-[#e2ddd6] bg-white px-5">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden text-[#72706a]"
          aria-label="채팅방 목록으로 돌아가기"
          onClick={onBack}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="text-[15px] font-semibold text-[#141412]">
          {getRoomDisplayName(selectedRoom, user)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onShowReportModal}
          className="rounded-lg border border-[#e2ddd6] px-3 py-1.5 text-[12px] font-medium text-red-500 transition-colors hover:bg-red-50 active:scale-95"
        >
          신고
        </button>
        {(() => {
          const bothDeclined = selectedRoom.userDeclined && selectedRoom.companyDeclined;
          const matching = selectedRoom.matching;
          const isCompleted = matching?.status === "COMPLETED";
          if (bothDeclined || isCompleted) return null;

          const isCompany = user?.role === "COMPANY";
          const hasReported = !!matching?.completionReportedAt;

          return (
            <>
              {/* 업체: 완료보고 버튼 */}
              {isCompany && !hasReported && matching?.status === "ACCEPTED" && (
                <button
                  onClick={onShowCompletionReportModal}
                  className="rounded-lg border border-[#2d6a4f] bg-[#2d6a4f] px-3 py-1.5 text-[12px] font-medium text-[#f5f3ee] transition-colors hover:bg-[#235840] active:scale-95"
                >
                  완료보고
                </button>
              )}
              {/* 업체: 보고 완료 상태 */}
              {isCompany && hasReported && (
                <span className="rounded-lg border border-[#d4ede4] bg-[#eef7f3] px-3 py-1.5 text-[12px] font-medium text-[#2d6a4f]">
                  보고 완료
                </span>
              )}
              {/* 사용자: 완료보고가 있으면 완료확인, 없으면 기존 거래완료 */}
              {!isCompany && hasReported && (
                <button
                  onClick={onShowCompletionConfirmModal}
                  disabled={isConfirmingCompletion}
                  className="rounded-lg border border-[#2d6a4f] bg-[#2d6a4f] px-3 py-1.5 text-[12px] font-medium text-[#f5f3ee] transition-colors hover:bg-[#235840] disabled:opacity-50 active:scale-95"
                >
                  완료 확인
                </button>
              )}
              {!isCompany && !hasReported && (
                <button
                  onClick={onShowCompleteModal}
                  disabled={isCompleting}
                  className="rounded-lg border border-[#2d6a4f] bg-[#2d6a4f] px-3 py-1.5 text-[12px] font-medium text-[#f5f3ee] transition-colors hover:bg-[#235840] disabled:opacity-50 active:scale-95"
                >
                  거래완료
                </button>
              )}
              {/* 거래안함 */}
              <button
                onClick={onShowDeclineModal}
                className="rounded-lg border border-[#e2ddd6] px-3 py-1.5 text-[12px] font-medium text-[#72706a] transition-colors hover:bg-[#f0ede8] active:scale-95"
              >
                거래안함
              </button>
            </>
          );
        })()}
      </div>
    </div>
  );
}
