"use client";

import { useEffect, useState } from "react";
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
    if (!reportId) return;
    let cancelled = false;

    async function fetchReport() {
      try {
        const { data } = await api.get(`/admin/reports/${reportId}`);
        if (!cancelled) setReport(data.data);
      } catch {
        if (!cancelled) {
          alert("신고 정보를 불러올 수 없습니다.");
          router.push("/admin/reports");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetchReport();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

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
      PENDING: { label: "대기", style: "bg-[#fef9ee] text-[#b45309]" },
      REVIEWED: { label: "검토중", style: "bg-[#fef9ee] text-[#b45309]" },
      RESOLVED: { label: "해결", style: "bg-[#eef7f3] text-[#2d6a4f]" },
      DISMISSED: { label: "기각", style: "bg-[#f0ede8] text-[#72706a]" },
    };
    const info = map[s] || { label: s, style: "bg-[#f0ede8] text-[#72706a]" };
    return <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", info.style)}>{info.label}</span>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e2ddd6] border-t-[#2d6a4f]" />
      </div>
    );
  }

  if (!report) return null;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.button
        variants={fadeUp}
        onClick={() => router.push("/admin/reports")}
        className="flex items-center gap-1.5 text-[13px] text-[#72706a] hover:text-[#1a1918] transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        신고 목록으로
      </motion.button>

      <div className="mt-4 space-y-4">
        {/* 신고 정보 */}
        <motion.div variants={fadeUp} className="rounded-xl border border-[#e2ddd6] bg-white p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-[#141412]">신고 상세</h1>
            {statusBadge(report.status)}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-[13px] sm:grid-cols-3">
            <div>
              <p className="text-[#72706a]">사유</p>
              <p className="mt-0.5 font-medium text-[#1a1918]">
                {reasonLabels[report.reason] || report.reason}
              </p>
            </div>
            <div>
              <p className="text-[#72706a]">대상 유형</p>
              <p className="mt-0.5 font-medium text-[#1a1918]">
                {report.targetType === "USER" ? "유저" : report.targetType === "COMPANY" ? "업체" : "리뷰"}
              </p>
            </div>
            <div>
              <p className="text-[#72706a]">신고일</p>
              <p className="mt-0.5 font-medium text-[#1a1918]">{formatDate(report.createdAt)}</p>
            </div>
            {report.resolvedAt && (
              <div>
                <p className="text-[#72706a]">처리일</p>
                <p className="mt-0.5 font-medium text-[#1a1918]">{formatDate(report.resolvedAt)}</p>
              </div>
            )}
          </div>
          {report.description && (
            <div className="mt-4">
              <p className="text-[13px] text-[#72706a]">신고 내용</p>
              <p className="mt-1 whitespace-pre-wrap rounded-lg bg-[#f5f3ee] p-3 text-[13px] text-[#1a1918]">
                {report.description}
              </p>
            </div>
          )}
          {report.adminNote && (
            <div className="mt-4">
              <p className="text-[13px] text-[#72706a]">관리자 메모</p>
              <p className="mt-1 whitespace-pre-wrap rounded-lg bg-[#eef7f3] p-3 text-[13px] text-[#2d6a4f]">
                {report.adminNote}
              </p>
            </div>
          )}
        </motion.div>

        {/* 신고자 / 대상 정보 */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[#e2ddd6] bg-white p-4 sm:p-5">
            <h3 className="text-[13px] font-semibold text-[#141412]">신고자</h3>
            <div className="mt-2 space-y-1 text-[13px]">
              <p className="text-[#1a1918]">{report.reporter?.name}</p>
              <p className="text-[#72706a]">{report.reporter?.email}</p>
              <p className="text-[#72706a]">{report.reporter?.phone || "-"}</p>
            </div>
            <Link
              href={`/admin/users/${report.reporter?.id}`}
              className="mt-2 inline-flex items-center gap-1 text-[12px] text-[#2d6a4f] hover:underline"
            >
              사용자 상세 보기
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6H9.5M6.5 3L9.5 6L6.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          <div className="rounded-xl border border-[#e2ddd6] bg-white p-4 sm:p-5">
            <h3 className="text-[13px] font-semibold text-[#141412]">
              대상 ({report.targetType === "USER" ? "유저" : report.targetType === "COMPANY" ? "업체" : "리뷰"})
            </h3>
            {report.target ? (
              <div className="mt-2 space-y-1 text-[13px]">
                {report.targetType === "USER" && (
                  <>
                    <p className="text-[#1a1918]">{report.target.name}</p>
                    <p className="text-[#72706a]">{report.target.email}</p>
                    <p className="text-[#72706a]">
                      상태: {report.target.isActive ? "활성" : "비활성"}
                    </p>
                    <Link href={`/admin/users/${report.target.id}`} className="inline-flex items-center gap-1 text-[12px] text-[#2d6a4f] hover:underline">
                      사용자 상세 보기
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6H9.5M6.5 3L9.5 6L6.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  </>
                )}
                {report.targetType === "COMPANY" && (
                  <>
                    <p className="text-[#1a1918]">{report.target.businessName}</p>
                    <p className="text-[#72706a]">사업자번호: {report.target.businessNumber}</p>
                    <p className="text-[#72706a]">
                      상태: {report.target.verificationStatus}
                    </p>
                    <Link href={`/admin/companies/${report.target.id}`} className="inline-flex items-center gap-1 text-[12px] text-[#2d6a4f] hover:underline">
                      업체 상세 보기
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6H9.5M6.5 3L9.5 6L6.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  </>
                )}
                {report.targetType === "REVIEW" && (
                  <>
                    <p className="text-[#72706a]">
                      {"★".repeat(report.target.rating)}{"☆".repeat(5 - report.target.rating)}
                    </p>
                    <p className="text-[#1a1918] line-clamp-3">{report.target.content}</p>
                    <p className="text-[#72706a]">
                      표시: {report.target.isVisible ? "표시중" : "숨김"}
                    </p>
                    {report.target.user && (
                      <p className="text-[#72706a]">작성자: {report.target.user.name}</p>
                    )}
                    {report.target.company && (
                      <p className="text-[#72706a]">업체: {report.target.company.businessName}</p>
                    )}
                  </>
                )}
              </div>
            ) : (
              <p className="mt-2 text-[13px] text-[#72706a]">대상을 찾을 수 없습니다.</p>
            )}
          </div>
        </motion.div>

        {/* 동일 대상 다른 신고 이력 */}
        {report.relatedReports?.length > 0 && (
          <motion.div variants={fadeUp} className="rounded-xl border border-[#e2ddd6] bg-white p-4 sm:p-5">
            <h3 className="text-[14px] font-semibold text-[#141412]">
              동일 대상 다른 신고 ({report.relatedReports.length}건)
            </h3>
            <div className="mt-2 space-y-2">
              {report.relatedReports.map((r: any) => (
                <Link
                  key={r.id}
                  href={`/admin/reports/${r.id}`}
                  className="flex items-center justify-between rounded-lg border border-[#e2ddd6] p-3 transition-colors hover:bg-[#f5f3ee]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] text-[#1a1918]">{r.reporter?.name}</span>
                    <span className="rounded-full bg-[#f0ede8] px-2 py-0.5 text-[10px] font-medium text-[#72706a]">
                      {reasonLabels[r.reason] || r.reason}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBadge(r.status)}
                    <span className="text-[11px] text-[#72706a]">{formatDate(r.createdAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* 처리 폼 */}
        {(report.status === "PENDING" || report.status === "REVIEWED") && (
          <motion.div variants={fadeUp} className="rounded-xl border border-[#e2ddd6] bg-white p-4 sm:p-6">
            <h3 className="text-[15px] font-semibold text-[#141412]">신고 처리</h3>
            <form onSubmit={handleResolve} className="mt-4 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#72706a]">처리 상태</label>
                <select
                  value={resolveStatus}
                  onChange={(e) => setResolveStatus(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#e2ddd6] px-3 py-2 text-[13px] text-[#1a1918] outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10"
                >
                  <option value="REVIEWED">검토중</option>
                  <option value="RESOLVED">해결</option>
                  <option value="DISMISSED">기각</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#72706a]">관리자 메모</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="처리 내용을 기록해주세요..."
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-[#e2ddd6] px-3 py-2 text-[13px] text-[#1a1918] outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#72706a]">조치 유형 (선택)</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#e2ddd6] px-3 py-2 text-[13px] text-[#1a1918] outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10"
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
                className="rounded-lg bg-[#2d6a4f] px-6 py-2.5 text-[13px] font-medium text-[#f5f3ee] transition-colors hover:bg-[#4a8c6a] disabled:opacity-50"
              >
                {isSubmitting ? "처리중..." : "처리 완료"}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
