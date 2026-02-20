"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import {
  PipelineStage,
  PIPELINE_STAGE_LABELS,
  CompanyTag,
} from "@/types";

interface CustomerDetail {
  user: { id: string; name: string; phone: string | null; profileImage: string | null };
  stats: {
    totalMatchings: number;
    completedMatchings: number;
    totalRevenue: number;
    averageRating: number | null;
    firstInteractionAt: string | null;
  };
  memo: string | null;
  pipelineStage: PipelineStage;
  tags: string[];
  matchings: {
    id: string;
    status: string;
    cleaningType: string;
    address: string;
    estimatedPrice: number | null;
    completedAt: string | null;
    createdAt: string;
    review: { id: string; rating: number; content: string } | null;
    chatRoomId: string | null;
  }[];
  chatRooms: {
    id: string;
    lastMessage: string | null;
    lastSentAt: string | null;
    createdAt: string;
  }[];
}

interface CustomerDetailPanelProps {
  userId: string | null;
  onClose: () => void;
  companyTags: CompanyTag[];
  onStageChange: (userId: string, stage: PipelineStage) => void;
  onTagsChange: (userId: string, tags: string[]) => void;
}

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: "요청",
  ACCEPTED: "수락",
  REJECTED: "거절",
  CANCELLED: "취소",
  COMPLETED: "완료",
};

