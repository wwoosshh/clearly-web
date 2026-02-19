"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface SubscriptionRecord {
  id: string;
  companyId: string;
  status: string;
  isTrial: boolean;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt: string | null;
  plan: {
    id: string;
    name: string;
    tier: string;
    durationMonths: number;
    dailyEstimateLimit: number;
    price: number;
  };
  company?: {
    id: string;
    businessName: string;
    user?: { id: string; name: string; email: string };
  };
}

interface SubscriptionStats {
  total: number;
  active: number;
  expired: number;
  trial: number;
  byTier: { BASIC: number; PRO: number; PREMIUM: number };
  expiringIn7Days: number;
}

interface PlanOption {
  id: string;
  name: string;
  tier: string;
  durationMonths: number;
  price: number;
  dailyEstimateLimit: number;
}

const statusTabs = [
  { key: "", label: "전체" },
  { key: "ACTIVE", label: "활성" },
  { key: "EXPIRED", label: "만료" },
  { key: "CANCELLED", label: "취소" },
];

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 관리 모달 상태
  const [actionTarget, setActionTarget] = useState<SubscriptionRecord | null>(null);
  const [actionType, setActionType] = useState<"change" | "extend" | "trial" | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [extendMonths, setExtendMonths] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPlans = async () => {
    try {
      const { data } = await api.get("/admin/subscription-plans");
      setPlans(data.data ?? data ?? []);
    } catch {
      /* ignore */
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;

      const [subsRes, statsRes] = await Promise.allSettled([
        api.get("/admin/subscriptions", { params }),
        api.get("/admin/subscriptions/stats"),
      ]);

      if (subsRes.status === "fulfilled") {
        const result = subsRes.value.data?.data ?? subsRes.value.data;
        const list = result?.data ?? (Array.isArray(result) ? result : []);
        setSubscriptions(list);
        setTotalPages(result?.meta?.totalPages ?? 1);
      }

      if (statsRes.status === "fulfilled") {
        const s = statsRes.value.data?.data ?? statsRes.value.data;
        setStats(s);
      }
    } catch {
      setSubscriptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (d?: string | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("ko-KR");
  };

  const tierBadge = (tier: string) => {
    const map: Record<string, { label: string; style: string }> = {
      BASIC: { label: "Basic", style: "bg-gray-100 text-gray-700" },
      PRO: { label: "Pro", style: "bg-blue-50 text-blue-700" },
      PREMIUM: { label: "Premium", style: "bg-gray-900 text-white" },
    };
    const info = map[tier] || { label: tier, style: "bg-gray-100 text-gray-600" };
    return <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", info.style)}>{info.label}</span>;
  };

  const statusBadge = (status: string, isTrial: boolean) => {
    if (isTrial && status === "ACTIVE") {
      return <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700">체험</span>;
    }
    const map: Record<string, { label: string; style: string }> = {
      ACTIVE: { label: "활성", style: "bg-green-50 text-green-700" },
      CANCELLED: { label: "취소", style: "bg-gray-200 text-gray-600" },
      EXPIRED: { label: "만료", style: "bg-red-50 text-red-600" },
      PAST_DUE: { label: "미결제", style: "bg-amber-50 text-amber-700" },
    };
    const info = map[status] || { label: status, style: "bg-gray-100 text-gray-600" };
    return <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", info.style)}>{info.label}</span>;
  };

  // 관리 액션 실행
  const handleAction = async () => {
    if (!actionTarget) return;
    setActionLoading(true);
    try {
      if (actionType === "change" && selectedPlanId) {
        await api.patch(`/admin/companies/${actionTarget.companyId}/subscription`, { planId: selectedPlanId });
      } else if (actionType === "extend") {
        await api.post(`/admin/companies/${actionTarget.companyId}/subscription/extend`, { months: extendMonths });
      } else if (actionType === "trial") {
        await api.post(`/admin/companies/${actionTarget.companyId}/subscription/trial`);
      }
      closeModal();
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "처리에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const openModal = (sub: SubscriptionRecord, type: "change" | "extend" | "trial") => {
    setActionTarget(sub);
    setActionType(type);
    setSelectedPlanId(plans[0]?.id || "");
    setExtendMonths(1);
  };

  const closeModal = () => {
    setActionTarget(null);
    setActionType(null);
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900">구독 관리</h1>
      <p className="mt-1 text-sm text-gray-500">업체 구독 현황을 관리합니다.</p>

      {/* 통계 카드 */}
      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "전체", value: stats.total ?? 0 },
            { label: "활성", value: stats.active ?? 0 },
            { label: "체험", value: stats.trial ?? 0 },
            { label: "Basic", value: stats.byTier?.BASIC ?? 0 },
            { label: "Pro", value: stats.byTier?.PRO ?? 0 },
            { label: "Premium", value: stats.byTier?.PREMIUM ?? 0 },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-gray-200 bg-white p-4 text-center">
              <p className="text-[12px] text-gray-500">{item.label}</p>
              <p className="mt-1 text-xl font-bold text-gray-900">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* 필터 탭 */}
      <div className="mt-6 flex gap-1 rounded-lg bg-gray-100 p-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setStatusFilter(tab.key); setPage(1); }}
            className={cn(
              "flex-1 rounded-md py-2 text-[13px] font-medium transition-colors",
              statusFilter === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 구독 목록 */}
      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
        </div>
      ) : subscriptions.length === 0 ? (
        <p className="mt-12 text-center text-[13px] text-gray-400">구독 내역이 없습니다.</p>
      ) : (
        <>
          <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500">업체명</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500">등급</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500">상태</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500">플랜</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500">일일한도</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500">기간</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500">관리</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/admin/companies/${sub.companyId}`} className="hover:underline">
                        <p className="text-[13px] font-medium text-gray-900">
                          {sub.company?.businessName || "-"}
                        </p>
                      </Link>
                      <p className="text-[11px] text-gray-500">
                        {sub.company?.user?.email || ""}
                      </p>
                    </td>
                    <td className="px-4 py-3">{tierBadge(sub.plan?.tier || "-")}</td>
                    <td className="px-4 py-3">{statusBadge(sub.status, sub.isTrial)}</td>
                    <td className="px-4 py-3 text-[12px] text-gray-700">{sub.plan?.name || "-"}</td>
                    <td className="px-4 py-3 text-[12px] text-gray-700">{sub.plan?.dailyEstimateLimit ?? "-"}건</td>
                    <td className="px-4 py-3 text-[12px] text-gray-500">
                      {formatDate(sub.currentPeriodStart)} ~ {formatDate(sub.currentPeriodEnd)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openModal(sub, "change")}
                          className="rounded-md bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-200"
                        >
                          변경
                        </button>
                        {sub.status === "ACTIVE" && (
                          <button
                            onClick={() => openModal(sub, "extend")}
                            className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100"
                          >
                            연장
                          </button>
                        )}
                        {sub.status !== "ACTIVE" && (
                          <button
                            onClick={() => openModal(sub, "trial")}
                            className="rounded-md bg-purple-50 px-2 py-1 text-[11px] font-medium text-purple-700 hover:bg-purple-100"
                          >
                            체험부여
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-[13px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                이전
              </button>
              <span className="text-[13px] text-gray-500">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-[13px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}

      {/* 관리 모달 */}
      {actionTarget && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={closeModal}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[16px] font-bold text-gray-900">
              {actionType === "change" && "구독 플랜 변경"}
              {actionType === "extend" && "구독 기간 연장"}
              {actionType === "trial" && "무료 체험 부여"}
            </h3>
            <p className="mt-1 text-[13px] text-gray-500">
              {actionTarget.company?.businessName || "업체"}
            </p>

            <div className="mt-4">
              {actionType === "change" && (
                <div>
                  <label className="block text-[13px] font-medium text-gray-700">변경할 플랜</label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-[13px] text-gray-900 focus:border-gray-900 focus:outline-none"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.tier} / {p.price.toLocaleString()}원 / 일일 {p.dailyEstimateLimit}건)
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {actionType === "extend" && (
                <div>
                  <label className="block text-[13px] font-medium text-gray-700">연장 개월 수</label>
                  <select
                    value={extendMonths}
                    onChange={(e) => setExtendMonths(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-[13px] text-gray-900 focus:border-gray-900 focus:outline-none"
                  >
                    {[1, 2, 3, 6, 12].map((m) => (
                      <option key={m} value={m}>{m}개월</option>
                    ))}
                  </select>
                </div>
              )}
              {actionType === "trial" && (
                <p className="rounded-lg bg-purple-50 p-3 text-[13px] text-purple-700">
                  이 업체에 Basic 3개월 무료 체험을 부여합니다.
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="rounded-lg border border-gray-200 px-4 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleAction}
                disabled={actionLoading}
                className="rounded-lg bg-gray-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {actionLoading ? "처리중..." : "확인"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
