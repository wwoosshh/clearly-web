"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface DashboardStats {
  totalUsers: number;
  totalCompanies: number;
  pendingCompanies: number;
  totalMatchings: number;
}

const statCards = [
  { key: "totalUsers" as const, label: "전체 사용자", color: "bg-blue-50 text-blue-700" },
  { key: "totalCompanies" as const, label: "전체 업체", color: "bg-green-50 text-green-700" },
  { key: "pendingCompanies" as const, label: "승인 대기", color: "bg-amber-50 text-amber-700" },
  { key: "totalMatchings" as const, label: "전체 매칭", color: "bg-purple-50 text-purple-700" },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await api.get("/admin/dashboard");
        setStats(data.data);
      } catch {
        // 에러 무시
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900">대시보드</h1>
      <p className="mt-1 text-sm text-gray-500">서비스 전체 현황을 확인하세요.</p>

      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
        </div>
      ) : stats ? (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.key}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <p className="text-[12px] font-medium text-gray-500">
                {card.label}
              </p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {stats[card.key].toLocaleString()}
              </p>
              <span
                className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${card.color}`}
              >
                {card.label}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 text-center text-sm text-gray-500">
          데이터를 불러올 수 없습니다.
        </div>
      )}
    </div>
  );
}
