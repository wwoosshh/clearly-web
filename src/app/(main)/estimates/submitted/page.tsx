"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/stores/auth.store";
import { useCacheStore } from "@/stores/cache.store";
import { Spinner } from "@/components/ui/Spinner";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { CLEANING_TYPE_LABELS } from "@/types";
import FadeIn from "@/components/animation/FadeIn";
import type { CleaningType } from "@/types";

const ImageLightbox = dynamic(
  () => import("@/components/ui/ImageLightbox").then((m) => m.ImageLightbox),
  { ssr: false },
);

interface SubmittedEstimate {
  id: string;
  price: number;
  message?: string;
  estimatedDuration?: string;
  availableDate?: string;
  images?: string[];
  status: string;
  createdAt: string;
  estimateRequest?: {
    id: string;
    cleaningType: string;
    address: string;
    detailAddress?: string;
    areaSize?: number;
    desiredDate?: string;
    desiredTime?: string;
    message?: string;
    budget?: number;
    images?: string[];
    status: string;
    user?: { id: string; name: string };
  };
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const statusTabs = [
  { key: "", label: "전체" },
  { key: "SUBMITTED", label: "대기중" },
  { key: "ACCEPTED", label: "수락됨" },
  { key: "REJECTED", label: "거절됨" },
];

export default function SubmittedEstimatesPage() {
  const { user } = useAuthStore();
  const [estimates, setEstimates] = useState<SubmittedEstimate[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<SubmittedEstimate | null>(null);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (!user) return;
    loadEstimates();
  }, [user, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadEstimates = async () => {
    const cache = useCacheStore.getState();
    const cacheKey = `estimates:submitted:${page}`;
    const cached = cache.get<{ list: SubmittedEstimate[]; meta: Meta | null }>(cacheKey, 2 * 60 * 1000);

    if (cached) {
      setEstimates(cached.list);
      setMeta(cached.meta);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    try {
      const { data } = await api.get("/estimates/company-estimates", {
        params: { page, limit: 20 },
      });
      const result = (data as any)?.data ?? data;
      const list = result?.data ?? (Array.isArray(result) ? result : []);
      const resultMeta = result?.meta ?? null;
      cache.set(cacheKey, { list, meta: resultMeta });
      setEstimates(list);
      setMeta(resultMeta);
    } catch {
      if (!cached) setEstimates([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("ko-KR");
  };

  const formatDuration = (d?: string) => {
    if (!d) return "";
    const trimmed = d.trim();
    if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}시간`;
    return trimmed;
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; style: string }> = {
      SUBMITTED: { label: "대기중", style: "bg-gray-100 text-gray-700" },
      ACCEPTED: { label: "수락됨", style: "bg-green-50 text-green-700" },
      REJECTED: { label: "거절됨", style: "bg-red-50 text-red-600" },
    };
    const info = map[status] || { label: status, style: "bg-gray-100 text-gray-600" };
    return (
      <span className={cn("rounded-full px-2.5 py-0.5 text-[12px] font-medium", info.style)}>
        {info.label}
      </span>
    );
  };

  const filtered = statusFilter
    ? estimates.filter((e) => e.status === statusFilter)
    : estimates;

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
        <p className="text-[15px] text-gray-500">로그인이 필요합니다</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10">
      <FadeIn>
      <h1 className="text-[24px] font-bold tracking-tight text-gray-900">
        내 견적
      </h1>
      <p className="mt-1.5 text-[15px] text-gray-500">
        내가 제출한 견적 현황을 확인하세요
      </p>

      {/* 상태 필터 탭 */}
      <div className="mt-6 flex gap-1 rounded-lg bg-gray-100 p-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={cn(
              "flex-1 rounded-md py-2 text-[14px] font-medium transition-colors",
              statusFilter === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      </FadeIn>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" className="text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-12 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <p className="mt-4 text-[15px] font-medium text-gray-700">
            {statusFilter ? "해당 상태의 견적이 없습니다" : "제출한 견적이 없습니다"}
          </p>
          <p className="mt-1.5 text-[13px] text-gray-500">
            견적 리스트에서 견적요청에 견적을 제출해보세요
          </p>
          <Link
            href="/estimates"
            className="mt-4 rounded-lg bg-gray-900 px-5 py-2.5 text-[13px] font-medium text-white hover:bg-gray-800"
          >
            견적 리스트 보기
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-col gap-3">
            {filtered.map((est) => (
              <button
                key={est.id}
                onClick={() => setSelected(est)}
                className="hover-lift rounded-xl border border-gray-200 bg-white p-5 text-left"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[15px] font-bold text-gray-900">
                      {est.estimateRequest?.cleaningType
                        ? CLEANING_TYPE_LABELS[est.estimateRequest.cleaningType as CleaningType] || est.estimateRequest.cleaningType
                        : "견적"}
                    </h3>
                    <p className="mt-1 text-[13px] text-gray-500">
                      {est.estimateRequest?.address || ""}
                      {est.estimateRequest?.detailAddress ? ` ${est.estimateRequest.detailAddress}` : ""}
                    </p>
                  </div>
                  {getStatusBadge(est.status)}
                </div>
                <div className="mt-3 flex items-center gap-4 text-[14px]">
                  <span className="font-bold text-gray-900">
                    {est.price.toLocaleString()}원
                  </span>
                  {est.estimatedDuration && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-500">예상 {formatDuration(est.estimatedDuration)}</span>
                    </>
                  )}
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-400 text-[13px]">
                    {formatDate(est.createdAt)}
                  </span>
                </div>
                {est.estimateRequest?.user?.name && (
                  <p className="mt-2 text-[13px] text-gray-500">
                    요청자: {est.estimateRequest.user.name}
                  </p>
                )}
              </button>
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
              >
                이전
              </button>
              <span className="text-[13px] text-gray-500">
                {page} / {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}

      {/* 견적 상세 모달 */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="견적 상세"
      >
        {selected && (
          <div>
            {/* 내 견적 정보 */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[13px] text-gray-500">상태</span>
                {getStatusBadge(selected.status)}
              </div>
              <div className="flex justify-between">
                <span className="text-[13px] text-gray-500">견적 금액</span>
                <span className="text-[16px] font-bold text-gray-900">
                  {selected.price.toLocaleString()}원
                </span>
              </div>
              {selected.estimatedDuration && (
                <div className="flex justify-between">
                  <span className="text-[13px] text-gray-500">예상 소요시간</span>
                  <span className="text-[14px] text-gray-700">
                    {formatDuration(selected.estimatedDuration)}
                  </span>
                </div>
              )}
              {selected.availableDate && (
                <div className="flex justify-between">
                  <span className="text-[13px] text-gray-500">가능 날짜</span>
                  <span className="text-[14px] text-gray-700">
                    {formatDate(selected.availableDate)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[13px] text-gray-500">제출일</span>
                <span className="text-[14px] text-gray-700">
                  {formatDate(selected.createdAt)}
                </span>
              </div>
            </div>

            {selected.message && (
              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <p className="text-[13px] font-medium text-gray-500 mb-1">내 메시지</p>
                <p className="text-[14px] text-gray-700 whitespace-pre-wrap break-words">
                  {selected.message}
                </p>
              </div>
            )}

            {/* 내 견적 첨부 사진 */}
            {selected.images && selected.images.length > 0 && (
              <div className="mt-4">
                <p className="text-[13px] font-medium text-gray-500 mb-2">내 첨부 사진</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {selected.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setLightboxImages(selected.images!);
                        setLightboxIndex(idx);
                      }}
                      className="flex-shrink-0"
                    >
                      <img
                        src={img}
                        alt={`견적 사진 ${idx + 1}`}
                        className="h-16 w-16 rounded-lg border border-gray-200 object-cover hover:opacity-80 transition-opacity"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 견적요청 정보 */}
            {selected.estimateRequest && (
              <div className="mt-5 border-t border-gray-100 pt-5">
                <h4 className="text-[13px] font-semibold text-gray-900 mb-3">견적요청 정보</h4>
                <div className="space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-[13px] text-gray-500">청소 유형</span>
                    <span className="text-[14px] text-gray-700">
                      {CLEANING_TYPE_LABELS[selected.estimateRequest.cleaningType as CleaningType] || selected.estimateRequest.cleaningType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[13px] text-gray-500">주소</span>
                    <span className="text-[14px] text-gray-700 text-right max-w-[200px]">
                      {selected.estimateRequest.address}
                      {selected.estimateRequest.detailAddress ? ` ${selected.estimateRequest.detailAddress}` : ""}
                    </span>
                  </div>
                  {selected.estimateRequest.areaSize && (
                    <div className="flex justify-between">
                      <span className="text-[13px] text-gray-500">면적</span>
                      <span className="text-[14px] text-gray-700">
                        {selected.estimateRequest.areaSize}평
                      </span>
                    </div>
                  )}
                  {selected.estimateRequest.desiredDate && (
                    <div className="flex justify-between">
                      <span className="text-[13px] text-gray-500">희망 날짜</span>
                      <span className="text-[14px] text-gray-700">
                        {formatDate(selected.estimateRequest.desiredDate)}
                      </span>
                    </div>
                  )}
                  {selected.estimateRequest.desiredTime && (
                    <div className="flex justify-between">
                      <span className="text-[13px] text-gray-500">희망 시간</span>
                      <span className="text-[14px] text-gray-700">
                        {selected.estimateRequest.desiredTime}
                      </span>
                    </div>
                  )}
                  {selected.estimateRequest.budget && (
                    <div className="flex justify-between">
                      <span className="text-[13px] text-gray-500">예산</span>
                      <span className="text-[14px] text-gray-700">
                        {selected.estimateRequest.budget.toLocaleString()}원
                      </span>
                    </div>
                  )}
                  {selected.estimateRequest.user?.name && (
                    <div className="flex justify-between">
                      <span className="text-[13px] text-gray-500">요청자</span>
                      <span className="text-[14px] text-gray-700">
                        {selected.estimateRequest.user.name}
                      </span>
                    </div>
                  )}
                </div>
                {selected.estimateRequest.message && (
                  <div className="mt-3 rounded-lg bg-gray-50 p-3">
                    <p className="text-[12px] font-medium text-gray-500 mb-1">요청 메시지</p>
                    <p className="text-[13px] text-gray-700 whitespace-pre-wrap break-words">
                      {selected.estimateRequest.message}
                    </p>
                  </div>
                )}
                {/* 견적요청 첨부 사진 */}
                {selected.estimateRequest.images && selected.estimateRequest.images.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[12px] font-medium text-gray-500 mb-2">요청 첨부 사진</p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {selected.estimateRequest.images.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setLightboxImages(selected.estimateRequest!.images!);
                            setLightboxIndex(idx);
                          }}
                          className="flex-shrink-0"
                        >
                          <img
                            src={img}
                            alt={`요청 사진 ${idx + 1}`}
                            className="h-14 w-14 rounded-lg border border-gray-200 object-cover hover:opacity-80 transition-opacity"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 수락된 견적이면 채팅방 이동 버튼 */}
            {selected.status === "ACCEPTED" && (
              <div className="mt-5">
                <Link
                  href={`/chat?companyId=${selected.estimateRequest?.user?.id || ""}`}
                  className="flex h-[38px] w-full items-center justify-center rounded-lg bg-gray-900 text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
                  onClick={() => setSelected(null)}
                >
                  채팅방으로 이동
                </Link>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 이미지 라이트박스 */}
      {lightboxImages.length > 0 && (
        <ImageLightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxImages([])}
        />
      )}
    </div>
  );
}
