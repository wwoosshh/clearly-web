"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

export default function AdminCompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  const [company, setCompany] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<"matchings" | "reviews" | "estimates" | "points">("matchings");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCompany = async () => {
    try {
      const { data } = await api.get(`/admin/companies/${companyId}`);
      setCompany(data.data);
    } catch {
      alert("업체 정보를 불러올 수 없습니다.");
      router.push("/admin/companies");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, [companyId]); // eslint-disable-line react-hooks/exhaustive-deps

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
      PENDING: { label: "대기", style: "bg-amber-50 text-amber-700" },
      APPROVED: { label: "승인", style: "bg-green-50 text-green-700" },
      REJECTED: { label: "반려", style: "bg-red-50 text-red-700" },
      SUSPENDED: { label: "정지", style: "bg-gray-200 text-gray-600" },
    };
    const info = map[s] || { label: s, style: "bg-gray-100 text-gray-600" };
    return <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", info.style)}>{info.label}</span>;
  };

  const matchingStatusBadge = (status: string) => {
    const map: Record<string, { label: string; style: string }> = {
      REQUESTED: { label: "요청", style: "bg-gray-100 text-gray-700" },
      ACCEPTED: { label: "수락", style: "bg-blue-50 text-blue-700" },
      COMPLETED: { label: "완료", style: "bg-green-50 text-green-700" },
      CANCELLED: { label: "취소", style: "bg-gray-200 text-gray-500" },
      REJECTED: { label: "거절", style: "bg-red-50 text-red-600" },
    };
    const info = map[status] || { label: status, style: "bg-gray-100 text-gray-600" };
    return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", info.style)}>{info.label}</span>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    );
  }

  if (!company) return null;

  return (
    <div>
      <button onClick={() => router.push("/admin/companies")} className="text-[13px] text-gray-500 hover:text-gray-700">
        &larr; 업체 목록으로
      </button>

      {/* 업체 정보 카드 */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{company.businessName}</h1>
            <p className="mt-1 text-[13px] text-gray-500">
              {company.user?.name} ({company.user?.email})
            </p>
          </div>
          <div className="flex items-center gap-2">
            {statusBadge(company.verificationStatus)}
            <span className={cn(
              "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
              company.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
            )}>
              {company.isActive ? "활성" : "비활성"}
            </span>
          </div>
        </div>

        {/* 작업 버튼 */}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
          {company.verificationStatus === "PENDING" && (
            <>
              <button onClick={handleApprove} disabled={actionLoading} className="rounded-lg bg-green-600 px-4 py-2 text-[13px] font-medium text-white hover:bg-green-700 disabled:opacity-50">승인</button>
              <button onClick={handleReject} disabled={actionLoading} className="rounded-lg bg-red-600 px-4 py-2 text-[13px] font-medium text-white hover:bg-red-700 disabled:opacity-50">반려</button>
            </>
          )}
          {company.verificationStatus === "APPROVED" && (
            <button onClick={handleSuspend} disabled={actionLoading} className="rounded-lg bg-gray-600 px-4 py-2 text-[13px] font-medium text-white hover:bg-gray-700 disabled:opacity-50">정지</button>
          )}
          {company.verificationStatus === "SUSPENDED" && (
            <button onClick={handleReactivate} disabled={actionLoading} className="rounded-lg bg-blue-600 px-4 py-2 text-[13px] font-medium text-white hover:bg-blue-700 disabled:opacity-50">정지해제</button>
          )}
        </div>
      </div>

      {/* 사업 정보 패널 */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-[15px] font-bold text-gray-900">사업 정보</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 text-[13px] sm:grid-cols-2">
          <div>
            <p className="text-gray-500">사업자번호</p>
            <p className="mt-0.5 font-medium text-gray-900">{company.businessNumber || "-"}</p>
          </div>
          <div>
            <p className="text-gray-500">대표자</p>
            <p className="mt-0.5 font-medium text-gray-900">{company.representative || "-"}</p>
          </div>
          <div>
            <p className="text-gray-500">주소</p>
            <p className="mt-0.5 font-medium text-gray-900">{company.address || "-"} {company.detailAddress || ""}</p>
          </div>
          <div>
            <p className="text-gray-500">서비스 지역</p>
            <p className="mt-0.5 font-medium text-gray-900">
              {Array.isArray(company.serviceAreas) ? company.serviceAreas.join(", ") : "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-500">전문분야</p>
            <p className="mt-0.5 font-medium text-gray-900">
              {Array.isArray(company.specialties) ? company.specialties.join(", ") : "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-500">가격대</p>
            <p className="mt-0.5 font-medium text-gray-900">
              {company.minPrice ? `${company.minPrice.toLocaleString()}원` : "-"} ~ {company.maxPrice ? `${company.maxPrice.toLocaleString()}원` : "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-500">평점 / 리뷰</p>
            <p className="mt-0.5 font-medium text-gray-900">
              {Number(company.averageRating || 0).toFixed(1)} ({company.totalReviews || 0}개)
            </p>
          </div>
          <div>
            <p className="text-gray-500">승인일</p>
            <p className="mt-0.5 font-medium text-gray-900">{formatDate(company.approvedAt)}</p>
          </div>
        </div>
        {company.description && (
          <div className="mt-4">
            <p className="text-[13px] text-gray-500">소개글</p>
            <p className="mt-1 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-[13px] text-gray-700">
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
      </div>

      {/* 탭 */}
      <div className="mt-6 flex gap-1 rounded-lg bg-gray-100 p-1">
        {(["matchings", "reviews", "estimates", "points"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-md py-2 text-[13px] font-medium transition-colors",
              tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {{ matchings: "매칭내역", reviews: "리뷰", estimates: "견적내역", points: "포인트" }[t]}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "matchings" && (
          <div>
            {company.matchings?.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-gray-400">매칭 내역이 없습니다.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="px-3 py-2 text-[11px] font-semibold text-gray-500">사용자</th>
                      <th className="px-3 py-2 text-[11px] font-semibold text-gray-500">청소유형</th>
                      <th className="px-3 py-2 text-[11px] font-semibold text-gray-500">상태</th>
                      <th className="px-3 py-2 text-[11px] font-semibold text-gray-500">가격</th>
                      <th className="px-3 py-2 text-[11px] font-semibold text-gray-500">날짜</th>
                    </tr>
                  </thead>
                  <tbody>
                    {company.matchings?.map((m: any) => (
                      <tr key={m.id} className="border-b border-gray-50 last:border-0">
                        <td className="px-3 py-2 text-[12px] text-gray-700">{m.user?.name || "-"}</td>
                        <td className="px-3 py-2 text-[12px] text-gray-600">{m.cleaningType}</td>
                        <td className="px-3 py-2">{matchingStatusBadge(m.status)}</td>
                        <td className="px-3 py-2 text-[12px] text-gray-700">{m.estimatedPrice?.toLocaleString() || "-"}원</td>
                        <td className="px-3 py-2 text-[12px] text-gray-500">{formatDate(m.createdAt)}</td>
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
              <p className="py-8 text-center text-[13px] text-gray-400">리뷰가 없습니다.</p>
            ) : (
              company.reviews?.map((r: any) => (
                <div key={r.id} className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-gray-900">{r.user?.name || "-"}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-amber-500">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        r.isVisible ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                      )}>
                        {r.isVisible ? "표시" : "숨김"}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-[12px] text-gray-600">{r.content}</p>
                  <p className="mt-1 text-[11px] text-gray-400">{formatDate(r.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "estimates" && (
          <div>
            {company.estimates?.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-gray-400">견적 내역이 없습니다.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="px-3 py-2 text-[11px] font-semibold text-gray-500">청소유형</th>
                      <th className="px-3 py-2 text-[11px] font-semibold text-gray-500">주소</th>
                      <th className="px-3 py-2 text-[11px] font-semibold text-gray-500">견적금액</th>
                      <th className="px-3 py-2 text-[11px] font-semibold text-gray-500">상태</th>
                      <th className="px-3 py-2 text-[11px] font-semibold text-gray-500">날짜</th>
                    </tr>
                  </thead>
                  <tbody>
                    {company.estimates?.map((e: any) => (
                      <tr key={e.id} className="border-b border-gray-50 last:border-0">
                        <td className="px-3 py-2 text-[12px] text-gray-700">{e.estimateRequest?.cleaningType || "-"}</td>
                        <td className="px-3 py-2 text-[12px] text-gray-600">{e.estimateRequest?.address || "-"}</td>
                        <td className="px-3 py-2 text-[12px] font-medium text-gray-900">{e.price?.toLocaleString()}원</td>
                        <td className="px-3 py-2">
                          <span className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            e.status === "SUBMITTED" ? "bg-gray-100 text-gray-700" :
                            e.status === "ACCEPTED" ? "bg-green-50 text-green-700" :
                            "bg-red-50 text-red-600"
                          )}>
                            {e.status === "SUBMITTED" ? "대기" : e.status === "ACCEPTED" ? "수락" : "거절"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-[12px] text-gray-500">{formatDate(e.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "points" && (
          <div>
            {company.pointWallet ? (
              <>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-[13px] text-gray-500">현재 잔액</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {(company.pointWallet.balance || 0).toLocaleString()} P
                  </p>
                </div>
                {company.pointWallet.transactions?.length > 0 && (
                  <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                          <th className="px-3 py-2 text-[11px] font-semibold text-gray-500">유형</th>
                          <th className="px-3 py-2 text-[11px] font-semibold text-gray-500">금액</th>
                          <th className="px-3 py-2 text-[11px] font-semibold text-gray-500">설명</th>
                          <th className="px-3 py-2 text-[11px] font-semibold text-gray-500">날짜</th>
                        </tr>
                      </thead>
                      <tbody>
                        {company.pointWallet.transactions.map((t: any) => (
                          <tr key={t.id} className="border-b border-gray-50 last:border-0">
                            <td className="px-3 py-2">
                              <span className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                t.type === "CHARGE" ? "bg-green-50 text-green-700" :
                                t.type === "USE" ? "bg-red-50 text-red-600" :
                                "bg-blue-50 text-blue-700"
                              )}>
                                {t.type === "CHARGE" ? "충전" : t.type === "USE" ? "사용" : "환불"}
                              </span>
                            </td>
                            <td className={cn(
                              "px-3 py-2 text-[12px] font-medium",
                              t.type === "USE" ? "text-red-600" : "text-green-700"
                            )}>
                              {t.type === "USE" ? "-" : "+"}{t.amount?.toLocaleString()} P
                            </td>
                            <td className="px-3 py-2 text-[12px] text-gray-600">{t.description}</td>
                            <td className="px-3 py-2 text-[12px] text-gray-500">{formatDate(t.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <p className="py-8 text-center text-[13px] text-gray-400">포인트 지갑이 없습니다.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
