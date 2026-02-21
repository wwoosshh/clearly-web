"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { ChatRoomDetail, User } from "@/types";

interface ChatBannersProps {
  selectedRoom: ChatRoomDetail;
  user: User | null;
  onConfirmCompletion: () => void;
  isConfirmingCompletion: boolean;
  router: AppRouterInstance;
}

export function ChatBanners({
  selectedRoom,
  user,
  onConfirmCompletion,
  isConfirmingCompletion,
  router,
}: ChatBannersProps) {
  return (
    <>
      {/* 완료보고 배너 (사용자에게 표시 - 아직 완료 확인 전) */}
      {user?.role !== "COMPANY" &&
        selectedRoom.matching?.completionReportedAt &&
        !selectedRoom.matching?.completedAt && (
        <div className="flex items-center justify-between border-b border-[#d4ede4] bg-[#eef7f3] px-5 py-3">
          <p className="text-[13px] text-[#2d6a4f]">
            업체가 서비스 완료를 보고했습니다. 확인해주세요.
          </p>
          <button
            onClick={onConfirmCompletion}
            disabled={isConfirmingCompletion}
            className="ml-3 flex-shrink-0 rounded-lg bg-[#2d6a4f] px-3 py-1.5 text-[12px] font-medium text-[#f5f3ee] transition-colors hover:bg-[#235840] disabled:opacity-50 active:scale-95"
          >
            완료 확인
          </button>
        </div>
      )}

      {/* 리뷰 작성 배너 (거래 완료 + 리뷰 미작성 시 사용자에게 표시) */}
      {user?.role !== "COMPANY" &&
        selectedRoom.matching?.status === "COMPLETED" &&
        !selectedRoom.matching?.review && (
        <div className="flex items-center justify-between border-b border-[#d4ede4] bg-[#eef7f3] px-5 py-3">
          <p className="text-[13px] text-[#2d6a4f]">
            거래가 완료되었습니다. 리뷰를 작성해주세요.
          </p>
          <button
            onClick={() => router.push(`/review/write?matchingId=${selectedRoom.matching!.id}&companyId=${selectedRoom.companyId}`)}
            className="ml-3 flex-shrink-0 rounded-lg bg-[#2d6a4f] px-3 py-1.5 text-[12px] font-medium text-[#f5f3ee] transition-colors hover:bg-[#235840] active:scale-95"
          >
            리뷰 작성
          </button>
        </div>
      )}

      {/* 거래 완료 상태 배너 (리뷰 작성 완료 시) */}
      {selectedRoom.matching?.status === "COMPLETED" &&
        selectedRoom.matching?.review && (
        <div className="border-b border-[#e2ddd6] bg-[#f0ede8] px-5 py-3">
          <p className="text-center text-[13px] text-[#72706a]">
            거래가 완료되었습니다.
          </p>
        </div>
      )}
    </>
  );
}
