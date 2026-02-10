"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { Spinner } from "@/components/ui/Spinner";
import api from "@/lib/api";
import { uploadImage } from "@/lib/upload";

interface FormData {
  name: string;
  phone: string;
  profileImage: string;
}

export default function UserEditPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState<FormData>({ name: "", phone: "", profileImage: "" });
  const [originalForm, setOriginalForm] = useState<FormData>({ name: "", phone: "", profileImage: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      const loaded: FormData = {
        name: user.name || "",
        phone: user.phone || "",
        profileImage: user.profileImage || "",
      };
      setForm(loaded);
      setOriginalForm(loaded);
      setIsLoading(false);
    }
  }, [user]);

  const hasChanges = JSON.stringify(form) !== JSON.stringify(originalForm);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await uploadImage(file, "profiles");
      setForm((prev) => ({ ...prev, profileImage: result.url }));
    } catch {
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    try {
      const patch: Record<string, string> = {};
      if (form.name !== originalForm.name) patch.name = form.name;
      if (form.phone !== originalForm.phone) patch.phone = form.phone;
      if (form.profileImage !== originalForm.profileImage) patch.profileImage = form.profileImage;

      await api.patch("/users/me", patch);
      setUser({ ...user!, ...patch });
      alert("저장되었습니다.");
      router.push("/mypage");
    } catch {
      alert("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const getInitial = (name?: string) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  if (!user || user.role === "COMPANY") {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
        <p className="text-[15px] text-gray-500">일반 회원만 접근할 수 있습니다.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 flex justify-center">
        <Spinner size="lg" className="text-gray-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10">
      <Link href="/mypage" className="mb-6 flex items-center gap-1 text-[14px] text-gray-500 hover:text-gray-700">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        마이페이지
      </Link>

      <h1 className="text-[24px] font-bold tracking-tight text-gray-900">내 정보 수정</h1>
      <p className="mt-1.5 text-[15px] text-gray-500">프로필 정보를 수정합니다</p>

      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
        {/* 프로필 이미지 */}
        <div className="flex flex-col items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="relative flex h-[120px] w-[120px] items-center justify-center rounded-full bg-gray-900 text-[36px] font-bold text-white overflow-hidden group"
          >
            {form.profileImage ? (
              <img
                src={form.profileImage}
                alt="프로필"
                className="h-full w-full object-cover"
              />
            ) : (
              getInitial(form.name)
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              {isUploading ? (
                <svg className="h-6 w-6 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              )}
            </div>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="mt-2 text-[13px] font-medium text-gray-500 hover:text-gray-700"
          >
            {isUploading ? "업로드 중..." : "사진 변경"}
          </button>
        </div>

        {/* 입력 필드 */}
        <div className="mt-8 space-y-5">
          <div>
            <label className="text-[13px] font-medium text-gray-700 block mb-1.5">이름</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-[14px] placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-gray-700 block mb-1.5">전화번호</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="010-0000-0000"
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-[14px] placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-gray-700 block mb-1.5">이메일</label>
            <p className="rounded-lg border border-gray-100 bg-gray-50 px-3.5 py-2.5 text-[14px] text-gray-400">
              {user.email}
            </p>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="mt-8">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="flex h-[50px] w-full items-center justify-center rounded-xl bg-gray-900 text-[15px] font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "저장중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
