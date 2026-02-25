"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import {
  PipelineStage,
  PIPELINE_STAGE_LABELS,
  CompanyTag,
} from "@/types";

interface CustomerDetail {
  user: {
    id: string;
    name: string;
    phone: string | null;
    profileImage: string | null;
  };
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

const STAGES: PipelineStage[] = ["LEAD", "CONSULTING", "BOOKED", "COMPLETED", "VIP"];

const STAGE_CONFIG: Record<PipelineStage, { accent: string; bg: string }> = {
  LEAD:       { accent: "#a8a49c", bg: "#a8a49c15" },
  CONSULTING: { accent: "#0EA5E9", bg: "#0EA5E915" },
  BOOKED:     { accent: "#0284C7", bg: "#0284C715" },
  COMPLETED:  { accent: "#141412", bg: "#14141215" },
  VIP:        { accent: "#d97706", bg: "#d9770615" },
};

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: "요청",
  ACCEPTED:  "수락",
  REJECTED:  "거절",
  CANCELLED: "취소",
  COMPLETED: "완료",
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  COMPLETED: { bg: "#BAE6FD",  color: "#0284C7" },
  REJECTED:  { bg: "#fee2e2",  color: "#dc2626" },
  CANCELLED: { bg: "#fee2e2",  color: "#dc2626" },
  REQUESTED: { bg: "#f0ede8",  color: "#72706a" },
  ACCEPTED:  { bg: "#dbeafe",  color: "#1d4ed8" },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.32,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
};

