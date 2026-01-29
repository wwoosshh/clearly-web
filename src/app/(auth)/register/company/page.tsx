"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { AddressSearch } from "@/components/address/AddressSearch";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

const SPECIALTY_OPTIONS = [
  "이사청소",
  "입주청소",
  "거주청소",
  "사무실청소",
  "상가청소",
  "준공청소",
  "에어컨청소",
  "카펫청소",
  "외벽청소",
  "기타",
] as const;

const REGION_OPTIONS = [
  "서울",
  "경기",
  "인천",
  "부산",
  "대구",
  "대전",
  "광주",
  "울산",
  "세종",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
] as const;

const registerCompanySchema = z
  .object({
    // 담당자 정보
    name: z
      .string()
      .min(1, "이름을 입력해주세요")
      .min(2, "이름은 2자 이상이어야 합니다"),
    email: z
      .string()
      .min(1, "이메일을 입력해주세요")
      .email("올바른 이메일 형식이 아닙니다"),
    phone: z
      .string()
      .min(1, "전화번호를 입력해주세요")
      .regex(/^01[016789]\d{7,8}$/, "올바른 전화번호를 입력해주세요"),
    password: z
      .string()
      .min(1, "비밀번호를 입력해주세요")
      .min(8, "비밀번호는 8자 이상이어야 합니다")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        "대문자, 소문자, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다"
      ),
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력해주세요"),
    // 업체 정보
    businessName: z
      .string()
      .min(1, "상호명을 입력해주세요")
      .max(100, "상호명은 최대 100자까지 가능합니다"),
    businessNumber: z
      .string()
      .min(1, "사업자등록번호를 입력해주세요")
      .regex(
        /^\d{3}-?\d{2}-?\d{5}$/,
        "올바른 사업자등록번호 형식이 아닙니다 (예: 123-45-67890)"
      ),
    representative: z
      .string()
      .min(1, "대표자명을 입력해주세요")
      .max(50, "대표자명은 최대 50자까지 가능합니다"),
    address: z
      .string()
      .min(1, "주소를 검색해주세요")
      .max(300, "주소는 최대 300자까지 가능합니다"),
    detailAddress: z
      .string()
      .max(200, "상세주소는 최대 200자까지 가능합니다")
      .optional()
      .or(z.literal("")),
    // 서비스 정보
    specialties: z.array(z.string()).optional(),
    serviceAreas: z.array(z.string()).optional(),
    description: z
      .string()
      .max(2000, "업체 소개는 최대 2000자까지 가능합니다")
      .optional()
      .or(z.literal("")),
    minPrice: z
      .string()
      .optional()
      .or(z.literal("")),
    maxPrice: z
      .string()
      .optional()
      .or(z.literal("")),
    agreeTerms: z.literal(true, {
      error: "필수 약관에 동의해주세요",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

type RegisterCompanyForm = z.infer<typeof registerCompanySchema>;

export default function RegisterCompanyPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterCompanyForm>({
    resolver: zodResolver(registerCompanySchema),
    defaultValues: {
      address: "",
      specialties: [],
      serviceAreas: [],
      description: "",
      minPrice: "",
      maxPrice: "",
      agreeTerms: undefined,
    },
  });

  const addressValue = watch("address");
  const selectedSpecialties = watch("specialties") || [];
  const selectedAreas = watch("serviceAreas") || [];

  const onSubmit = async (data: RegisterCompanyForm) => {
    setServerError("");
    try {
      await api.post("/auth/register/company", {
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone,
        businessName: data.businessName,
        businessNumber: data.businessNumber,
        representative: data.representative,
        address: data.address,
        detailAddress: data.detailAddress || undefined,
        specialties: data.specialties?.length ? data.specialties : undefined,
        serviceAreas: data.serviceAreas?.length ? data.serviceAreas : undefined,
        description: data.description || undefined,
        minPrice: data.minPrice ? Number(data.minPrice) : undefined,
        maxPrice: data.maxPrice ? Number(data.maxPrice) : undefined,
      });
      setIsSuccess(true);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "회원가입에 실패했습니다. 다시 시도해주세요.";
      setServerError(message);
    }
  };

  if (isSuccess) {
    return (
      <>
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-900">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1 className="mt-6 text-[24px] font-extrabold tracking-tight text-gray-900">
            가입 신청이 완료되었습니다
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-gray-500">
            관리자 승인 후 서비스를 이용하실 수 있습니다.
            <br />
            승인 완료 시 가입하신 이메일로 안내드리겠습니다.
          </p>

          <div className="mt-8 w-full rounded-lg border border-gray-200 bg-gray-50 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className="text-[13px] leading-snug text-gray-600">
                승인 심사는 영업일 기준 1~2일 소요됩니다.
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/login")}
            className="mt-6 flex h-[46px] w-full items-center justify-center rounded-lg bg-gray-900 text-[14px] font-semibold text-white transition-colors hover:bg-gray-800"
          >
            로그인 페이지로 이동
          </button>

          <Link
            href="/"
            className="mt-4 text-[13px] text-gray-500 hover:text-gray-700 transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-[24px] font-extrabold tracking-tight text-gray-900">
          업체 회원가입
        </h1>
        <p className="mt-1.5 text-[14px] text-gray-500">
          청소 업체를 등록하고 매칭 서비스를 시작하세요
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* 섹션: 담당자 정보 */}
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[11px] font-bold text-white">
            1
          </div>
          <span className="text-[14px] font-semibold text-gray-900">
            담당자 정보
          </span>
        </div>

        <Input
          label="담당자 이름"
          placeholder="홍길동"
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="이메일"
          type="email"
          placeholder="company@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="전화번호"
          type="tel"
          placeholder="01012345678"
          error={errors.phone?.message}
          {...register("phone")}
        />

        <Input
          label="비밀번호"
          type="password"
          placeholder="대소문자, 숫자, 특수문자 포함 8자 이상"
          error={errors.password?.message}
          {...register("password")}
        />

        <Input
          label="비밀번호 확인"
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {/* 구분선 */}
        <div className="my-2 h-px bg-gray-200" />

        {/* 섹션: 업체 정보 */}
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[11px] font-bold text-white">
            2
          </div>
          <span className="text-[14px] font-semibold text-gray-900">
            업체 정보
          </span>
        </div>

        <Input
          label="상호명"
          placeholder="클리어리 청소"
          error={errors.businessName?.message}
          {...register("businessName")}
        />

        <Input
          label="사업자등록번호"
          placeholder="123-45-67890"
          error={errors.businessNumber?.message}
          {...register("businessNumber")}
        />

        <Input
          label="대표자명"
          placeholder="홍길동"
          error={errors.representative?.message}
          {...register("representative")}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-800">
            주소 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={addressValue || ""}
              placeholder="주소를 검색해주세요"
              className={cn(
                "h-[44px] flex-1 rounded-lg border px-3.5 text-[14px] bg-gray-50 cursor-default",
                "placeholder:text-gray-400",
                errors.address
                  ? "border-red-400"
                  : "border-gray-200"
              )}
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
            <p className="text-[12px] text-red-500">
              {errors.address.message}
            </p>
          )}
        </div>

        <Input
          label="상세주소"
          placeholder="101호 (선택)"
          error={errors.detailAddress?.message}
          {...register("detailAddress")}
        />

        {/* 구분선 */}
        <div className="my-2 h-px bg-gray-200" />

        {/* 섹션: 서비스 정보 */}
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[11px] font-bold text-white">
            3
          </div>
          <span className="text-[14px] font-semibold text-gray-900">
            서비스 정보 <span className="text-[12px] font-normal text-gray-400">(선택)</span>
          </span>
        </div>

        {/* 전문분야 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-800">
            전문분야
          </label>
          <div className="flex flex-wrap gap-2">
            {SPECIALTY_OPTIONS.map((spec) => {
              const isSelected = selectedSpecialties.includes(spec);
              return (
                <button
                  key={spec}
                  type="button"
                  onClick={() => {
                    const current = selectedSpecialties;
                    const next = isSelected
                      ? current.filter((s) => s !== spec)
                      : [...current, spec];
                    setValue("specialties", next);
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[13px] transition-colors",
                    isSelected
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                  )}
                >
                  {spec}
                </button>
              );
            })}
          </div>
        </div>

        {/* 서비스 가능 지역 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-800">
            서비스 가능 지역
          </label>
          <div className="flex flex-wrap gap-2">
            {REGION_OPTIONS.map((region) => {
              const isSelected = selectedAreas.includes(region);
              return (
                <button
                  key={region}
                  type="button"
                  onClick={() => {
                    const current = selectedAreas;
                    const next = isSelected
                      ? current.filter((a) => a !== region)
                      : [...current, region];
                    setValue("serviceAreas", next);
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[13px] transition-colors",
                    isSelected
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                  )}
                >
                  {region}
                </button>
              );
            })}
          </div>
        </div>

        {/* 업체 소개 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-800">
            업체 소개
          </label>
          <textarea
            placeholder="업체를 소개해주세요 (경력, 강점, 서비스 특징 등)"
            rows={3}
            className={cn(
              "w-full rounded-lg border px-3.5 py-3 text-[14px] transition-colors resize-none",
              "placeholder:text-gray-400",
              "border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 focus:outline-none"
            )}
            {...register("description")}
          />
        </div>

        {/* 가격 범위 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-800">
            예상 가격 범위 (원)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="최소 가격"
              className="h-[44px] flex-1 rounded-lg border border-gray-200 px-3.5 text-[14px] placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 focus:outline-none"
              {...register("minPrice")}
            />
            <span className="text-gray-400">~</span>
            <input
              type="number"
              placeholder="최대 가격"
              className="h-[44px] flex-1 rounded-lg border border-gray-200 px-3.5 text-[14px] placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 focus:outline-none"
              {...register("maxPrice")}
            />
          </div>
        </div>

        {/* 약관 동의 */}
        <div className="mt-1">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              className={cn(
                "mt-0.5 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer",
                errors.agreeTerms && "border-red-500"
              )}
              {...register("agreeTerms")}
            />
            <span className="text-[13px] leading-snug text-gray-600">
              <Link
                href="/terms"
                className="underline hover:text-gray-900"
                target="_blank"
              >
                이용약관
              </Link>
              {" "}및{" "}
              <Link
                href="/privacy"
                className="underline hover:text-gray-900"
                target="_blank"
              >
                개인정보처리방침
              </Link>
              에 동의합니다
            </span>
          </label>
          {errors.agreeTerms && (
            <p className="mt-1 text-[12px] text-red-500">
              {errors.agreeTerms.message}
            </p>
          )}
        </div>

        {serverError && (
          <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-[13px] text-red-600">
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 flex h-[46px] w-full items-center justify-center rounded-lg bg-gray-900 text-[14px] font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <svg
              className="h-5 w-5 animate-spin text-white"
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
            "업체 가입 신청하기"
          )}
        </button>
      </form>

      <p className="mt-7 text-center text-[13px] text-gray-500">
        일반 회원으로 가입하시겠어요?{" "}
        <Link
          href="/register"
          className="font-semibold text-gray-900 hover:underline"
        >
          일반 회원가입
        </Link>
      </p>

      <p className="mt-2 text-center text-[13px] text-gray-500">
        이미 계정이 있으신가요?{" "}
        <Link
          href="/login"
          className="font-semibold text-gray-900 hover:underline"
        >
          로그인
        </Link>
      </p>
    </>
  );
}
