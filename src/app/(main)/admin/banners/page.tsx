"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/ui/ImageUpload";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

interface BannerItem {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  bgColor: string;
  linkUrl: string | null;
  linkText: string | null;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 모달 상태
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    bgColor: "#0284C7",
    linkUrl: "",
    linkText: "",
    sortOrder: 0,
    isVisible: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  async function fetchBanners() {
    setIsLoading(true);
    try {
      const { data: res } = await api.get("/banners/admin", { params: { limit: 200 } });
      const payload = res.data ?? res;
      setBanners(payload.data ?? payload ?? []);
    } catch {
      // 에러 무시
    } finally {
      setIsLoading(false);
    }
  }

  function openCreate() {
    setEditingBanner(null);
    setForm({
      title: "",
      subtitle: "",
      imageUrl: "",
      bgColor: "#0284C7",
      linkUrl: "",
      linkText: "",
      sortOrder: 0,
      isVisible: true,
    });
    setShowModal(true);
  }

  function openEdit(banner: BannerItem) {
    setEditingBanner(banner);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle || "",
      imageUrl: banner.imageUrl || "",
      bgColor: banner.bgColor,
      linkUrl: banner.linkUrl || "",
      linkText: banner.linkText || "",
      sortOrder: banner.sortOrder,
      isVisible: banner.isVisible,
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.title) return;
    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        bgColor: form.bgColor || "#0284C7",
        sortOrder: form.sortOrder,
        isVisible: form.isVisible,
      };
      if (form.subtitle) payload.subtitle = form.subtitle;
      if (form.imageUrl) payload.imageUrl = form.imageUrl;
      if (form.linkUrl) payload.linkUrl = form.linkUrl;
      if (form.linkText) payload.linkText = form.linkText;

      if (editingBanner) {
        await api.patch(`/banners/admin/${editingBanner.id}`, payload);
      } else {
        await api.post("/banners/admin", payload);
      }
      setShowModal(false);
      fetchBanners();
    } catch {
      // 에러 무시
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/banners/admin/${id}`);
      fetchBanners();
    } catch {
      // 에러 무시
    }
  }

  async function handleToggleVisible(banner: BannerItem) {
    try {
      await api.patch(`/banners/admin/${banner.id}`, {
        isVisible: !banner.isVisible,
      });
      fetchBanners();
    } catch {
      // 에러 무시
    }
  }

  async function handleMove(banner: BannerItem, direction: "up" | "down") {
    const sorted = [...banners].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((b) => b.id === banner.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const items = [
      { id: sorted[idx].id, sortOrder: sorted[swapIdx].sortOrder },
      { id: sorted[swapIdx].id, sortOrder: sorted[idx].sortOrder },
    ];

    try {
      await api.patch("/banners/admin/reorder", items);
      fetchBanners();
    } catch {
      // 에러 무시
    }
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#141412]">배너 관리</h1>
          <p className="mt-1 text-sm text-[#72706a]">메인페이지 배너를 관리합니다.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-[#0284C7] px-4 py-2 text-sm font-medium text-[#f5f3ee] transition-colors hover:bg-[#0EA5E9]"
        >
          새 배너
        </button>
      </motion.div>

      {/* 테이블 */}
      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e2ddd6] border-t-[#0284C7]" />
        </div>
      ) : banners.length === 0 ? (
        <motion.div variants={fadeUp} className="mt-8 text-center text-sm text-[#72706a]">
          등록된 배너가 없습니다.
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} className="mt-6 overflow-hidden rounded-xl border border-[#e2ddd6] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-[#e2ddd6] bg-[#f0ede8]">
                  <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">배경</th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">제목</th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">링크</th>
                  <th className="px-4 py-3 text-center text-[12px] font-semibold text-[#72706a]">순서</th>
                  <th className="px-4 py-3 text-center text-[12px] font-semibold text-[#72706a]">노출</th>
                  <th className="px-4 py-3 text-right text-[12px] font-semibold text-[#72706a]">관리</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((banner) => (
                  <tr key={banner.id} className="border-b border-[#e2ddd6] last:border-0 hover:bg-[#f5f3ee]">
                    <td className="px-4 py-3">
                      <div
                        className="h-8 w-14 rounded border border-[#e2ddd6]"
                        style={{
                          background: banner.imageUrl
                            ? `url(${banner.imageUrl}) center/cover`
                            : banner.bgColor,
                        }}
                      />
                    </td>
                    <td className="max-w-[200px] px-4 py-3">
                      <p className="truncate text-[13px] font-medium text-[#1a1918]">{banner.title}</p>
                      {banner.subtitle && (
                        <p className="truncate text-[11px] text-[#a8a49c]">{banner.subtitle}</p>
                      )}
                    </td>
                    <td className="max-w-[160px] px-4 py-3">
                      {banner.linkUrl ? (
                        <span className="truncate text-[12px] text-[#0284C7]">{banner.linkText || banner.linkUrl}</span>
                      ) : (
                        <span className="text-[12px] text-[#c4bfb6]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleMove(banner, "up")}
                          className="rounded p-1 text-[#72706a] hover:bg-[#f0ede8] hover:text-[#1a1918]"
                          title="위로"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M3 9L7 5L11 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <span className="text-[12px] text-[#72706a]">{banner.sortOrder}</span>
                        <button
                          onClick={() => handleMove(banner, "down")}
                          className="rounded p-1 text-[#72706a] hover:bg-[#f0ede8] hover:text-[#1a1918]"
                          title="아래로"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleVisible(banner)}
                        className={cn(
                          "inline-block h-5 w-9 rounded-full transition-colors",
                          banner.isVisible ? "bg-[#0284C7]" : "bg-[#e2ddd6]"
                        )}
                      >
                        <span
                          className={cn(
                            "block h-4 w-4 translate-y-[0.5px] rounded-full bg-white shadow transition-transform",
                            banner.isVisible ? "translate-x-[18px]" : "translate-x-[2px]"
                          )}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openEdit(banner)}
                          className="text-[12px] font-medium text-[#0284C7] hover:text-[#0EA5E9]"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(banner.id)}
                          className="text-[12px] font-medium text-red-600 hover:text-red-700"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mx-4 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-lg font-bold text-[#141412]">
              {editingBanner ? "배너 수정" : "새 배너"}
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#72706a]">제목 *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="배너 제목"
                  className="mt-1 w-full rounded-lg border border-[#e2ddd6] px-3 py-2 text-sm text-[#1a1918] outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/10"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#72706a]">부제</label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="배너 부제/설명"
                  className="mt-1 w-full rounded-lg border border-[#e2ddd6] px-3 py-2 text-sm text-[#1a1918] outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/10"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#72706a]">배경색 (CSS)</label>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    type="text"
                    value={form.bgColor}
                    onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                    placeholder="예: #0284C7 또는 linear-gradient(135deg, #0284C7, #1a4030)"
                    className="w-full rounded-lg border border-[#e2ddd6] px-3 py-2 text-sm text-[#1a1918] outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/10"
                  />
                  <div
                    className="h-9 w-12 shrink-0 rounded-lg border border-[#e2ddd6]"
                    style={{ background: form.bgColor }}
                  />
                </div>
              </div>
              <div>
                <ImageUpload
                  maxFiles={1}
                  bucket="banners"
                  value={form.imageUrl ? [form.imageUrl] : []}
                  onChange={(urls) => setForm({ ...form, imageUrl: urls[0] || "" })}
                  label="배경 이미지 (선택)"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#72706a]">링크 URL</label>
                <input
                  type="text"
                  value={form.linkUrl}
                  onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                  placeholder="예: /estimate/request"
                  className="mt-1 w-full rounded-lg border border-[#e2ddd6] px-3 py-2 text-sm text-[#1a1918] outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/10"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#72706a]">링크 텍스트 (CTA 버튼)</label>
                <input
                  type="text"
                  value={form.linkText}
                  onChange={(e) => setForm({ ...form, linkText: e.target.value })}
                  placeholder="예: 견적 요청하기"
                  className="mt-1 w-full rounded-lg border border-[#e2ddd6] px-3 py-2 text-sm text-[#1a1918] outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/10"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[13px] font-medium text-[#72706a]">정렬 순서</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                    className="mt-1 w-full rounded-lg border border-[#e2ddd6] px-3 py-2 text-sm text-[#1a1918] outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/10"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-[13px] text-[#72706a]">
                    <input
                      type="checkbox"
                      checked={form.isVisible}
                      onChange={(e) => setForm({ ...form, isVisible: e.target.checked })}
                      className="h-4 w-4 rounded border-[#e2ddd6] accent-[#0284C7]"
                    />
                    노출
                  </label>
                </div>
              </div>

              {/* 미리보기 */}
              <div>
                <label className="block text-[13px] font-medium text-[#72706a]">미리보기</label>
                <div
                  className="mt-1 relative overflow-hidden rounded-xl px-6 py-7 h-[160px] flex flex-col justify-center"
                  style={{
                    background: form.imageUrl
                      ? `url(${form.imageUrl}) center/cover`
                      : form.bgColor || "#0284C7",
                  }}
                >
                  {form.imageUrl && (
                    <div className="absolute inset-0 bg-black/30" />
                  )}
                  <p className="relative text-[19px] font-bold leading-snug text-white">
                    {form.title || "배너 제목"}
                  </p>
                  <p className="relative mt-1.5 text-[13px] text-white/55">
                    {form.subtitle || "배너 부제"}
                  </p>
                  {form.linkText && (
                    <span className="relative mt-4 inline-flex h-[34px] w-fit items-center rounded-lg px-4 text-[12px] font-semibold text-white"
                      style={{ background: "rgba(255,255,255,0.18)" }}
                    >
                      {form.linkText}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1.5">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-[#e2ddd6] bg-[#f0ede8] px-4 py-2 text-sm font-medium text-[#1a1918] hover:bg-[#e2ddd6]"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-lg bg-[#0284C7] px-4 py-2 text-sm font-medium text-[#f5f3ee] hover:bg-[#0EA5E9] disabled:opacity-50"
              >
                {isSaving ? "저장 중..." : "저장"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
