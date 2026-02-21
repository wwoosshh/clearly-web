"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import api from "@/lib/api";
import { unwrapResponse } from "@/lib/apiHelpers";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";
import { CLEANING_TYPE_LABELS } from "@/types";
import type { CleaningType } from "@/types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ComparisonEstimate {
  estimateId: string;
  companyId: string;
  businessName: string;
  price: number;
  estimatedDuration?: string;
  availableDate?: string;
  message?: string;
  status: string;
  averageRating: number;
  totalReviews: number;
  totalMatchings: number;
  responseTime?: number;
  verificationStatus: string;
  specialties: string[];
  minPrice?: number;
  maxPrice?: number;
}

interface ComparisonResponse {
  request: {
    id: string;
    cleaningType: string;
    address: string;
    areaSize?: number;
    budget?: number;
    desiredDate?: string;
    status: string;
  };
  estimates: ComparisonEstimate[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COMPANY_COLORS = ["#2d6a4f", "#4a8c6a", "#8db4a0", "#b5cfc4", "#d4e6de"];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(n: number) {
  if (n >= 10000) return `${Math.round(n / 10000)}만원`;
  return `${n.toLocaleString()}원`;
}

function formatDate(s?: string) {
  if (!s) return "-";
  return new Date(s).toLocaleDateString("ko-KR");
}

function formatDuration(d?: string) {
  if (!d) return "-";
  const trimmed = d.trim();
  if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}시간`;
  return trimmed;
}

function formatResponseTime(min?: number) {
  if (min == null) return "-";
  if (min < 60) return `${min}분`;
  return `${Math.floor(min / 60)}시간 ${min % 60}분`;
}

// 신규 업체(실적 없음)도 최소 8점으로 표시해 다각형 모양 유지
const RADAR_MIN_SCORE = 8;

function normalizeRadar(est: ComparisonEstimate, allEstimates: ComparisonEstimate[]) {
  const prices = allEstimates.map((e) => e.price).filter(Boolean);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const priceScore =
    maxP === minP ? 80 : Math.round(((maxP - est.price) / (maxP - minP)) * 100);

  const ratingScore = Math.round((est.averageRating / 5) * 100);

  // 고정 최댓값 대신 비교 데이터 내 상대적 최댓값 기준으로 정규화
  const maxReviews = Math.max(...allEstimates.map((e) => e.totalReviews), 1);
  const reviewScore = Math.round((est.totalReviews / maxReviews) * 100);

  const maxMatchings = Math.max(...allEstimates.map((e) => e.totalMatchings), 1);
  const matchingScore = Math.round((est.totalMatchings / maxMatchings) * 100);

  const rt = est.responseTime ?? 120;
  const speedScore = Math.round(Math.max(0, ((120 - rt) / 120) * 100));

  return {
    견적가격: Math.max(RADAR_MIN_SCORE, priceScore),
    평점: Math.max(RADAR_MIN_SCORE, ratingScore),
    리뷰수: Math.max(RADAR_MIN_SCORE, reviewScore),
    매칭건수: Math.max(RADAR_MIN_SCORE, matchingScore),
    응답속도: Math.max(RADAR_MIN_SCORE, speedScore),
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 animate-pulse space-y-6">
      <div className="h-8 w-48 rounded-lg bg-[#e2ddd6]" />
      <div className="h-20 rounded-xl bg-[#e2ddd6]" />
      <div className="h-36 rounded-xl bg-[#e2ddd6]" />
      <div className="h-64 rounded-xl bg-[#e2ddd6]" />
      <div className="h-64 rounded-xl bg-[#e2ddd6]" />
    </div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}

function PriceTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[#e2ddd6] bg-white px-4 py-3 shadow-lg">
      <p className="text-[13px] font-semibold text-[#141412]">{label}</p>
      <p className="text-[15px] font-bold text-[#2d6a4f]">
        {payload[0].value.toLocaleString()}원
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EstimateComparePage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.requestId as string;
  const { user } = useAuthStore();

  const [data, setData] = useState<ComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // 최종 수락할 업체 (단일 선택)
  const [chosenEstimateId, setChosenEstimateId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(
        `/estimates/requests/${requestId}/compare`
      );
      const result: ComparisonResponse = unwrapResponse<ComparisonResponse>(response);
      setData(result);
      setSelectedIds(result.estimates.slice(0, 3).map((e) => e.estimateId));
    } catch {
      setError("데이터를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user, fetchData]);

  // ── Selection ──────────────────────────────────────────────────────────────

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      // 비교 해제 시 최종 선택된 업체도 초기화
      if (chosenEstimateId === id) setChosenEstimateId(null);
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    } else {
      if (selectedIds.length >= 3) return;
      setSelectedIds((prev) => [...prev, id]);
    }
  };

  const toggleChoose = (id: string) => {
    setChosenEstimateId((prev) => (prev === id ? null : id));
  };

  // ── Accept ─────────────────────────────────────────────────────────────────

  const handleAccept = async () => {
    if (!chosenEstimateId) return;
    setActionLoading(true);
    try {
      const acceptResponse = await api.patch(
        `/estimates/${chosenEstimateId}/accept`
      );
      const result = unwrapResponse<{ chatRoom?: { id: string } }>(acceptResponse);
      const chatRoomId = result?.chatRoom?.id;
      router.push(chatRoomId ? `/chat?roomId=${chatRoomId}` : "/chat");
    } catch {
      // silent
    } finally {
      setActionLoading(false);
    }
  };

  // ── Computed ───────────────────────────────────────────────────────────────

  const selected =
    data?.estimates.filter((e) => selectedIds.includes(e.estimateId)) ?? [];


  const barData = selected.map((e) => ({
    name: e.businessName,
    가격: e.price,
  }));

  const radarAxes = ["견적가격", "평점", "리뷰수", "매칭건수", "응답속도"] as const;

  const radarData = radarAxes.map((axis) => {
    const row: Record<string, string | number> = { axis };
    selected.forEach((est) => {
      const normalized = normalizeRadar(est, data?.estimates ?? []);
      row[est.businessName] = normalized[axis];
    });
    return row;
  });

  const tableRows: {
    label: string;
    getValue: (e: ComparisonEstimate) => string | number;
    isBetter: "lower" | "higher" | "none";
    getRaw: (e: ComparisonEstimate) => number | null;
  }[] = [
    { label: "견적 가격", getValue: (e) => `${e.price.toLocaleString()}원`, isBetter: "lower", getRaw: (e) => e.price },
    { label: "예상 작업시간", getValue: (e) => formatDuration(e.estimatedDuration), isBetter: "none", getRaw: () => null },
    { label: "가능 날짜", getValue: (e) => formatDate(e.availableDate), isBetter: "none", getRaw: () => null },
    { label: "평균 평점", getValue: (e) => `★ ${Number(e.averageRating).toFixed(1)}`, isBetter: "higher", getRaw: (e) => e.averageRating },
    { label: "리뷰 수", getValue: (e) => `${e.totalReviews}건`, isBetter: "higher", getRaw: (e) => e.totalReviews },
    { label: "매칭 건수", getValue: (e) => `${e.totalMatchings}건`, isBetter: "higher", getRaw: (e) => e.totalMatchings },
    { label: "평균 응답속도", getValue: (e) => formatResponseTime(e.responseTime), isBetter: "lower", getRaw: (e) => e.responseTime ?? null },
    { label: "인증 여부", getValue: (e) => (e.verificationStatus === "APPROVED" ? "인증 완료" : "미인증"), isBetter: "none", getRaw: () => null },
  ];

  const chosenEst = selected.find((e) => e.estimateId === chosenEstimateId) ?? null;

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isLoading) return <LoadingSkeleton />;

  if (error || !data) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-20 text-center">
        <p className="text-[15px] text-[#72706a]">{error ?? "오류가 발생했습니다."}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 rounded-lg bg-[#2d6a4f] px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#4a8c6a]"
        >
          돌아가기
        </button>
      </div>
    );
  }

  const { request } = data;

  return (
    <>
      <div className={cn(
        "mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-10",
        chosenEstimateId && "pb-28"
      )}>
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
          {/* ── Header ── */}
          <motion.div variants={fadeUp}>
            <button
              onClick={() => router.back()}
              className="mb-4 flex items-center gap-1.5 text-[13px] text-[#72706a] hover:text-[#2d6a4f] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              뒤로가기
            </button>

            <h1 className="text-[24px] font-bold tracking-tight text-[#141412]">견적 비교</h1>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#2d6a4f] px-3 py-1 text-[12px] font-medium text-white">
                {CLEANING_TYPE_LABELS[request.cleaningType as CleaningType] ?? request.cleaningType}
              </span>
              <span className="rounded-full bg-[#f0ede8] px-3 py-1 text-[12px] text-[#72706a]">{request.address}</span>
              {request.areaSize && (
                <span className="rounded-full bg-[#f0ede8] px-3 py-1 text-[12px] text-[#72706a]">{request.areaSize}평</span>
              )}
              {request.budget && (
                <span className="rounded-full bg-[#f0ede8] px-3 py-1 text-[12px] text-[#72706a]">예산 {formatPrice(request.budget)}</span>
              )}
              {request.desiredDate && (
                <span className="rounded-full bg-[#f0ede8] px-3 py-1 text-[12px] text-[#72706a]">{formatDate(request.desiredDate)}</span>
              )}
            </div>
          </motion.div>

          {/* ── Company Selector (비교용 체크박스) ── */}
          <motion.div variants={fadeUp} className="rounded-xl border border-[#e2ddd6] bg-white p-5">
            <p className="text-[14px] font-semibold text-[#141412] mb-3">
              비교할 업체 선택{" "}
              <span className="text-[12px] font-normal text-[#72706a]">(최대 3개)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {data.estimates.map((est, idx) => {
                const isChecked = selectedIds.includes(est.estimateId);
                const color = COMPANY_COLORS[idx % COMPANY_COLORS.length];
                const isMaxed = selectedIds.length >= 3 && !isChecked;
                return (
                  <button
                    key={est.estimateId}
                    onClick={() => toggleSelect(est.estimateId)}
                    disabled={isMaxed}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3.5 py-2 text-[13px] font-medium transition-all",
                      isChecked
                        ? "border-transparent text-white shadow-sm"
                        : "border-[#e2ddd6] bg-[#f5f3ee] text-[#72706a] hover:border-[#2d6a4f] hover:text-[#2d6a4f]",
                      isMaxed && "opacity-40 cursor-not-allowed"
                    )}
                    style={isChecked ? { backgroundColor: color } : undefined}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border",
                        isChecked ? "border-white/60 bg-white/20" : "border-[#e2ddd6]"
                      )}
                    >
                      {isChecked && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                    {est.businessName}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* ── 비어있을 때 안내 ── */}
          {selected.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-[#e2ddd6] bg-white p-10 text-center"
            >
              <p className="text-[14px] text-[#72706a]">업체를 선택하면 비교 정보가 표시됩니다</p>
            </motion.div>
          )}

          {/* ── Charts & Table: key가 바뀌면 완전히 재마운트 → recharts 애니메이션 재실행 ── */}
          {selected.length > 0 && (
            <div className="space-y-6">
              {/* ── Price Bar Chart ── */}
              <motion.div variants={fadeUp} className="rounded-xl border border-[#e2ddd6] bg-white p-5">
                <div className="flex items-center gap-2 mb-4">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                  <h2 className="text-[15px] font-semibold text-[#141412]">가격 비교</h2>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#72706a" }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#72706a" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`}
                    />
                    <Tooltip content={<PriceTooltip />} cursor={{ fill: "#f0ede820" }} />
                    <Bar dataKey="가격" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={800} animationEasing="ease-out">
                      {barData.map((entry, index) => {
                        const realIdx = data.estimates.findIndex((e) => e.businessName === entry.name);
                        return <Cell key={`cell-${index}`} fill={COMPANY_COLORS[realIdx % COMPANY_COLORS.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                {selected.length >= 2 && (
                  <p className="mt-2 text-center text-[12px] text-[#72706a]">
                    최저가:{" "}
                    <span className="font-semibold text-[#2d6a4f]">
                      {selected.reduce((a, b) => (a.price < b.price ? a : b)).businessName}
                    </span>{" "}
                    ({formatPrice(Math.min(...selected.map((e) => e.price)))})
                  </p>
                )}
              </motion.div>

              {/* ── Radar Chart ── */}
              <motion.div variants={fadeUp} className="rounded-xl border border-[#e2ddd6] bg-white p-5">
                <div className="flex items-center gap-2 mb-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <h2 className="text-[15px] font-semibold text-[#141412]">종합 평가</h2>
                  <span className="text-[12px] text-[#72706a]">(높을수록 우수)</span>
                </div>
                <p className="mb-3 text-[11px] text-[#b5b0a8]">* 실적이 없는 항목은 최소값으로 표시됩니다</p>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                    <PolarGrid stroke="#e2ddd6" />
                    <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12, fill: "#72706a" }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: "#b5b0a8" }} tickCount={3} />
                    {selected.map((est) => {
                      const realIdx = data.estimates.findIndex((e) => e.estimateId === est.estimateId);
                      const color = COMPANY_COLORS[realIdx % COMPANY_COLORS.length];
                      return (
                        <Radar
                          key={est.estimateId}
                          name={est.businessName}
                          dataKey={est.businessName}
                          stroke={color}
                          fill={color}
                          fillOpacity={0.15}
                          strokeWidth={2}
                          isAnimationActive
                          animationDuration={800}
                        />
                      );
                    })}
                    <Legend wrapperStyle={{ fontSize: "12px", color: "#72706a", paddingTop: "8px" }} />
                  </RadarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* ── Detail Table ── */}
              <motion.div variants={fadeUp} className="rounded-xl border border-[#e2ddd6] bg-white overflow-hidden">
                <div className="flex items-center gap-2 p-5 pb-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                    <rect x="9" y="3" width="6" height="4" rx="1" />
                    <line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" />
                  </svg>
                  <h2 className="text-[15px] font-semibold text-[#141412]">상세 비교</h2>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[480px] border-collapse">
                    <thead>
                      <tr className="border-b border-[#f0ede8]">
                        <th className="w-28 px-5 py-3 text-left text-[12px] font-medium text-[#72706a]">항목</th>
                        {selected.map((est) => {
                          const realIdx = data.estimates.findIndex((e) => e.estimateId === est.estimateId);
                          const color = COMPANY_COLORS[realIdx % COMPANY_COLORS.length];
                          return (
                            <th key={est.estimateId} className="px-4 py-3 text-left text-[13px] font-semibold" style={{ color }}>
                              {est.businessName}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {tableRows.map((row, rowIdx) => {
                        const raws = selected.map((e) => row.getRaw(e)).filter((v): v is number => v !== null);
                        const bestRaw =
                          row.isBetter === "lower" ? Math.min(...raws)
                          : row.isBetter === "higher" ? Math.max(...raws)
                          : null;

                        return (
                          <motion.tr
                            key={row.label}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: rowIdx * 0.04, duration: 0.3 }}
                            className={cn("border-b border-[#f0ede8] last:border-0", rowIdx % 2 === 0 ? "bg-white" : "bg-[#faf9f7]")}
                          >
                            <td className="px-5 py-3.5 text-[12px] font-medium text-[#72706a]">{row.label}</td>
                            {selected.map((est) => {
                              const raw = row.getRaw(est);
                              const isBest = bestRaw !== null && raw !== null && raw === bestRaw && raws.length > 1;
                              return (
                                <td key={est.estimateId} className={cn("px-4 py-3.5 text-[13px] font-medium", isBest ? "text-[#2d6a4f]" : "text-[#141412]")}>
                                  <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5", isBest && "bg-[#eef7f3]")}>
                                    {row.getValue(est)}
                                    {isBest && (
                                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    )}
                                  </span>
                                </td>
                              );
                            })}
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* ── 최종 업체 선택 (단일 선택 카드) ── */}
              <motion.div variants={fadeUp}>
                <h2 className="text-[15px] font-semibold text-[#141412] mb-1">업체 선택</h2>
                <p className="text-[13px] text-[#72706a] mb-3">최종 수락할 업체 한 곳을 선택하세요</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence>
                    {selected.map((est) => {
                      const realIdx = data.estimates.findIndex((e) => e.estimateId === est.estimateId);
                      const color = COMPANY_COLORS[realIdx % COMPANY_COLORS.length];
                      const isChosen = chosenEstimateId === est.estimateId;
                      const isSubmitted = est.status === "SUBMITTED";

                      return (
                        <motion.button
                          key={est.estimateId}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => isSubmitted && toggleChoose(est.estimateId)}
                          className={cn(
                            "rounded-xl border-2 p-4 text-left transition-all w-full",
                            isChosen
                              ? "border-[#2d6a4f] bg-[#eef7f3] shadow-sm"
                              : "border-[#e2ddd6] bg-white hover:border-[#8db4a0]",
                            !isSubmitted && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                            <p className="text-[14px] font-semibold text-[#141412] truncate flex-1">{est.businessName}</p>
                            {est.verificationStatus === "APPROVED" && (
                              <span className="flex-shrink-0 rounded-full bg-[#eef7f3] px-2 py-0.5 text-[10px] font-medium text-[#2d6a4f] border border-[#d4ede4]">
                                인증
                              </span>
                            )}
                          </div>
                          <p className="text-[20px] font-bold text-[#141412]">{est.price.toLocaleString()}원</p>
                          {est.estimatedDuration && (
                            <p className="mt-0.5 text-[12px] text-[#72706a]">예상 {formatDuration(est.estimatedDuration)}</p>
                          )}
                          {!isSubmitted && (
                            <p className="mt-1.5 text-[11px] text-[#b5b0a8]">
                              {est.status === "ACCEPTED" ? "이미 수락된 견적" : "처리 완료된 견적"}
                            </p>
                          )}
                          {isChosen && (
                            <div className="mt-2 flex items-center gap-1 text-[12px] font-semibold text-[#2d6a4f]">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              선택됨
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Sticky 하단 견적 수락 바 ── */}
      <AnimatePresence>
        {chosenEst && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e2ddd6] bg-white/95 backdrop-blur-sm px-4 py-3"
          >
            <div className="mx-auto max-w-4xl flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] text-[#72706a]">선택한 업체</p>
                <p className="text-[14px] font-semibold text-[#141412] truncate">{chosenEst.businessName}</p>
                <p className="text-[13px] font-bold text-[#2d6a4f]">{chosenEst.price.toLocaleString()}원</p>
              </div>
              <button
                onClick={handleAccept}
                disabled={actionLoading}
                className="flex flex-shrink-0 h-[46px] items-center gap-2 rounded-xl bg-[#2d6a4f] px-6 text-[14px] font-semibold text-white hover:bg-[#4a8c6a] disabled:opacity-60 transition-colors"
              >
                {actionLoading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    견적 수락
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
