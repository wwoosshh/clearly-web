"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 20 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const { data } = await api.get("/admin/users", { params });
      setUsers(data.data.data);
      setMeta(data.data.meta);
    } catch {
      // 에러 무시
    } finally {
      setIsLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleActive = async (userId: string) => {
    if (!confirm("이 사용자의 활성 상태를 변경하시겠습니까?")) return;
    setTogglingId(userId);
    try {
      await api.patch(`/admin/users/${userId}/toggle-active`);
      await fetchUsers();
    } catch {
      alert("상태 변경에 실패했습니다.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
      USER: "bg-[#f0ede8] text-[#72706a]",
      COMPANY: "bg-[#eef7f3] text-[#2d6a4f]",
      ADMIN: "bg-red-50 text-red-600",
    };
    const labels: Record<string, string> = {
      USER: "일반",
      COMPANY: "업체",
      ADMIN: "관리자",
    };
    return (
      <span
        className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${styles[role] || styles.USER}`}
      >
        {labels[role] || role}
      </span>
    );
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <h1 className="text-xl font-bold text-[#1a1918]">사용자 관리</h1>
        <p className="mt-1 text-sm text-[#72706a]">전체 사용자 목록을 관리합니다.</p>
      </motion.div>

      {/* 검색 + 필터 */}
      <motion.div variants={fadeUp} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#72706a]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="이름 또는 이메일로 검색..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-lg border border-[#e2ddd6] bg-white py-2 pl-9 pr-3 text-[13px] text-[#1a1918] outline-none placeholder:text-[#72706a] focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-[#2d6a4f] px-4 py-2 text-[13px] font-medium text-[#f5f3ee] transition-colors hover:bg-[#4a8c6a]"
          >
            검색
          </button>
        </form>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-[#e2ddd6] bg-white px-3 py-2 text-[13px] text-[#1a1918] outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10"
        >
          <option value="">전체 역할</option>
          <option value="USER">일반</option>
          <option value="COMPANY">업체</option>
          <option value="ADMIN">관리자</option>
        </select>
      </motion.div>

      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e2ddd6] border-t-[#2d6a4f]" />
        </div>
      ) : (
        <>
          <motion.div variants={fadeUp} className="mt-4 overflow-hidden rounded-xl border border-[#e2ddd6] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#e2ddd6] bg-[#f0ede8]">
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">이름</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">이메일</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">전화번호</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">역할</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">상태</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">가입일</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-sm text-[#72706a]">
                        사용자가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-[#e2ddd6] bg-white transition-colors last:border-0 hover:bg-[#f5f3ee]"
                      >
                        <td className="px-4 py-3 text-[13px] font-medium text-[#1a1918]">
                          {user.name}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#72706a]">
                          {user.email}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#72706a]">
                          {user.phone || "-"}
                        </td>
                        <td className="px-4 py-3">{roleBadge(user.role)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold",
                              user.isActive
                                ? "bg-[#eef7f3] text-[#2d6a4f]"
                                : "bg-red-50 text-red-600"
                            )}
                          >
                            {user.isActive ? "활성" : "비활성"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#72706a]">
                          {new Date(user.createdAt).toLocaleDateString("ko-KR")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            <Link
                              href={`/admin/users/${user.id}`}
                              className="rounded-md border border-[#e2ddd6] bg-[#f0ede8] px-2.5 py-1 text-[11px] font-semibold text-[#72706a] transition-colors hover:bg-[#e2ddd6]"
                            >
                              상세
                            </Link>
                            {user.role !== "ADMIN" && (
                              <button
                                onClick={() => handleToggleActive(user.id)}
                                disabled={togglingId === user.id}
                                className={cn(
                                  "rounded-md px-2.5 py-1 text-[11px] font-semibold text-[#f5f3ee] transition-colors disabled:opacity-50",
                                  user.isActive
                                    ? "bg-[#72706a] hover:bg-[#1a1918]"
                                    : "bg-[#2d6a4f] hover:bg-[#4a8c6a]"
                                )}
                              >
                                {user.isActive ? "비활성화" : "활성화"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {meta && meta.totalPages > 1 && (
            <motion.div variants={fadeUp} className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-[#e2ddd6] bg-white px-3 py-1.5 text-[13px] font-medium text-[#72706a] transition-colors hover:bg-[#f0ede8] disabled:opacity-40"
              >
                이전
              </button>
              <span className="text-[13px] text-[#72706a]">
                {page} / {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="rounded-lg border border-[#e2ddd6] bg-white px-3 py-1.5 text-[13px] font-medium text-[#72706a] transition-colors hover:bg-[#f0ede8] disabled:opacity-40"
              >
                다음
              </button>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
