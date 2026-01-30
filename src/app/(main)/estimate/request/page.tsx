"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { AddressSearch } from "@/components/address/AddressSearch";
import api from "@/lib/api";
import { CLEANING_TYPE_LABELS } from "@/types";
import type { CleaningType } from "@/types";
import { cn } from "@/lib/utils";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

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
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-[24px] font-bold tracking-tight text-gray-900">
        견적 요청
      </h1>
      <p className="mt-1.5 text-[15px] text-gray-500">
        청소 조건을 입력하면 여러 업체로부터 견적을 받을 수 있습니다
      </p>

      {serverError && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-600">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        {/* 청소 유형 */}
        <div>
          <label className="text-[13px] font-medium text-gray-800 mb-2 block">
            청소 유형 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(CLEANING_TYPE_LABELS) as [CleaningType, string][]).map(
              ([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue("cleaningType", value, { shouldValidate: true })}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-[13px] font-medium transition-colors",
                    selectedType === value
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 text-gray-600 hover:border-gray-400"
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
        </div>

        {/* 주소 */}
        <div>
          <label className="text-[13px] font-medium text-gray-800 mb-2 block">
            주소 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              readOnly
              value={address}
              placeholder="주소를 검색해주세요"
              className="h-[44px] flex-1 rounded-lg border border-gray-200 px-3.5 text-[14px] bg-gray-50 text-gray-700 cursor-pointer"
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
        </div>

        {/* 상세 주소 */}
        <Input
          label="상세 주소"
          placeholder="동/호수 등 상세 주소"
          {...register("detailAddress")}
          error={errors.detailAddress?.message}
        />

        {/* 면적 */}
        <Input
          label="면적 (평수)"
          type="number"
          placeholder="예: 25"
          {...register("areaSize")}
          error={errors.areaSize?.message}
        />

        {/* 희망 날짜 */}
        <Input
          label="희망 날짜"
          type="date"
          {...register("desiredDate")}
          error={errors.desiredDate?.message}
        />

        {/* 희망 시간대 */}
        <div>
          <label className="text-[13px] font-medium text-gray-800 mb-2 block">
            희망 시간대
          </label>
          <select
            {...register("desiredTime")}
            className="h-[44px] w-full rounded-lg border border-gray-200 px-3.5 text-[14px] text-gray-700 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 focus:outline-none"
          >
            <option value="">선택 안함</option>
            {TIME_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* 희망 예산 */}
        <Input
          label="희망 예산 (원)"
          type="number"
          placeholder="예: 300000"
          helperText="선택 사항입니다"
          {...register("budget")}
          error={errors.budget?.message}
        />

        {/* 상세 설명 */}
        <div>
          <label className="text-[13px] font-medium text-gray-800 mb-2 block">
            상세 설명 <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("message")}
            placeholder="청소가 필요한 상황을 자세히 설명해주세요. (예: 방 3개, 화장실 2개, 입주 전 전체 청소 희망)"
            rows={5}
            className={cn(
              "w-full rounded-lg border px-3.5 py-3 text-[14px] transition-colors resize-none",
              "placeholder:text-gray-400",
              errors.message
                ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                : "border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5",
              "focus:outline-none"
            )}
          />
          {errors.message && (
            <p className="mt-1.5 text-[12px] text-red-500">{errors.message.message}</p>
          )}
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-[46px] w-full items-center justify-center rounded-lg bg-gray-900 text-[14px] font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            "견적 요청하기"
          )}
        </button>
      </form>
    </div>
  );
}
