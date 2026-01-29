"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/stores/auth.store";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "이메일을 입력해주세요")
    .email("올바른 이메일 형식이 아닙니다"),
  password: z
    .string()
    .min(1, "비밀번호를 입력해주세요"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError("");
    try {
      await login(data);
      router.push("/");
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "이메일 또는 비밀번호가 올바르지 않습니다.";
      setServerError(message);
    }
  };

  const socialProviders = [
    {
      id: "kakao",
      label: "카카오",
      bg: "#FEE500",
      color: "#191919",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#191919">
          <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.722 1.8 5.108 4.509 6.458l-.96 3.558c-.08.296.254.532.51.36l4.243-2.84c.554.072 1.12.11 1.698.11 5.523 0 10-3.463 10-7.646C22 6.463 17.523 3 12 3z" />
        </svg>
      ),
    },
    {
      id: "naver",
      label: "네이버",
      bg: "#03C75A",
      color: "#FFFFFF",
      icon: (
        <svg width="14" height="14" viewBox="0 0 20 20" fill="#fff">
          <path d="M13.57 10.7L6.14 0H0v20h6.43V9.3L13.86 20H20V0h-6.43v10.7z" />
        </svg>
      ),
    },
    {
      id: "google",
      label: "Google",
      bg: "#FFFFFF",
      color: "#333333",
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
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-[24px] font-extrabold tracking-tight text-gray-900">
          로그인
        </h1>
        <p className="mt-1.5 text-[14px] text-gray-500">
          계정에 로그인하여 서비스를 이용하세요
        </p>
      </div>

      {/* Social Login */}
      <div className="flex flex-col gap-2.5">
        {socialProviders.map((provider) => (
          <button
            key={provider.id}
            type="button"
            className="flex h-[46px] w-full items-center justify-center gap-2.5 rounded-lg text-[14px] font-medium transition-opacity hover:opacity-90"
            style={{
              backgroundColor: provider.bg,
              color: provider.color,
              border: provider.border ? "1px solid #e5e7eb" : "none",
            }}
            onClick={() => {
              window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/oauth/${provider.id}`;
            }}
          >
            {provider.icon}
            {provider.label}로 계속하기
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="my-7 flex items-center gap-4">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-[12px] font-medium text-gray-400">또는</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Email Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="이메일"
          type="email"
          placeholder="example@email.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <div>
          <Input
            label="비밀번호"
            type="password"
            placeholder="비밀번호를 입력하세요"
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="mt-1.5 text-right">
            <Link
              href="/forgot-password"
              className="text-[12px] text-gray-500 hover:text-gray-700 transition-colors"
            >
              비밀번호를 잊으셨나요?
            </Link>
          </div>
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
            <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            "로그인"
          )}
        </button>
      </form>

      <p className="mt-7 text-center text-[13px] text-gray-500">
        아직 계정이 없으신가요?{" "}
        <Link
          href="/register"
          className="font-semibold text-gray-900 hover:underline"
        >
          회원가입
        </Link>
      </p>
    </>
  );
}
