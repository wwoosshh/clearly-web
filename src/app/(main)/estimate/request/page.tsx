"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { AddressSearch } from "@/components/address/AddressSearch";
import api from "@/lib/api";
import { CLEANING_TYPE_LABELS } from "@/types";
import type { CleaningType } from "@/types";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const estimateRequestSchema = z.object({
  cleaningType: z.string().min(1, "청소 유형을 선택해주세요."),
  address: z.string().min(1, "주소를 입력해주세요."),
  detailAddress: z.string(),
  areaSize: z.string(),
  desiredDate: z.string(),
  desiredTime: z.string(),
  message: z.string().min(1, "상세 설명을 입력해주세요."),
  budget: z.string(),
});

type EstimateRequestForm = z.infer<typeof estimateRequestSchema>;

const TIME_OPTIONS = [
  "오전 (09:00~12:00)",
  "오후 (12:00~18:00)",
  "저녁 (18:00~21:00)",
  "시간 협의",
];

export default function EstimateRequestPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [priceEstimate, setPriceEstimate] = useState<{
    minPrice: number;
    avgPrice: number;
    maxPrice: number;
    sampleCount: number;
  } | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (user?.role === "COMPANY") {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-20 text-center">
        <p className="text-[15px] font-medium text-[#1a1918]">업체 계정으로는 견적을 요청할 수 없습니다</p>
        <p className="mt-1.5 text-[13px] text-[#72706a]">견적 요청은 일반 회원만 이용할 수 있습니다</p>
        <button
          onClick={() => router.push("/estimates")}
          className="press-scale mt-4 rounded-lg bg-[#2d6a4f] px-5 py-2.5 text-[13px] font-medium text-[#f5f3ee] hover:bg-[#235840] transition-colors"
        >
          견적 리스트 보기
        </button>
      </div>
    );
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EstimateRequestForm>({
    resolver: zodResolver(estimateRequestSchema),
    defaultValues: {
      cleaningType: "",
      address: "",
      detailAddress: "",
      areaSize: "",
      desiredDate: "",
      desiredTime: "",
      message: "",
      budget: "",
    },
  });

  const selectedType = watch("cleaningType");
  const address = watch("address");
  const watchAreaSize = watch("areaSize");

  // 예상 가격 조회 (디바운스)
  useEffect(() => {
    if (!selectedType) {
      setPriceEstimate(null);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setPriceLoading(true);
      try {
        const params: Record<string, string> = { cleaningType: selectedType };
        if (watchAreaSize) params.areaSize = watchAreaSize;
        if (address) params.address = address;
        const res = await api.get("/estimates/price-estimate", { params });
        const data = res.data?.data ?? res.data;
        if (data && data.sampleCount > 0) {
          setPriceEstimate(data);
        } else {
          setPriceEstimate(null);
        }
      } catch {
        setPriceEstimate(null);
      } finally {
        setPriceLoading(false);
      }
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [selectedType, watchAreaSize, address]);

  const onSubmit = async (data: EstimateRequestForm) => {
    setIsSubmitting(true);
    setServerError("");

    try {
      const payload: Record<string, unknown> = {
        cleaningType: data.cleaningType,
        address: data.address,
        message: data.message,
      };
      if (data.detailAddress) payload.detailAddress = data.detailAddress;
      if (data.areaSize) payload.areaSize = parseInt(data.areaSize);
      if (data.desiredDate) payload.desiredDate = data.desiredDate;
      if (data.desiredTime) payload.desiredTime = data.desiredTime;
      if (data.budget) payload.budget = parseInt(data.budget);
      if (images.length > 0) payload.images = images;

      await api.post("/estimates/requests", payload);
      router.push("/matching");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "견적요청에 실패했습니다. 다시 시도해주세요.";
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-10">
      <motion.div variants={stagger} initial="hidden" animate="show">
        <motion.div variants={fadeUp}>
          <h1 className="text-[24px] font-bold tracking-tight text-[#141412]">
            견적 요청
          </h1>
          <p className="mt-1.5 text-[15px] text-[#72706a]">
            청소 조건을 입력하면 여러 업체로부터 견적을 받을 수 있습니다
          </p>
        </motion.div>

        {serverError && (
          <motion.div variants={fadeUp}>
            <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-600">
              {serverError}
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {/* 청소 유형 */}
          <motion.div variants={fadeUp}>
            <label className="text-[13px] font-medium text-[#1a1918] mb-2 block">
              청소 유형 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {(Object.entries(CLEANING_TYPE_LABELS) as [CleaningType, string][]).map(
                ([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue("cleaningType", value, { shouldValidate: true })}
                    className={cn(
                      "press-scale rounded-lg border px-3 py-2.5 text-[13px] font-medium transition-colors",
                      selectedType === value
                        ? "border-[#2d6a4f] bg-[#2d6a4f] text-[#f5f3ee]"
                        : "border-[#e2ddd6] text-[#72706a] hover:border-[#2d6a4f] hover:text-[#2d6a4f]"
                    )}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
            {errors.cleaningType && (
              <p className="mt-1.5 text-[12px] text-red-500">{errors.cleaningType.message}</p>
            )}
          </motion.div>

          {/* 주소 */}
          <motion.div variants={fadeUp}>
            <label className="text-[13px] font-medium text-[#1a1918] mb-2 block">
              주소 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                readOnly
                value={address}
                placeholder="주소를 검색해주세요"
                className="h-[44px] flex-1 rounded-lg border border-[#e2ddd6] px-3.5 text-[14px] bg-[#f0ede8] text-[#72706a] cursor-pointer"
                onClick={() => {
                  // 주소 검색은 AddressSearch 버튼으로
                }}
              />
              <AddressSearch
                onComplete={(data) => {
                  setValue("address", data.roadAddress || data.address, {
                    shouldValidate: true,
                  });
                }}
              />
            </div>
            {errors.address && (
              <p className="mt-1.5 text-[12px] text-red-500">{errors.address.message}</p>
            )}
          </motion.div>

          {/* 상세 주소 */}
          <motion.div variants={fadeUp}>
            <Input
              label="상세 주소"
              placeholder="동/호수 등 상세 주소"
              {...register("detailAddress")}
              error={errors.detailAddress?.message}
            />
          </motion.div>

          {/* 면적 */}
          <motion.div variants={fadeUp}>
            <Input
              label="면적 (평수)"
              type="number"
              placeholder="예: 25"
              {...register("areaSize")}
              error={errors.areaSize?.message}
            />
          </motion.div>

          {/* 예상 가격 범위 */}
          {priceLoading && (
            <motion.div variants={fadeUp}>
              <p className="text-center text-[13px] text-[#a8a49c] py-2">
                예상 가격 조회 중...
              </p>
            </motion.div>
          )}
          {priceEstimate && !priceLoading && (
            <motion.div variants={fadeUp}>
              <div className="rounded-lg border border-[#d4ede4] bg-[#eef7f3] px-4 py-3.5">
                <p className="text-[13px] font-semibold text-[#1a1918]">
                  예상 가격 범위
                </p>
                <div className="mt-2 flex items-end justify-between">
                  <div className="text-center flex-1">
                    <p className="text-[13px] text-[#72706a]">
                      {priceEstimate.minPrice.toLocaleString()}원
                    </p>
                    <p className="text-[11px] text-[#a8a49c]">최저</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-lg font-bold text-[#141412]">
                      {priceEstimate.avgPrice.toLocaleString()}원
                    </p>
                    <p className="text-[11px] text-[#a8a49c]">평균</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-[13px] text-[#72706a]">
                      {priceEstimate.maxPrice.toLocaleString()}원
                    </p>
                    <p className="text-[11px] text-[#a8a49c]">최고</p>
                  </div>
                </div>
                <p className="mt-2 text-center text-[11px] text-[#a8a49c]">
                  최근 {priceEstimate.sampleCount}건의 거래 기준
                </p>
              </div>
            </motion.div>
          )}

          {/* 희망 날짜 */}
          <motion.div variants={fadeUp}>
            <Input
              label="희망 날짜"
              type="date"
              {...register("desiredDate")}
              error={errors.desiredDate?.message}
            />
          </motion.div>

          {/* 희망 시간대 */}
          <motion.div variants={fadeUp}>
            <label className="text-[13px] font-medium text-[#1a1918] mb-2 block">
              희망 시간대
            </label>
            <select
              {...register("desiredTime")}
              className="h-[44px] w-full rounded-lg border border-[#e2ddd6] px-3.5 text-[14px] text-[#1a1918] focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 focus:outline-none transition-colors"
            >
              <option value="">선택 안함</option>
              {TIME_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </motion.div>

          {/* 희망 예산 */}
          <motion.div variants={fadeUp}>
            <Input
              label="희망 예산 (원)"
              type="number"
              placeholder="예: 300000"
              helperText="선택 사항입니다"
              {...register("budget")}
              error={errors.budget?.message}
            />
          </motion.div>

          {/* 상세 설명 */}
          <motion.div variants={fadeUp}>
            <label className="text-[13px] font-medium text-[#1a1918] mb-2 block">
              상세 설명 <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("message")}
              placeholder="청소가 필요한 상황을 자세히 설명해주세요. (예: 방 3개, 화장실 2개, 입주 전 전체 청소 희망)"
              rows={5}
              className={cn(
                "w-full rounded-lg border px-3.5 py-3 text-[14px] transition-colors resize-none",
                "placeholder:text-[#a8a49c]",
                errors.message
                  ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                  : "border-[#e2ddd6] focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20",
                "focus:outline-none"
              )}
            />
            {errors.message && (
              <p className="mt-1.5 text-[12px] text-red-500">{errors.message.message}</p>
            )}
          </motion.div>

          {/* 참고 사진 */}
          <motion.div variants={fadeUp}>
            <ImageUpload
              label="참고 사진 (선택)"
              maxFiles={10}
              bucket="estimates"
              value={images}
              onChange={setImages}
            />
          </motion.div>

          {/* 제출 버튼 */}
          <motion.div variants={fadeUp}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="press-scale flex h-[46px] w-full items-center justify-center rounded-lg bg-[#2d6a4f] text-[14px] font-semibold text-[#f5f3ee] transition-colors hover:bg-[#235840] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <svg
                  className="h-5 w-5 animate-spin text-[#f5f3ee]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                "견적 요청하기"
              )}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
