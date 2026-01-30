"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      try {
        const { data } = await api.get("/admin/users", {
          params: { page, limit: 20 },
        });
        setUsers(data.data.data);
        setMeta(data.data.meta);
      } catch {
        // 에러 무시
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, [page]);

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

      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                      이름
                    </th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                      이메일
                    </th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                      전화번호
                    </th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                      역할
                    </th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                      상태
                    </th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                      가입일
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-sm text-gray-400"
                      >
                        사용자가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-50 last:border-0"
                      >
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
                            className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              user.isActive
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {user.isActive ? "활성" : "비활성"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString("ko-KR")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
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
