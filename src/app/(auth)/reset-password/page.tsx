"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import api from "@/lib/api";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "비밀번호는 최소 8자 이상이어야 합니다")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        "대문자, 소문자, 숫자, 특수문자(@$!%*?&)를 각각 1개 이상 포함해야 합니다"
      ),
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력해주세요"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // 토큰이 없는 경우
  if (!token) {
    return (
      <motion.div variants={stagger} initial="hidden" animate="show">
        <motion.div variants={fadeUp} className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <svg
              className="h-6 w-6 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-[24px] font-extrabold tracking-tight text-[#141412]">
            잘못된 접근입니다
          </h1>
          <p className="mt-1.5 text-[14px] text-[#72706a]">
            유효한 비밀번호 재설정 링크가 아닙니다. 비밀번호 찾기를 다시
            진행해주세요.
          </p>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Link
            href="/forgot-password"
            className="press-scale flex h-[46px] w-full items-center justify-center rounded-lg text-[14px] font-semibold text-[#f5f3ee] transition-colors hover:bg-[#235840]"
            style={{ backgroundColor: "#2d6a4f", color: "#f5f3ee" }}
          >
            비밀번호 찾기
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  // 비밀번호 변경 성공
  if (isSuccess) {
    return (
      <motion.div variants={stagger} initial="hidden" animate="show">
        <motion.div variants={fadeUp} className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#eef7f3]">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#2d6a4f"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-[24px] font-extrabold tracking-tight text-[#141412]">
            비밀번호가 변경되었습니다
          </h1>
          <p className="mt-1.5 text-[14px] text-[#72706a]">
            새 비밀번호로 로그인해주세요.
          </p>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Link
            href="/login"
            className="press-scale flex h-[46px] w-full items-center justify-center rounded-lg text-[14px] font-semibold transition-colors hover:bg-[#235840]"
            style={{ backgroundColor: "#2d6a4f", color: "#f5f3ee" }}
          >
            로그인하기
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  // 비밀번호 재설정 폼
  const onSubmit = async (data: ResetPasswordForm) => {
    setServerError("");
    try {
      await api.post("/auth/reset-password", {
        token,
        password: data.password,
      });
      setIsSuccess(true);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "비밀번호 변경에 실패했습니다. 잠시 후 다시 시도해주세요.";
      setServerError(message);
    }
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-[24px] font-extrabold tracking-tight text-[#141412]">
          새 비밀번호 설정
        </h1>
        <p className="mt-1.5 text-[14px] text-[#72706a]">
          새로운 비밀번호를 입력해주세요.
        </p>
      </motion.div>

      <motion.form
        variants={fadeUp}
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <Input
          label="새 비밀번호"
          type="password"
          placeholder="대소문자, 숫자, 특수문자 포함 8자 이상"
          error={errors.password?.message}
          {...register("password")}
        />

        <Input
          label="비밀번호 확인"
          type="password"
          placeholder="비밀번호를 다시 입력해주세요"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {serverError && (
          <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-[13px] text-red-600">
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="press-scale mt-1 flex h-[46px] w-full items-center justify-center rounded-lg text-[14px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#235840]"
          style={{ backgroundColor: "#2d6a4f", color: "#f5f3ee" }}
        >
          {isSubmitting ? (
            <svg
              className="h-5 w-5 animate-spin"
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
            "비밀번호 변경"
          )}
        </button>
      </motion.form>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <svg
            className="h-6 w-6 animate-spin text-[#72706a]"
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
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
