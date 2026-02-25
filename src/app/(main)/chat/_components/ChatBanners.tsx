"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { ChatRoomDetail, User } from "@/types";

interface ChatBannersProps {
  selectedRoom: ChatRoomDetail;
  user: User | null;
  onConfirmCompletion: () => void;
  isConfirmingCompletion: boolean;
  isRefreshing: boolean;
  router: AppRouterInstance;
}

export function ChatBanners({
  selectedRoom,
  user,
  onConfirmCompletion,
  isConfirmingCompletion,
  isRefreshing,
  router,
}: ChatBannersProps) {
  return (
    <>
      {/* 동기화 중 스켈레톤 배너 (로딩 중 상태임을 명시) */}
      {isRefreshing && (
        <div className="flex items-center gap-2 border-b border-[#e2ddd6] bg-[#f5f3ee] px-5 py-2.5">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0284C7]" />
          <p className="text-[12px] text-[#a8a49c]">최신 정보를 불러오는 중...</p>
        </div>
      )}

      {/* 완료보고 배너 (사용자에게 표시 - 아직 완료 확인 전) */}
      {user?.role !== "COMPANY" &&
        selectedRoom.matching?.completionReportedAt &&
        !selectedRoom.matching?.completedAt && (
        <div className="flex items-center justify-between border-b border-[#BAE6FD] bg-[#E0F2FE] px-5 py-3">
          <p className="text-[13px] text-[#0284C7]">
            업체가 서비스 완료를 보고했습니다. 확인해주세요.
          </p>
          <button
            onClick={onConfirmCompletion}
            disabled={isConfirmingCompletion || isRefreshing}
            className="ml-3 flex-shrink-0 rounded-lg bg-[#0284C7] px-3 py-1.5 text-[12px] font-medium text-[#f5f3ee] transition-colors hover:bg-[#0369A1] disabled:opacity-50 active:scale-95"
          >
            완료 확인
          </button>
        </div>
      )}

      {/* 리뷰 작성 배너 (거래 완료 + 리뷰 미작성 시 사용자에게 표시) */}
      {user?.role !== "COMPANY" &&
        selectedRoom.matching?.status === "COMPLETED" &&
        !selectedRoom.matching?.review && (
        <div className="flex items-center justify-between border-b border-[#BAE6FD] bg-[#E0F2FE] px-5 py-3">
          <p className="text-[13px] text-[#0284C7]">
            거래가 완료되었습니다. 리뷰를 작성해주세요.
          </p>
          <button
            onClick={() => router.push(`/review/write?matchingId=${selectedRoom.matching!.id}&company=${selectedRoom.companyId}`)}
            className="ml-3 flex-shrink-0 rounded-lg bg-[#0284C7] px-3 py-1.5 text-[12px] font-medium text-[#f5f3ee] transition-colors hover:bg-[#0369A1] active:scale-95"
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
