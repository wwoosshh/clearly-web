"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/Input";
import api from "@/lib/api";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "이메일을 입력해주세요")
    .email("올바른 이메일 형식이 아닙니다"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

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
  show: { transition: { staggerChildren: 0.08 } },
};

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setServerError("");
    try {
      await api.post("/auth/forgot-password", data);
      setIsSuccess(true);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      setServerError(message);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: "#eef7f3" }}
        >
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
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h1
          className="text-[24px] font-extrabold tracking-tight"
          style={{ color: "#141412" }}
        >
          이메일을 확인해주세요
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed" style={{ color: "#72706a" }}>
          입력하신 이메일 주소로 비밀번호 재설정 링크를 발송했습니다.
          이메일을 확인하고 링크를 클릭하여 비밀번호를 재설정해주세요.
        </p>
        <p className="mt-3 text-[12px]" style={{ color: "#a8a49c" }}>
          이메일이 도착하지 않았다면 스팸 폴더를 확인해주세요.
        </p>

        <Link
          href="/login"
          className="press-scale mt-8 flex h-[48px] w-full items-center justify-center rounded-lg text-[14px] font-semibold text-[#f5f3ee] transition-colors hover:bg-[#235840]"
          style={{ backgroundColor: "#2d6a4f" }}
        >
          로그인으로 돌아가기
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="mb-8">
        <h1
          className="text-[28px] font-extrabold tracking-tight"
          style={{ color: "#141412" }}
        >
          비밀번호 찾기
        </h1>
        <p className="mt-1.5 text-[14px]" style={{ color: "#72706a" }}>
          가입 시 사용한 이메일을 입력하시면 비밀번호 재설정 링크를
          보내드립니다.
        </p>
      </motion.div>

      <motion.form
        variants={fadeUp}
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <Input
          label="이메일"
          type="email"
          placeholder="example@email.com"
          error={errors.email?.message}
          {...register("email")}
        />

        {serverError && (
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600">
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="press-scale mt-1 flex h-[48px] w-full items-center justify-center rounded-lg text-[14px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#2d6a4f", color: "#f5f3ee" }}
        >
          {isSubmitting ? (
            <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            "재설정 링크 발송"
          )}
        </button>
      </motion.form>

      <motion.p
        variants={fadeUp}
        className="mt-7 text-center text-[13px]"
        style={{ color: "#72706a" }}
      >
        비밀번호가 기억나셨나요?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#2d6a4f] hover:underline"
        >
          로그인
        </Link>
      </motion.p>
    </motion.div>
  );
}
