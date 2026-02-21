"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

export default function AdminCompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  const [company, setCompany] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<"matchings" | "reviews" | "estimates" | "subscription">("matchings");
  const [actionLoading, setActionLoading] = useState(false);
  const [metrics, setMetrics] = useState<{
    conversionRate: number;
    cancellationRate: number;
    repeatCustomerRate: number;
    disputeRate: number;
  } | null>(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchCompany = async () => {
    try {
      const [companyRes, metricsRes] = await Promise.allSettled([
        api.get(`/admin/companies/${companyId}`),
        api.get(`/companies/${companyId}/metrics`),
      ]);
      if (!mountedRef.current) return;
      if (companyRes.status === "fulfilled") {
        const compData = companyRes.value.data.data;
        setCompany(compData);
      } else {
        throw new Error("fetch failed");
      }
      if (metricsRes.status === "fulfilled") {
        const m = metricsRes.value.data?.data ?? metricsRes.value.data;
        if (m && m.conversionRate !== undefined) setMetrics(m);
      }
    } catch {
      if (mountedRef.current) {
        alert("업체 정보를 불러올 수 없습니다.");
        router.push("/admin/companies");
      }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!companyId) return;
    fetchCompany();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const handleApprove = async () => {
    if (!confirm("이 업체를 승인하시겠습니까?")) return;
    setActionLoading(true);
    try {
      await api.patch(`/admin/companies/${companyId}/approve`);
      await fetchCompany();
    } catch {
      alert("승인 처리에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt("반려 사유를 입력해주세요:");
    if (!reason) return;
    setActionLoading(true);
    try {
      await api.patch(`/admin/companies/${companyId}/reject`, { rejectionReason: reason });
      await fetchCompany();
    } catch {
      alert("반려 처리에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async () => {
    const reason = prompt("정지 사유를 입력해주세요:");
    if (!reason) return;
    setActionLoading(true);
    try {
      await api.patch(`/admin/companies/${companyId}/suspend`, { reason });
      await fetchCompany();
    } catch {
      alert("정지 처리에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!confirm("이 업체의 정지를 해제하시겠습니까?")) return;
    setActionLoading(true);
    try {
      await api.patch(`/admin/companies/${companyId}/reactivate`);
      await fetchCompany();
    } catch {
      alert("정지 해제에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString("ko-KR") : "-";

  const statusBadge = (s: string) => {
    const map: Record<string, { label: string; style: string }> = {
      PENDING: { label: "대기", style: "bg-[#fef9ee] text-[#b45309]" },
      APPROVED: { label: "승인", style: "bg-[#eef7f3] text-[#2d6a4f]" },
      REJECTED: { label: "반려", style: "bg-red-50 text-red-600" },
      SUSPENDED: { label: "정지", style: "bg-red-50 text-red-600" },
    };
    const info = map[s] || { label: s, style: "bg-[#f0ede8] text-[#72706a]" };
    return <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", info.style)}>{info.label}</span>;
  };

  const matchingStatusBadge = (status: string) => {
    const map: Record<string, { label: string; style: string }> = {
      REQUESTED: { label: "요청", style: "bg-[#fef9ee] text-[#b45309]" },
      ACCEPTED: { label: "수락", style: "bg-[#eef7f3] text-[#2d6a4f]" },
      COMPLETED: { label: "완료", style: "bg-[#eef7f3] text-[#2d6a4f]" },
      CANCELLED: { label: "취소", style: "bg-red-50 text-red-600" },
      REJECTED: { label: "거절", style: "bg-red-50 text-red-600" },
    };
    const info = map[status] || { label: status, style: "bg-[#f0ede8] text-[#72706a]" };
    return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", info.style)}>{info.label}</span>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e2ddd6] border-t-[#2d6a4f]" />
      </div>
    );
  }

  if (!company) return null;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.button
        variants={fadeUp}
        onClick={() => router.push("/admin/companies")}
        className="flex items-center gap-1.5 text-[13px] text-[#72706a] hover:text-[#1a1918] transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        업체 목록으로
      </motion.button>

      {/* 업체 정보 카드 */}
      <motion.div variants={fadeUp} className="mt-4 rounded-xl border border-[#e2ddd6] bg-white p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#141412]">{company.businessName}</h1>
            <p className="mt-1 text-[13px] text-[#72706a]">
              {company.user?.name} ({company.user?.email})
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {statusBadge(company.verificationStatus)}
            <span className={cn(
              "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
              company.isActive ? "bg-[#eef7f3] text-[#2d6a4f]" : "bg-red-50 text-red-600"
            )}>
              {company.isActive ? "활성" : "비활성"}
            </span>
          </div>
        </div>

        {/* 작업 버튼 */}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-[#e2ddd6] pt-4">
          {company.verificationStatus === "PENDING" && (
            <>
              <button onClick={handleApprove} disabled={actionLoading} className="rounded-lg bg-[#2d6a4f] px-4 py-2 text-[13px] font-medium text-[#f5f3ee] hover:bg-[#4a8c6a] disabled:opacity-50">승인</button>
              <button onClick={handleReject} disabled={actionLoading} className="rounded-lg bg-red-600 px-4 py-2 text-[13px] font-medium text-white hover:bg-red-700 disabled:opacity-50">반려</button>
            </>
          )}
          {company.verificationStatus === "APPROVED" && (
            <button onClick={handleSuspend} disabled={actionLoading} className="rounded-lg bg-red-600 px-4 py-2 text-[13px] font-medium text-white hover:bg-red-700 disabled:opacity-50">정지</button>
          )}
          {company.verificationStatus === "SUSPENDED" && (
            <button onClick={handleReactivate} disabled={actionLoading} className="rounded-lg bg-[#2d6a4f] px-4 py-2 text-[13px] font-medium text-[#f5f3ee] hover:bg-[#4a8c6a] disabled:opacity-50">정지해제</button>
          )}
        </div>
      </motion.div>

      {/* 사업 정보 패널 */}
      <motion.div variants={fadeUp} className="mt-4 rounded-xl border border-[#e2ddd6] bg-white p-4 sm:p-6">
        <h2 className="text-[15px] font-semibold text-[#141412]">사업 정보</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 text-[13px] sm:grid-cols-2">
          <div>
            <p className="text-[#72706a]">사업자번호</p>
            <p className="mt-0.5 font-medium text-[#1a1918]">{company.businessNumber || "-"}</p>
          </div>
          <div>
            <p className="text-[#72706a]">대표자</p>
            <p className="mt-0.5 font-medium text-[#1a1918]">{company.representative || "-"}</p>
          </div>
          <div>
            <p className="text-[#72706a]">주소</p>
            <p className="mt-0.5 font-medium text-[#1a1918]">{company.address || "-"} {company.detailAddress || ""}</p>
          </div>
          <div>
            <p className="text-[#72706a]">서비스 지역</p>
            <p className="mt-0.5 font-medium text-[#1a1918]">
              {Array.isArray(company.serviceAreas) ? company.serviceAreas.join(", ") : "-"}
            </p>
          </div>
          <div>
            <p className="text-[#72706a]">전문분야</p>
            <p className="mt-0.5 font-medium text-[#1a1918]">
              {Array.isArray(company.specialties) ? company.specialties.join(", ") : "-"}
            </p>
          </div>
          <div>
            <p className="text-[#72706a]">가격대</p>
            <p className="mt-0.5 font-medium text-[#1a1918]">
              {company.minPrice ? `${company.minPrice.toLocaleString()}원` : "-"} ~ {company.maxPrice ? `${company.maxPrice.toLocaleString()}원` : "-"}
            </p>
          </div>
          <div>
            <p className="text-[#72706a]">평점 / 리뷰</p>
            <p className="mt-0.5 font-medium text-[#1a1918]">
              {Number(company.averageRating || 0).toFixed(1)} ({company.totalReviews || 0}개)
            </p>
          </div>
          <div>
            <p className="text-[#72706a]">승인일</p>
            <p className="mt-0.5 font-medium text-[#1a1918]">{formatDate(company.approvedAt)}</p>
          </div>
        </div>
        {company.description && (
          <div className="mt-4">
            <p className="text-[13px] text-[#72706a]">소개글</p>
            <p className="mt-1 whitespace-pre-wrap rounded-lg bg-[#f5f3ee] p-3 text-[13px] text-[#1a1918]">
              {company.description}
            </p>
          </div>
        )}
        {company.rejectionReason && (
          <div className="mt-4">
            <p className="text-[13px] text-red-500">반려/정지 사유</p>
            <p className="mt-1 rounded-lg bg-red-50 p-3 text-[13px] text-red-700">
              {company.rejectionReason}
            </p>
          </div>
        )}
      </motion.div>

      {/* 성과 지표 */}
      {metrics && (
        <motion.div variants={fadeUp} className="mt-4 rounded-xl border border-[#e2ddd6] bg-white p-4 sm:p-6">
          <h2 className="text-[15px] font-semibold text-[#141412]">성과 지표</h2>
          <div className="mt-3 grid grid-cols-2 gap-4 text-[13px] sm:grid-cols-4">
            {[
              { label: "견적전환율", value: metrics.conversionRate, warn: false },
              { label: "취소율", value: metrics.cancellationRate, warn: metrics.cancellationRate > 15 },
              { label: "재이용률", value: metrics.repeatCustomerRate, warn: false },
              { label: "분쟁발생률", value: metrics.disputeRate, warn: metrics.disputeRate > 15 },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[#72706a]">{item.label}</p>
                <p className={cn(
                  "mt-0.5 text-lg font-bold",
                  item.warn ? "text-red-500" : "text-[#141412]"
                )}>
                  {item.value.toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 탭 */}
      <motion.div variants={fadeUp} className="mt-6 flex gap-1 rounded-lg bg-[#f0ede8] p-1">
        {(["matchings", "reviews", "estimates", "subscription"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-md py-2 text-[13px] font-medium transition-colors",
              tab === t ? "bg-white text-[#141412] shadow-sm" : "text-[#72706a] hover:text-[#1a1918]"
            )}
          >
            {{ matchings: "매칭내역", reviews: "리뷰", estimates: "견적내역", subscription: "구독" }[t]}
          </button>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="mt-4">
        {tab === "matchings" && (
          <div>
            {company.matchings?.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-[#72706a]">매칭 내역이 없습니다.</p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-[#e2ddd6] bg-white">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#e2ddd6] bg-[#f0ede8]">
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-[#72706a]">사용자</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-[#72706a]">청소유형</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-[#72706a]">상태</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-[#72706a]">가격</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-[#72706a]">날짜</th>
                    </tr>
                  </thead>
                  <tbody>
                    {company.matchings?.map((m: any) => (
                      <tr key={m.id} className="border-b border-[#e2ddd6] last:border-0">
                        <td className="px-3 py-2.5 text-[12px] text-[#1a1918]">{m.user?.name || "-"}</td>
                        <td className="px-3 py-2.5 text-[12px] text-[#72706a]">{m.cleaningType}</td>
                        <td className="px-3 py-2.5">{matchingStatusBadge(m.status)}</td>
                        <td className="px-3 py-2.5 text-[12px] text-[#1a1918]">{m.estimatedPrice?.toLocaleString() || "-"}원</td>
                        <td className="px-3 py-2.5 text-[12px] text-[#72706a]">{formatDate(m.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "reviews" && (
          <div className="space-y-2">
            {company.reviews?.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-[#72706a]">리뷰가 없습니다.</p>
            ) : (
              company.reviews?.map((r: any) => (
                <div key={r.id} className="rounded-xl border border-[#e2ddd6] bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[#1a1918]">{r.user?.name || "-"}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-[#72706a]">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        r.isVisible ? "bg-[#eef7f3] text-[#2d6a4f]" : "bg-[#f0ede8] text-[#72706a]"
                      )}>
                        {r.isVisible ? "표시" : "숨김"}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-[12px] text-[#72706a]">{r.content}</p>
                  <p className="mt-1 text-[11px] text-[#72706a]">{formatDate(r.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "estimates" && (
          <div>
            {company.estimates?.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-[#72706a]">견적 내역이 없습니다.</p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-[#e2ddd6] bg-white">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#e2ddd6] bg-[#f0ede8]">
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-[#72706a]">청소유형</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-[#72706a]">주소</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-[#72706a]">견적금액</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-[#72706a]">상태</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-[#72706a]">날짜</th>
                    </tr>
                  </thead>
                  <tbody>
                    {company.estimates?.map((e: any) => (
                      <tr key={e.id} className="border-b border-[#e2ddd6] last:border-0">
                        <td className="px-3 py-2.5 text-[12px] text-[#1a1918]">{e.estimateRequest?.cleaningType || "-"}</td>
                        <td className="px-3 py-2.5 text-[12px] text-[#72706a]">{e.estimateRequest?.address || "-"}</td>
                        <td className="px-3 py-2.5 text-[12px] font-medium text-[#1a1918]">{e.price?.toLocaleString()}원</td>
                        <td className="px-3 py-2.5">
                          <span className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            e.status === "SUBMITTED" ? "bg-[#fef9ee] text-[#b45309]" :
                            e.status === "ACCEPTED" ? "bg-[#eef7f3] text-[#2d6a4f]" :
                            "bg-red-50 text-red-600"
                          )}>
                            {e.status === "SUBMITTED" ? "대기" : e.status === "ACCEPTED" ? "수락" : "거절"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-[12px] text-[#72706a]">{formatDate(e.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "subscription" && (
          <SubscriptionTab companyId={companyId} company={company} onRefresh={fetchCompany} />
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── 구독 관리 탭 ──────────────────────────────────────────
function SubscriptionTab({ companyId, company, onRefresh }: { companyId: string; company: any; onRefresh: () => Promise<void> }) {
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [extendMonths, setExtendMonths] = useState(1);
  const [loading, setLoading] = useState<string | null>(null);

  const sub = company.activeSubscription;
  const history = company.subscriptions || [];
  const stack: any[] = company.subscriptionStack || [];

  /** 사용일수/총일수/남은일수 계산 */
  const calcDays = (h: any) => {
    const start = new Date(h.currentPeriodStart).getTime();
    const end = new Date(h.currentPeriodEnd).getTime();
    const totalDays = Math.max(1, Math.ceil((end - start) / 86400000));

    let usedDays: number;
    if (h.status === "PAUSED" && h.pausedAt) {
      usedDays = Math.ceil((new Date(h.pausedAt).getTime() - start) / 86400000);
    } else if (h.status === "CANCELLED" && h.cancelledAt) {
      usedDays = Math.ceil((new Date(h.cancelledAt).getTime() - start) / 86400000);
    } else if (h.status === "EXPIRED") {
      usedDays = totalDays;
    } else if (h.status === "QUEUED") {
      usedDays = 0;
    } else {
      // ACTIVE
      usedDays = Math.ceil((Date.now() - start) / 86400000);
    }
    usedDays = Math.max(0, Math.min(usedDays, totalDays));
    const remainingDays = totalDays - usedDays;
    return { usedDays, totalDays, remainingDays };
  };

  useEffect(() => {
    api.get("/admin/subscription-plans").then(({ data }) => {
      const list = data.data ?? data ?? [];
      setPlans(list);
      if (list.length > 0) setSelectedPlanId(list[0].id);
    }).catch(() => {});
  }, []);

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString("ko-KR") : "-";

  const handleChangePlan = async () => {
    if (!selectedPlanId) return;
    if (!confirm("이 업체의 구독 플랜을 변경하시겠습니까?")) return;
    setLoading("change");
    try {
      await api.patch(`/admin/companies/${companyId}/subscription`, { planId: selectedPlanId });
      await onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || "플랜 변경에 실패했습니다.");
    } finally {
      setLoading(null);
    }
  };

  const handleExtend = async () => {
    if (!confirm(`구독을 ${extendMonths}개월 연장하시겠습니까?`)) return;
    setLoading("extend");
    try {
      await api.post(`/admin/companies/${companyId}/subscription/extend`, { months: extendMonths });
      await onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || "구독 연장에 실패했습니다.");
    } finally {
      setLoading(null);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string, planName: string) => {
    if (!confirm(`"${planName}" 구독을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;
    setLoading("cancel");
    try {
      await api.delete(`/admin/subscriptions/${subscriptionId}`);
      await onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || "구독 취소에 실패했습니다.");
    } finally {
      setLoading(null);
    }
  };

  const handleGrantTrial = async () => {
    if (!confirm("이 업체에 Basic 3개월 무료 체험을 부여하시겠습니까?")) return;
    setLoading("trial");
    try {
      await api.post(`/admin/companies/${companyId}/subscription/trial`);
      await onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || "무료 체험 부여에 실패했습니다.");
    } finally {
      setLoading(null);
    }
  };

  const subStatusStyle = (status: string) => {
    if (status === "ACTIVE") return "bg-[#eef7f3] text-[#2d6a4f]";
    if (status === "PAUSED") return "bg-[#fef9ee] text-[#b45309]";
    if (status === "QUEUED") return "bg-[#fef9ee] text-[#b45309]";
    if (status === "EXPIRED") return "bg-red-50 text-red-600";
    if (status === "CANCELLED") return "bg-red-50 text-red-600";
    return "bg-[#f0ede8] text-[#72706a]";
  };

  const subStatusLabel = (status: string) => {
    if (status === "ACTIVE") return "활성";
    if (status === "PAUSED") return "일시정지";
    if (status === "QUEUED") return "대기";
    if (status === "EXPIRED") return "만료";
    if (status === "CANCELLED") return "취소";
    return status;
  };

  const tierStyle = (tier: string) => {
    if (tier === "BASIC") return "bg-[#f0ede8] text-[#72706a]";
    if (tier === "PRO") return "bg-[#eef7f3] text-[#2d6a4f]";
    return "bg-[#141412] text-white";
  };

  return (
    <div className="space-y-4">
      {/* 현재 구독 상태 */}
      <div className="rounded-xl border border-[#e2ddd6] bg-white p-4 sm:p-5">
        <h3 className="text-[14px] font-semibold text-[#141412]">현재 구독</h3>
        {sub ? (
          <div className="mt-3 grid grid-cols-2 gap-4 text-[13px] sm:grid-cols-3">
            <div>
              <p className="text-[#72706a]">등급</p>
              <p className="mt-0.5">
                <span className={cn("inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold", tierStyle(sub.tier))}>
                  {sub.tier}
                </span>
                {sub.isTrial && (
                  <span className="ml-1 inline-block rounded-full bg-[#f5f3ee] px-2 py-0.5 text-[10px] font-semibold text-[#72706a]">체험</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-[#72706a]">상태</p>
              <p className="mt-0.5">
                <span className={cn("inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold", subStatusStyle(sub.status))}>
                  {subStatusLabel(sub.status)}
                </span>
              </p>
            </div>
            <div>
              <p className="text-[#72706a]">플랜</p>
              <p className="mt-0.5 font-medium text-[#1a1918]">{sub.planName || "-"}</p>
            </div>
            <div>
              <p className="text-[#72706a]">일일 견적 한도</p>
              <p className="mt-0.5 font-medium text-[#1a1918]">{sub.dailyEstimateLimit ?? "-"}건</p>
            </div>
            <div>
              <p className="text-[#72706a]">시작일</p>
              <p className="mt-0.5 font-medium text-[#1a1918]">{formatDate(sub.currentPeriodStart)}</p>
            </div>
            <div>
              <p className="text-[#72706a]">만료일</p>
              <p className="mt-0.5 font-medium text-[#1a1918]">{formatDate(sub.currentPeriodEnd)}</p>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-[13px] text-[#72706a]">활성 구독이 없습니다.</p>
        )}
      </div>

      {/* 구독 스택 */}
      {stack.length > 0 && (
        <div className="rounded-xl border border-[#e2ddd6] bg-white p-4 sm:p-5">
          <h3 className="text-[14px] font-semibold text-[#141412]">구독 스택</h3>
          <div className="mt-3 space-y-2">
            {stack.map((s: any) => {
              const d = calcDays(s);
              const price = Number(s.plan?.price || 0);
              const dailyCost = price > 0 && d.totalDays > 0 ? Math.round(price / d.totalDays) : 0;
              return (
                <div key={s.id} className="rounded-lg border border-[#e2ddd6] bg-[#f5f3ee] px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", tierStyle(s.plan?.tier || ""))}>
                        {s.plan?.tier || "-"}
                      </span>
                      <span className="text-[13px] font-medium text-[#1a1918]">{s.plan?.name || "-"}</span>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", subStatusStyle(s.status))}>
                        {subStatusLabel(s.status)}
                      </span>
                      {s.isTrial && <span className="text-[10px] text-[#72706a]">체험</span>}
                    </div>
                    <button
                      onClick={() => handleCancelSubscription(s.id, s.plan?.name || "구독")}
                      disabled={loading === "cancel"}
                      className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[12px] font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                    >
                      {loading === "cancel" ? "처리중..." : "해지"}
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#72706a]">
                    <span>사용 {d.usedDays}일 / 총 {d.totalDays}일 (남은 {d.remainingDays}일)</span>
                    {price > 0 && <span>{price.toLocaleString()}원 (일 {dailyCost.toLocaleString()}원)</span>}
                    {price > 0 && d.remainingDays > 0 && (
                      <span className="font-medium text-[#b45309]">환불 예상: {(dailyCost * d.remainingDays).toLocaleString()}원</span>
                    )}
                    <span className="text-[#72706a]">
                      {formatDate(s.projectedStart || s.currentPeriodStart)} ~ {formatDate(s.projectedEnd || s.currentPeriodEnd)}
                      {s.status !== "ACTIVE" && " (예상)"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 관리 액션 */}
      <div className="rounded-xl border border-[#e2ddd6] bg-white p-4 sm:p-5">
        <h3 className="text-[14px] font-semibold text-[#141412]">구독 관리</h3>

        {/* 플랜 변경 */}
        <div className="mt-4 flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-[12px] font-medium text-[#72706a]">플랜 변경</label>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#e2ddd6] px-3 py-2 text-[13px] text-[#1a1918] focus:border-[#2d6a4f] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/10"
            >
              {plans.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.tier} / {Number(p.price).toLocaleString()}원 / 일일 {p.dailyEstimateLimit}건)
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleChangePlan}
            disabled={loading === "change"}
            className="rounded-lg bg-[#2d6a4f] px-4 py-2 text-[13px] font-medium text-[#f5f3ee] hover:bg-[#4a8c6a] disabled:opacity-50"
          >
            {loading === "change" ? "처리중..." : "변경"}
          </button>
        </div>

        {/* 기간 연장 */}
        {sub?.status === "ACTIVE" && (
          <div className="mt-4 flex items-end gap-3 border-t border-[#e2ddd6] pt-4">
            <div className="flex-1">
              <label className="block text-[12px] font-medium text-[#72706a]">구독 연장</label>
              <select
                value={extendMonths}
                onChange={(e) => setExtendMonths(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[#e2ddd6] px-3 py-2 text-[13px] text-[#1a1918] focus:border-[#2d6a4f] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/10"
              >
                {[1, 2, 3, 6, 12].map((m) => (
                  <option key={m} value={m}>{m}개월</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleExtend}
              disabled={loading === "extend"}
              className="rounded-lg bg-[#2d6a4f] px-4 py-2 text-[13px] font-medium text-[#f5f3ee] hover:bg-[#4a8c6a] disabled:opacity-50"
            >
              {loading === "extend" ? "처리중..." : "연장"}
            </button>
          </div>
        )}

        {/* 무료 체험 부여 */}
        {(!sub || sub.status !== "ACTIVE") && (
          <div className="mt-4 flex items-center justify-between border-t border-[#e2ddd6] pt-4">
            <div>
              <p className="text-[13px] font-medium text-[#1a1918]">무료 체험 부여</p>
              <p className="text-[12px] text-[#72706a]">Basic 3개월 무료 체험을 부여합니다.</p>
            </div>
            <button
              onClick={handleGrantTrial}
              disabled={loading === "trial"}
              className="rounded-lg bg-[#f0ede8] px-4 py-2 text-[13px] font-medium text-[#1a1918] border border-[#e2ddd6] hover:bg-[#e2ddd6] disabled:opacity-50"
            >
              {loading === "trial" ? "처리중..." : "체험 부여"}
            </button>
          </div>
        )}
      </div>

      {/* 구독 이력 */}
      {history.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-[#e2ddd6] bg-white">
          <h3 className="border-b border-[#e2ddd6] px-4 py-3 text-[13px] font-semibold text-[#141412]">구독 이력</h3>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e2ddd6] bg-[#f0ede8]">
                <th className="px-3 py-2.5 text-[11px] font-semibold text-[#72706a]">등급</th>
                <th className="px-3 py-2.5 text-[11px] font-semibold text-[#72706a]">상태</th>
                <th className="px-3 py-2.5 text-[11px] font-semibold text-[#72706a]">플랜</th>
                <th className="px-3 py-2.5 text-[11px] font-semibold text-[#72706a]">사용일수</th>
                <th className="px-3 py-2.5 text-[11px] font-semibold text-[#72706a]">기간</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h: any) => (
                <tr key={h.id} className="border-b border-[#e2ddd6] last:border-0">
                  <td className="px-3 py-2.5">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", tierStyle(h.plan?.tier || ""))}>
                      {h.plan?.tier || "-"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", subStatusStyle(h.status))}>
                      {subStatusLabel(h.status)}
                    </span>
                    {h.isTrial && <span className="ml-1 text-[10px] text-[#72706a]">체험</span>}
                  </td>
                  <td className="px-3 py-2.5 text-[12px] text-[#1a1918]">{h.plan?.name || "-"}</td>
                  <td className="px-3 py-2.5 text-[12px]">
                    {(() => {
                      const d = calcDays(h);
                      return (
                        <span className={d.remainingDays > 0 && h.status !== "ACTIVE" && h.status !== "QUEUED" ? "font-medium text-[#b45309]" : "text-[#1a1918]"}>
                          {d.usedDays} / {d.totalDays}일
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-3 py-2.5 text-[12px] text-[#72706a]">
                    {(() => {
                      const proj = stack.find((s: any) => s.id === h.id);
                      if (proj && (h.status === "PAUSED" || h.status === "QUEUED")) {
                        return <>{formatDate(proj.projectedStart)} ~ {formatDate(proj.projectedEnd)} <span className="text-[10px] text-[#b45309]">(예상)</span></>;
                      }
                      return <>{formatDate(h.currentPeriodStart)} ~ {formatDate(h.currentPeriodEnd)}</>;
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
