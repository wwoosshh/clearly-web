"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import type { ChatRoomDetail, User } from "@/types";
import { getRoomDisplayName } from "../../_hooks/useChatState";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRoom: ChatRoomDetail | null;
  user: User | null;
}

export function ReportModal({
  isOpen,
  onClose,
  selectedRoom,
  user,
}: ReportModalProps) {
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState("");

  const resetAndClose = () => {
    onClose();
    setReportReason("");
    setReportDescription("");
    setReportError("");
    setReportSuccess(false);
  };

  const handleReport = async () => {
    if (!selectedRoom || !reportReason || isReporting) return;
    setIsReporting(true);
    setReportError("");

    // 상대방 결정: 내가 USER면 COMPANY 신고, 내가 COMPANY면 USER 신고
    const isCompanyUser = user?.role === "COMPANY";
    const targetType = isCompanyUser ? "USER" : "COMPANY";
    const targetId = isCompanyUser ? selectedRoom.userId : selectedRoom.companyId;

    try {
      await api.post("/reports", {
        targetType,
        targetId,
        reason: reportReason,
        description: reportDescription || undefined,
      });
      setReportSuccess(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "신고 접수에 실패했습니다.";
      setReportError(msg);
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="상대방 신고"
      size="md"
    >
      {reportSuccess ? (
        <div className="text-center py-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef7f3]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="mt-3 text-[15px] font-medium text-[#141412]">신고가 접수되었습니다</p>
          <p className="mt-1 text-[13px] text-[#72706a]">관리자가 검토 후 조치하겠습니다.</p>
          <button
            onClick={resetAndClose}
            className="mt-5 flex h-[38px] w-full items-center justify-center rounded-lg bg-[#2d6a4f] text-[13px] font-medium text-[#f5f3ee] transition-colors hover:bg-[#235840] active:scale-95"
          >
            확인
          </button>
        </div>
      ) : (
        <div>
          <p className="text-[14px] text-[#72706a]">
            <span className="font-semibold text-[#141412]">{selectedRoom ? getRoomDisplayName(selectedRoom, user) : ""}</span>
            님을 신고합니다.
          </p>

          {reportError && (
            <div className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-600">
              {reportError}
            </div>
          )}

          <div className="mt-4">
            <label className="text-[13px] font-medium text-[#1a1918] mb-2 block">
              신고 사유 <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col gap-2">
              {[
                { value: "FRAUD", label: "사기 / 허위 정보" },
                { value: "INAPPROPRIATE", label: "부적절한 언행" },
                { value: "NO_SHOW", label: "연락 두절 / 노쇼" },
                { value: "POOR_QUALITY", label: "서비스 품질 불량" },
                { value: "OTHER", label: "기타" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setReportReason(opt.value)}
                  className={cn(
                    "flex items-center rounded-lg border px-4 py-3 text-[14px] text-left transition-colors active:scale-[0.98]",
                    reportReason === opt.value
                      ? "border-[#2d6a4f] bg-[#eef7f3] font-medium text-[#141412]"
                      : "border-[#e2ddd6] text-[#72706a] hover:bg-[#f5f3ee]"
                  )}
                >
                  <span className={cn(
                    "mr-3 flex h-5 w-5 items-center justify-center rounded-full border-2",
                    reportReason === opt.value
                      ? "border-[#2d6a4f] bg-[#2d6a4f]"
                      : "border-[#e2ddd6]"
                  )}>
                    {reportReason === opt.value && (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="text-[13px] font-medium text-[#1a1918] mb-1.5 block">
              상세 설명 (선택)
            </label>
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="구체적인 상황을 설명해주세요"
              rows={3}
              className="w-full rounded-lg border border-[#e2ddd6] px-3.5 py-3 text-[14px] resize-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10 focus:outline-none"
            />
          </div>

          <div className="mt-5 flex gap-2">
            <button
              onClick={resetAndClose}
              className="flex h-[38px] flex-1 items-center justify-center rounded-lg border border-[#e2ddd6] text-[13px] font-medium text-[#1a1918] transition-colors hover:bg-[#f0ede8] active:scale-95"
            >
              취소
            </button>
            <button
              onClick={handleReport}
              disabled={!reportReason || isReporting}
              className="flex h-[38px] flex-1 items-center justify-center rounded-lg bg-red-600 text-[13px] font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 active:scale-95"
            >
              {isReporting ? "접수중..." : "신고 접수"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
