"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const reasonLabels: Record<string, string> = {
  FRAUD: "사기",
  INAPPROPRIATE: "부적절",
  NO_SHOW: "노쇼",
  POOR_QUALITY: "품질불량",
  OTHER: "기타",
};

export default function AdminReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resolveStatus, setResolveStatus] = useState("RESOLVED");
  const [adminNote, setAdminNote] = useState("");
  const [actionType, setActionType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchReport() {
      try {
        const { data } = await api.get(`/admin/reports/${reportId}`);
        setReport(data.data);
      } catch {
        alert("신고 정보를 불러올 수 없습니다.");
        router.push("/admin/reports");
      } finally {
        setIsLoading(false);
      }
    }
    fetchReport();
  }, [reportId, router]);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNote.trim()) {
      alert("관리자 메모를 입력해주세요.");
      return;
    }
    setIsSubmitting(true);
    try {
      const body: any = { status: resolveStatus, adminNote };
      if (actionType) body.actionType = actionType;
      await api.patch(`/admin/reports/${reportId}/resolve`, body);
      alert("신고가 처리되었습니다.");
      router.push("/admin/reports");
    } catch {
      alert("처리에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString("ko-KR") : "-";

  const statusBadge = (s: string) => {
    const map: Record<string, { label: string; style: string }> = {
      PENDING: { label: "대기", style: "bg-amber-50 text-amber-700" },
      REVIEWED: { label: "검토중", style: "bg-blue-50 text-blue-700" },
      RESOLVED: { label: "해결", style: "bg-green-50 text-green-700" },
      DISMISSED: { label: "기각", style: "bg-gray-100 text-gray-500" },
    };
    const info = map[s] || { label: s, style: "bg-gray-100 text-gray-600" };
    return <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", info.style)}>{info.label}</span>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    );
  }

  if (!report) return null;

  return (
    <div>
      <button onClick={() => router.push("/admin/reports")} className="text-[13px] text-gray-500 hover:text-gray-700">
        &larr; 신고 목록으로
      </button>

      <div className="mt-4 space-y-4">
        {/* 신고 정보 */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900">신고 상세</h1>
            {statusBadge(report.status)}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-[13px] sm:grid-cols-3">
            <div>
              <p className="text-gray-500">사유</p>
              <p className="mt-0.5 font-medium text-gray-900">
                {reasonLabels[report.reason] || report.reason}
              </p>
            </div>
            <div>
              <p className="text-gray-500">대상 유형</p>
              <p className="mt-0.5 font-medium text-gray-900">
                {report.targetType === "USER" ? "유저" : report.targetType === "COMPANY" ? "업체" : "리뷰"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">신고일</p>
              <p className="mt-0.5 font-medium text-gray-900">{formatDate(report.createdAt)}</p>
            </div>
            {report.resolvedAt && (
              <div>
                <p className="text-gray-500">처리일</p>
                <p className="mt-0.5 font-medium text-gray-900">{formatDate(report.resolvedAt)}</p>
              </div>
            )}
          </div>
          {report.description && (
            <div className="mt-4">
              <p className="text-[13px] text-gray-500">신고 내용</p>
              <p className="mt-1 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-[13px] text-gray-700">
                {report.description}
              </p>
            </div>
          )}
          {report.adminNote && (
            <div className="mt-4">
              <p className="text-[13px] text-gray-500">관리자 메모</p>
              <p className="mt-1 whitespace-pre-wrap rounded-lg bg-blue-50 p-3 text-[13px] text-blue-800">
                {report.adminNote}
              </p>
            </div>
          )}
        </div>

        {/* 신고자 / 대상 정보 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-[13px] font-bold text-gray-900">신고자</h3>
            <div className="mt-2 space-y-1 text-[13px]">
              <p className="text-gray-700">{report.reporter?.name}</p>
              <p className="text-gray-500">{report.reporter?.email}</p>
              <p className="text-gray-500">{report.reporter?.phone || "-"}</p>
            </div>
            <Link
              href={`/admin/users/${report.reporter?.id}`}
              className="mt-2 inline-block text-[12px] text-blue-600 hover:underline"
            >
              사용자 상세 보기 →
            </Link>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-[13px] font-bold text-gray-900">
              대상 ({report.targetType === "USER" ? "유저" : report.targetType === "COMPANY" ? "업체" : "리뷰"})
            </h3>
            {report.target ? (
              <div className="mt-2 space-y-1 text-[13px]">
                {report.targetType === "USER" && (
                  <>
                    <p className="text-gray-700">{report.target.name}</p>
                    <p className="text-gray-500">{report.target.email}</p>
                    <p className="text-gray-500">
                      상태: {report.target.isActive ? "활성" : "비활성"}
                    </p>
                    <Link href={`/admin/users/${report.target.id}`} className="inline-block text-[12px] text-blue-600 hover:underline">
                      사용자 상세 보기 →
                    </Link>
                  </>
                )}
                {report.targetType === "COMPANY" && (
                  <>
                    <p className="text-gray-700">{report.target.businessName}</p>
                    <p className="text-gray-500">사업자번호: {report.target.businessNumber}</p>
                    <p className="text-gray-500">
                      상태: {report.target.verificationStatus}
                    </p>
                    <Link href={`/admin/companies/${report.target.id}`} className="inline-block text-[12px] text-blue-600 hover:underline">
                      업체 상세 보기 →
                    </Link>
                  </>
                )}
                {report.targetType === "REVIEW" && (
                  <>
                    <p className="text-amber-500">
                      {"★".repeat(report.target.rating)}{"☆".repeat(5 - report.target.rating)}
                    </p>
                    <p className="text-gray-700 line-clamp-3">{report.target.content}</p>
                    <p className="text-gray-500">
                      표시: {report.target.isVisible ? "표시중" : "숨김"}
                    </p>
                    {report.target.user && (
                      <p className="text-gray-500">작성자: {report.target.user.name}</p>
                    )}
                    {report.target.company && (
                      <p className="text-gray-500">업체: {report.target.company.businessName}</p>
                    )}
                  </>
                )}
              </div>
            ) : (
              <p className="mt-2 text-[13px] text-gray-400">대상을 찾을 수 없습니다.</p>
            )}
          </div>
        </div>

        {/* 동일 대상 다른 신고 이력 */}
        {report.relatedReports?.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-[14px] font-bold text-gray-900">
              동일 대상 다른 신고 ({report.relatedReports.length}건)
            </h3>
            <div className="mt-2 space-y-2">
              {report.relatedReports.map((r: any) => (
                <Link
                  key={r.id}
                  href={`/admin/reports/${r.id}`}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] text-gray-600">{r.reporter?.name}</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                      {reasonLabels[r.reason] || r.reason}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBadge(r.status)}
                    <span className="text-[11px] text-gray-400">{formatDate(r.createdAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 처리 폼 */}
        {(report.status === "PENDING" || report.status === "REVIEWED") && (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-[15px] font-bold text-gray-900">신고 처리</h3>
            <form onSubmit={handleResolve} className="mt-4 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-700">처리 상태</label>
                <select
                  value={resolveStatus}
                  onChange={(e) => setResolveStatus(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none"
                >
                  <option value="REVIEWED">검토중</option>
                  <option value="RESOLVED">해결</option>
                  <option value="DISMISSED">기각</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-700">관리자 메모</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="처리 내용을 기록해주세요..."
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none focus:border-gray-400"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-700">조치 유형 (선택)</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none"
                >
                  <option value="">조치 없음</option>
                  {report.targetType === "USER" && <option value="SUSPEND_USER">유저 정지</option>}
                  {report.targetType === "COMPANY" && <option value="SUSPEND_COMPANY">업체 정지</option>}
                  {report.targetType === "REVIEW" && <option value="HIDE_REVIEW">리뷰 숨김</option>}
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-gray-900 px-6 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
              >
                {isSubmitting ? "처리중..." : "처리 완료"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
