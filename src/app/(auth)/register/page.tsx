"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import api from "@/lib/api";

const registerSchema = z
  .object({
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
    agreeTerms: z.literal(true, {
      error: "필수 약관에 동의해주세요",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

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
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      agreeTerms: undefined,
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setServerError("");
    try {
      const { data: res } = await api.post("/auth/register", {
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone,
      });

      const { user, tokens } = res.data;

      // accessToken만 localStorage에 저장 (refreshToken은 메모리 전용)
      localStorage.setItem("accessToken", tokens.accessToken);

      useAuthStore.setState({
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken, // 메모리에만 보관
        isAuthenticated: true,
        isInitialized: true,
      });

      router.push("/");
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "회원가입에 실패했습니다. 다시 시도해주세요.";
      setServerError(message);
    }
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {/* Heading */}
      <motion.div variants={fadeUp} className="mb-8">
        <h1
          className="text-[28px] font-extrabold tracking-tight"
          style={{ color: "#141412" }}
        >
          회원가입
        </h1>
        <p className="mt-1.5 text-[14px]" style={{ color: "#72706a" }}>
          계정을 만들고 이사청소 매칭을 시작하세요
        </p>
      </motion.div>

      {/* Social Signup — icon-only */}
      <motion.div variants={fadeUp} className="flex gap-2.5">
        {[
          {
            id: "kakao",
            bg: "#FEE500",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#191919">
                <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.722 1.8 5.108 4.509 6.458l-.96 3.558c-.08.296.254.532.51.36l4.243-2.84c.554.072 1.12.11 1.698.11 5.523 0 10-3.463 10-7.646C22 6.463 17.523 3 12 3z" />
              </svg>
            ),
          },
          {
            id: "naver",
            bg: "#03C75A",
            icon: (
              <svg width="14" height="14" viewBox="0 0 20 20" fill="#fff">
                <path d="M13.57 10.7L6.14 0H0v20h6.43V9.3L13.86 20H20V0h-6.43v10.7z" />
              </svg>
            ),
          },
          {
            id: "google",
            bg: "#FFFFFF",
            border: true,
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            ),
          },
        ].map((provider) => (
          <button
            key={provider.id}
            type="button"
            className="press-scale flex h-[46px] flex-1 items-center justify-center rounded-lg transition-opacity hover:opacity-90"
            style={{
              backgroundColor: provider.bg,
              border: provider.border ? "1px solid #e2ddd6" : "none",
            }}
            onClick={() => {
              window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/oauth/${provider.id}`;
            }}
          >
            {provider.icon}
          </button>
        ))}
      </motion.div>

      {/* Divider */}
      <motion.div variants={fadeUp} className="my-7 flex items-center gap-4">
        <div className="h-px flex-1" style={{ backgroundColor: "#e2ddd6" }} />
        <span className="text-[12px] font-medium" style={{ color: "#b0aca6" }}>
          이메일로 가입
        </span>
        <div className="h-px flex-1" style={{ backgroundColor: "#e2ddd6" }} />
      </motion.div>

      {/* Form */}
      <motion.form
        variants={fadeUp}
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <Input
          label="이름"
          placeholder="홍길동"
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="이메일"
          type="email"
          placeholder="example@email.com"
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

        {/* Terms Agreement */}
        <div className="mt-1">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              className={cn(
                "mt-0.5 h-4 w-4 rounded cursor-pointer accent-[#2d6a4f]",
                errors.agreeTerms ? "border-red-500" : "border-[#e2ddd6]"
              )}
              {...register("agreeTerms")}
            />
            <span className="text-[13px] leading-snug" style={{ color: "#72706a" }}>
              <Link
                href="/terms"
                className="underline transition-colors hover:text-[#2d6a4f]"
                target="_blank"
              >
                이용약관
              </Link>
              {" "}및{" "}
              <Link
                href="/privacy"
                className="underline transition-colors hover:text-[#2d6a4f]"
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
            <svg
              className="h-5 w-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            "가입하기"
          )}
        </button>
      </motion.form>

      <motion.div variants={fadeUp} className="mt-7 space-y-2 text-center">
        <p className="text-[13px]" style={{ color: "#72706a" }}>
          청소 업체이신가요?{" "}
          <Link
            href="/register/company"
            className="font-semibold text-[#2d6a4f] hover:underline"
          >
            업체 회원가입
          </Link>
        </p>
        <p className="text-[13px]" style={{ color: "#72706a" }}>
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#2d6a4f] hover:underline"
          >
            로그인
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}