export default function CustomerDetailPanel({
  userId,
  onClose,
  companyTags,
  onStageChange,
  onTagsChange,
}: CustomerDetailPanelProps) {
  const [detail, setDetail]   = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [memo, setMemo]       = useState("");
  const [memoSaved, setMemoSaved] = useState(false);
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
      const data = res.data.data;
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
          await api.put(`/companies/my/customers/${userId}/memo`, { content: value });
          setMemoSaved(true);
          setTimeout(() => setMemoSaved(false), 1500);
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
      await api.patch(`/companies/my/customers/${userId}/tags`, { tags: newTags });
      onTagsChange(userId, newTags);
      setDetail((d) => (d ? { ...d, tags: newTags } : d));
    } catch {
      // ignore
    }
  };

  return (
    <AnimatePresence>
      {userId && (
        <>
          {/* 모바일 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-[#141412]/30 backdrop-blur-[2px] lg:hidden"
            onClick={onClose}
          />

          {/* 패널 */}
          <motion.div
            initial={{ x: "100%", opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32, mass: 0.9 }}
            className="fixed right-0 top-[60px] bottom-0 z-40 w-full max-w-[400px] overflow-y-auto bg-[#f5f3ee] shadow-2xl border-l border-[#e2ddd6]"
          >
            {/* 헤더 */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e2ddd6] bg-[#f5f3ee]/90 px-5 py-3.5 backdrop-blur-sm">
              <h3 className="text-[15px] font-bold text-[#141412]">고객 상세</h3>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#72706a] transition-colors hover:bg-[#e2ddd6]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-24">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#e2ddd6] border-t-[#0284C7]" />
                <span className="text-[13px] text-[#a8a49c]">불러오는 중</span>
              </div>
            ) : detail ? (
              <div className="p-5 space-y-5">

                {/* 프로필 */}
                <motion.div
                  custom={0}
                  variants={sectionVariants}
                  initial="hidden"
                  animate="show"
                  className="flex items-center gap-3.5 rounded-2xl border border-[#e2ddd6] bg-white px-4 py-3.5"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#141412] text-white overflow-hidden">
                    {detail.user.profileImage ? (
                      <Image
                        src={detail.user.profileImage}
                        alt=""
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-[17px] font-bold">
                        {detail.user.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[16px] font-bold text-[#141412] truncate">
                      {detail.user.name}
                    </p>
                    {detail.user.phone && (
                      <p className="mt-0.5 text-[12px] tabular-nums text-[#72706a]">
                        {detail.user.phone}
                      </p>
                    )}
                    {detail.stats.firstInteractionAt && (
                      <p className="mt-0.5 text-[11px] text-[#a8a49c]">
                        첫 거래{" "}
                        {new Date(detail.stats.firstInteractionAt).toLocaleDateString("ko-KR")}
                      </p>
                    )}
                  </div>
                </motion.div>

                {/* 통계 */}
                <motion.div
                  custom={1}
                  variants={sectionVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-2 gap-2.5"
                >
                  {[
                    { label: "총 매칭",    value: detail.stats.totalMatchings,     suffix: "건" },
                    { label: "완료",       value: detail.stats.completedMatchings, suffix: "건" },
                    {
                      label: "매출",
                      value: detail.stats.totalRevenue >= 10000
                        ? `${Math.floor(detail.stats.totalRevenue / 10000)}만`
                        : detail.stats.totalRevenue.toLocaleString(),
                      suffix: "원",
                    },
                    {
                      label: "평점",
                      value: detail.stats.averageRating
                        ? Number(detail.stats.averageRating).toFixed(1)
                        : "-",
                      suffix: detail.stats.averageRating ? "점" : "",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl border border-[#e2ddd6] bg-white px-3.5 py-2.5 text-center"
                    >
                      <div className="flex items-baseline justify-center gap-0.5">
                        <p className="text-[20px] font-bold tabular-nums text-[#141412]">
                          {s.value}
                        </p>
                        {s.suffix && (
                          <span className="text-[11px] font-medium text-[#a8a49c]">{s.suffix}</span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] text-[#a8a49c]">{s.label}</p>
                    </div>
                  ))}
                </motion.div>

                {/* 파이프라인 단계 — 커스텀 버튼 그룹 */}
                <motion.div
                  custom={2}
                  variants={sectionVariants}
                  initial="hidden"
                  animate="show"
                  className="rounded-2xl border border-[#e2ddd6] bg-white px-4 py-3.5"
                >
                  <p className="mb-2.5 text-[12px] font-semibold text-[#a8a49c] uppercase tracking-wider">
                    파이프라인 단계
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {STAGES.map((s) => {
                      const isActive = detail.pipelineStage === s;
                      const cfg = STAGE_CONFIG[s];
                      return (
                        <button
                          key={s}
                          onClick={() => handleStageChange(s)}
                          className="relative rounded-lg px-2.5 py-1 text-[12px] font-semibold transition-all duration-200"
                          style={{
                            backgroundColor: isActive ? cfg.bg : "transparent",
                            color: isActive ? cfg.accent : "#a8a49c",
                            border: `1.5px solid ${isActive ? cfg.accent + "60" : "#e2ddd6"}`,
                          }}
                        >
                          {isActive && (
                            <motion.span
                              layoutId="stageIndicator"
                              className="absolute inset-0 rounded-lg"
                              style={{ backgroundColor: cfg.bg }}
                              transition={{ type: "spring", stiffness: 400, damping: 28 }}
                            />
                          )}
                          <span className="relative z-10">{PIPELINE_STAGE_LABELS[s]}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* 태그 */}
                {companyTags.length > 0 && (
                  <motion.div
                    custom={3}
                    variants={sectionVariants}
                    initial="hidden"
                    animate="show"
                    className="rounded-2xl border border-[#e2ddd6] bg-white px-4 py-3.5"
                  >
                    <p className="mb-2.5 text-[12px] font-semibold text-[#a8a49c] uppercase tracking-wider">
                      태그
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {companyTags.map((tag) => {
                        const isActive = detail.tags.includes(tag.name);
                        return (
                          <button
                            key={tag.id}
                            onClick={() => handleToggleTag(tag.name)}
                            className="rounded-full px-2.5 py-1 text-[12px] font-semibold transition-all duration-150"
                            style={{
                              backgroundColor: isActive ? `${tag.color}20` : "transparent",
                              color: isActive ? tag.color : "#a8a49c",
                              border: `1.5px solid ${isActive ? tag.color + "60" : "#e2ddd6"}`,
                              transform: isActive ? "scale(1.03)" : "scale(1)",
                            }}
                          >
                            {tag.name}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* 메모 */}
                <motion.div
                  custom={4}
                  variants={sectionVariants}
                  initial="hidden"
                  animate="show"
                  className="rounded-2xl border border-[#e2ddd6] bg-white px-4 py-3.5"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-[12px] font-semibold text-[#a8a49c] uppercase tracking-wider">
                      메모
                    </p>
                    <AnimatePresence>
                      {memoSaved && (
                        <motion.span
                          initial={{ opacity: 0, x: 4 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-[11px] font-medium text-[#0EA5E9]"
                        >
                          저장됨
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <textarea
                    value={memo}
                    onChange={(e) => handleMemoChange(e.target.value)}
                    placeholder="메모를 입력하세요"
                    rows={3}
                    className="w-full resize-none rounded-xl border border-[#e2ddd6] bg-[#f5f3ee] px-3 py-2.5 text-[13px] text-[#141412] placeholder:text-[#c8c4bc] focus:border-[#0EA5E9] focus:outline-none focus:bg-white transition-colors"
                  />
                </motion.div>

                {/* 매칭 이력 */}
                {detail.matchings.length > 0 && (
                  <motion.div
                    custom={5}
                    variants={sectionVariants}
                    initial="hidden"
                    animate="show"
                    className="rounded-2xl border border-[#e2ddd6] bg-white px-4 py-3.5"
                  >
                    <p className="mb-3 text-[12px] font-semibold text-[#a8a49c] uppercase tracking-wider">
                      매칭 이력
                    </p>
                    <div className="space-y-2">
                      {detail.matchings.map((m) => {
                        const st = STATUS_STYLE[m.status] || STATUS_STYLE.REQUESTED;
                        return (
                          <div
                            key={m.id}
                            className="rounded-xl border border-[#f0ede8] bg-[#f5f3ee] px-3 py-2.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[13px] font-semibold text-[#141412] truncate">
                                {m.cleaningType || "청소"}
                              </span>
                              <span
                                className="flex-shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold"
                                style={{ backgroundColor: st.bg, color: st.color }}
                              >
                                {STATUS_LABELS[m.status] || m.status}
                              </span>
                            </div>
                            <p className="mt-1 text-[12px] text-[#72706a] truncate">{m.address}</p>
                            <div className="mt-1.5 flex items-center justify-between">
                              <span className="text-[11px] font-semibold tabular-nums text-[#0284C7]">
                                {m.estimatedPrice ? `${m.estimatedPrice.toLocaleString()}원` : "-"}
                              </span>
                              <span className="text-[11px] text-[#a8a49c]">
                                {new Date(m.createdAt).toLocaleDateString("ko-KR")}
                              </span>
                            </div>
                            {m.chatRoomId && (
                              <Link
                                href={`/chat?room=${m.chatRoomId}`}
                                className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-medium text-[#0EA5E9] hover:text-[#0284C7] transition-colors"
                              >
                                채팅방 바로가기
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                  <polyline points="9 18 15 12 9 6" />
                                </svg>
                              </Link>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* 채팅방 */}
                {detail.chatRooms.length > 0 && (
                  <motion.div
                    custom={6}
                    variants={sectionVariants}
                    initial="hidden"
                    animate="show"
                    className="rounded-2xl border border-[#e2ddd6] bg-white px-4 py-3.5"
                  >
                    <p className="mb-3 text-[12px] font-semibold text-[#a8a49c] uppercase tracking-wider">
                      채팅방
                    </p>
                    <div className="space-y-1.5">
                      {detail.chatRooms.map((c) => (
                        <Link
                          key={c.id}
                          href={`/chat?room=${c.id}`}
                          className="flex items-center justify-between rounded-xl border border-[#f0ede8] bg-[#f5f3ee] px-3 py-2.5 transition-colors hover:bg-[#f0ede8]"
                        >
                          <span className="text-[13px] text-[#72706a] truncate max-w-[200px]">
                            {c.lastMessage || "메시지 없음"}
                          </span>
                          <span className="ml-3 flex-shrink-0 text-[11px] text-[#a8a49c]">
                            {c.lastSentAt
                              ? new Date(c.lastSentAt).toLocaleDateString("ko-KR")
                              : new Date(c.createdAt).toLocaleDateString("ko-KR")}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}

              </div>
            ) : (
              <div className="py-24 text-center">
                <p className="text-[14px] text-[#a8a49c]">고객 정보를 불러올 수 없습니다</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