export default function CustomerDetailPanel({
  userId,
  onClose,
  companyTags,
  onStageChange,
  onTagsChange,
}: CustomerDetailPanelProps) {
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [memo, setMemo] = useState("");
  const memoTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!userId) {
      setDetail(null);
      return;
    }
    loadDetail(userId);
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDetail = async (uid: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/companies/my/customers/${uid}`);
      const data = res.data;
      setDetail(data);
      setMemo(data.memo || "");
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const saveMemo = useCallback(
    (value: string) => {
      if (!userId) return;
      if (memoTimeout.current) clearTimeout(memoTimeout.current);
      memoTimeout.current = setTimeout(async () => {
        try {
          await api.put(`/companies/my/customers/${userId}/memo`, {
            content: value,
          });
        } catch {
          // ignore
        }
      }, 800);
    },
    [userId],
  );

  const handleMemoChange = (value: string) => {
    setMemo(value);
    saveMemo(value);
  };

  const handleStageChange = async (stage: PipelineStage) => {
    if (!userId) return;
    try {
      await api.patch(`/companies/my/customers/${userId}/stage`, { stage });
      onStageChange(userId, stage);
      setDetail((d) => (d ? { ...d, pipelineStage: stage } : d));
    } catch {
      // ignore
    }
  };

  const handleToggleTag = async (tagName: string) => {
    if (!detail || !userId) return;
    const current = detail.tags;
    const newTags = current.includes(tagName)
      ? current.filter((t) => t !== tagName)
      : [...current, tagName];
    try {
      await api.patch(`/companies/my/customers/${userId}/tags`, {
        tags: newTags,
      });
      onTagsChange(userId, newTags);
      setDetail((d) => (d ? { ...d, tags: newTags } : d));
    } catch {
      // ignore
    }
  };

  if (!userId) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-black/10 lg:hidden"
        onClick={onClose}
      />
      <div className="fixed right-0 top-[60px] bottom-0 z-40 w-full max-w-[400px] overflow-y-auto border-l border-gray-200 bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
          <h3 className="text-[16px] font-semibold text-gray-900">
            고객 상세
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
          </div>
        ) : detail ? (
          <div className="p-5 space-y-6">
            {/* 프로필 */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-white overflow-hidden">
                {detail.user.profileImage ? (
                  <img
                    src={detail.user.profileImage}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-[16px] font-semibold">
                    {detail.user.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <p className="text-[16px] font-semibold text-gray-900">
                  {detail.user.name}
                </p>
                {detail.user.phone && (
                  <p className="text-[13px] text-gray-500">
                    {detail.user.phone}
                  </p>
                )}
              </div>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "총 매칭", value: detail.stats.totalMatchings },
                { label: "완료", value: detail.stats.completedMatchings },
                {
                  label: "매출",
                  value: `${detail.stats.totalRevenue.toLocaleString()}원`,
                },
                {
                  label: "평점",
                  value: detail.stats.averageRating
                    ? Number(detail.stats.averageRating).toFixed(1)
                    : "-",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg border border-gray-200 px-3 py-2.5 text-center"
                >
                  <p className="text-[18px] font-bold tabular-nums text-gray-900">
                    {s.value}
                  </p>
                  <p className="text-[11px] text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>

            {/* 파이프라인 단계 */}
            <div>
              <label className="text-[12px] font-medium text-gray-500">
                파이프라인 단계
              </label>
              <select
                value={detail.pipelineStage}
                onChange={(e) =>
                  handleStageChange(e.target.value as PipelineStage)
                }
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-[14px] text-gray-900 focus:border-gray-400 focus:outline-none"
              >
                {(
                  Object.keys(PIPELINE_STAGE_LABELS) as PipelineStage[]
                ).map((s) => (
                  <option key={s} value={s}>
                    {PIPELINE_STAGE_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            {/* 태그 */}
            <div>
              <label className="text-[12px] font-medium text-gray-500">
                태그
              </label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {companyTags.map((tag) => {
                  const isActive = detail.tags.includes(tag.name);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => handleToggleTag(tag.name)}
                      className={`rounded-md px-2 py-1 text-[12px] font-medium transition-all ${
                        isActive
                          ? "ring-1 ring-offset-1"
                          : "opacity-50 hover:opacity-80"
                      }`}
                      style={{
                        backgroundColor: `${tag.color}20`,
                        color: tag.color,
                        ...(isActive && { ringColor: tag.color }),
                      }}
                    >
                      {tag.name}
                    </button>
                  );
                })}
                {companyTags.length === 0 && (
                  <p className="text-[12px] text-gray-400">
                    태그가 없습니다. 태그를 먼저 추가하세요.
                  </p>
                )}
              </div>
            </div>

            {/* 메모 */}
            <div>
              <label className="text-[12px] font-medium text-gray-500">
                메모
              </label>
              <textarea
                value={memo}
                onChange={(e) => handleMemoChange(e.target.value)}
                placeholder="메모를 입력하세요"
                rows={3}
                className="mt-1 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-[13px] text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
              />
              <p className="mt-0.5 text-[11px] text-gray-400">
                자동 저장됩니다
              </p>
            </div>

            {/* 매칭 이력 */}
            {detail.matchings.length > 0 && (
              <div>
                <label className="text-[12px] font-medium text-gray-500">
                  매칭 이력
                </label>
                <div className="mt-2 space-y-2">
                  {detail.matchings.map((m) => (
                    <div
                      key={m.id}
                      className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-medium text-gray-700">
                          {m.cleaningType || "-"}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${
                            m.status === "COMPLETED"
                              ? "bg-green-50 text-green-700"
                              : m.status === "CANCELLED" ||
                                  m.status === "REJECTED"
                                ? "bg-red-50 text-red-600"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {STATUS_LABELS[m.status] || m.status}
                        </span>
                      </div>
                      <p className="mt-1 text-[12px] text-gray-500">
                        {m.address}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-gray-400">
                        <span>
                          {m.estimatedPrice
                            ? `${m.estimatedPrice.toLocaleString()}원`
                            : "-"}
                        </span>
                        <span>
                          {new Date(m.createdAt).toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                      {m.chatRoomId && (
                        <Link
                          href={`/chat/${m.chatRoomId}`}
                          className="mt-1.5 inline-block text-[12px] font-medium text-gray-600 underline underline-offset-2 hover:text-gray-900"
                        >
                          채팅방 바로가기
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 채팅방 */}
            {detail.chatRooms.length > 0 && (
              <div>
                <label className="text-[12px] font-medium text-gray-500">
                  채팅방
                </label>
                <div className="mt-2 space-y-1.5">
                  {detail.chatRooms.map((c) => (
                    <Link
                      key={c.id}
                      href={`/chat/${c.id}`}
                      className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2.5 transition-colors hover:bg-gray-50"
                    >
                      <span className="text-[13px] text-gray-700 truncate max-w-[200px]">
                        {c.lastMessage || "메시지 없음"}
                      </span>
                      <span className="shrink-0 text-[11px] text-gray-400">
                        {c.lastSentAt
                          ? new Date(c.lastSentAt).toLocaleDateString("ko-KR")
                          : new Date(c.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-20 text-center text-[14px] text-gray-400">
            고객 정보를 불러올 수 없습니다
          </div>
        )}
      </div>
    </>
  );
}
