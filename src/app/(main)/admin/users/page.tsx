"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

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
      USER: "bg-gray-100 text-gray-700",
      COMPANY: "bg-blue-50 text-blue-700",
      ADMIN: "bg-red-50 text-red-700",
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
    <div>
      <h1 className="text-xl font-bold text-gray-900">사용자 관리</h1>
      <p className="mt-1 text-sm text-gray-500">
        전체 사용자 목록을 관리합니다.
      </p>

      {/* 검색 + 필터 */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <input
            type="text"
            placeholder="이름 또는 이메일로 검색..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none focus:border-gray-400"
          />
          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-gray-800"
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
          className="rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none"
        >
          <option value="">전체 역할</option>
          <option value="USER">일반</option>
          <option value="COMPANY">업체</option>
          <option value="ADMIN">관리자</option>
        </select>
      </div>

      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
        </div>
      ) : (
        <>
          <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">이름</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">이메일</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">전화번호</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">역할</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">상태</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">가입일</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                        사용자가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-50 last:border-0">
                        <td className="px-4 py-3 text-[13px] font-medium text-gray-900">
                          {user.name}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-600">
                          {user.phone || "-"}
                        </td>
                        <td className="px-4 py-3">{roleBadge(user.role)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold",
                              user.isActive
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            )}
                          >
                            {user.isActive ? "활성" : "비활성"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString("ko-KR")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            <Link
                              href={`/admin/users/${user.id}`}
                              className="rounded-md border border-gray-200 px-2.5 py-1 text-[11px] font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                            >
                              상세
                            </Link>
                            {user.role !== "ADMIN" && (
                              <button
                                onClick={() => handleToggleActive(user.id)}
                                disabled={togglingId === user.id}
                                className={cn(
                                  "rounded-md px-2.5 py-1 text-[11px] font-semibold text-white transition-colors disabled:opacity-50",
                                  user.isActive
                                    ? "bg-gray-500 hover:bg-gray-600"
                                    : "bg-green-600 hover:bg-green-700"
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
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
              >
                이전
              </button>
              <span className="text-[13px] text-gray-500">
                {page} / {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
