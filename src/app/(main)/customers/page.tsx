"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/auth.store";
import { useCacheStore, fetchWithCache } from "@/stores/cache.store";
import api from "@/lib/api";
import {
  PipelineStage,
  CustomerCard,
  CustomerStats,
  CompanyTag,
  PipelineColumn,
} from "@/types";
import StatsBar from "@/components/customers/StatsBar";
import KanbanColumn from "@/components/customers/KanbanColumn";
import CustomerDetailPanel from "@/components/customers/CustomerDetailPanel";
import BatchActionBar from "@/components/customers/BatchActionBar";
import TagManagementModal from "@/components/customers/TagManagementModal";
import BatchMessageModal from "@/components/customers/BatchMessageModal";

const STAGES: PipelineStage[] = [
  "LEAD",
  "CONSULTING",
  "BOOKED",
  "COMPLETED",
  "VIP",
];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

export default function CustomersPage() {
  const { user, isInitialized } = useAuthStore();
  const router = useRouter();

  const [pipeline, setPipeline]       = useState<PipelineColumn[]>(
    STAGES.map((stage) => ({ stage, customers: [] as CustomerCard[] })),
  );
  const [stats, setStats]             = useState<CustomerStats | null>(null);
  const [companyTags, setCompanyTags] = useState<CompanyTag[]>([]);
  const [loading, setLoading]         = useState(true);

  const [search, setSearch]           = useState("");
  const [filterTag, setFilterTag]     = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [searching, setSearching]     = useState(false);
  const [statsOpen, setStatsOpen]     = useState(true);

  const [showTagModal, setShowTagModal]       = useState(false);
  const [showBatchMessage, setShowBatchMessage] = useState(false);

  const isCompany = user?.role === "COMPANY";

  useEffect(() => {
    if (isInitialized && !isCompany) {
      router.replace("/");
    }
  }, [isInitialized, isCompany, router]);

  useEffect(() => {
    if (isInitialized && isCompany) {
      loadAll();
    }
  }, [isInitialized, isCompany]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAll = async () => {
    const cache = useCacheStore.getState();
    const hasCached =
      cache.get("customers:pipeline") && cache.get("customers:stats");
    if (!hasCached) setLoading(true);
    await Promise.all([loadPipeline(), loadStats(), loadTags()]);
    setLoading(false);
  };

  const loadPipeline = useCallback(
    async (s?: string, t?: string) => {
      try {
        const searchVal = s ?? search;
        const tagVal    = t ?? filterTag;
        const params: Record<string, string> = {};
        if (searchVal) params.search = searchVal;
        if (tagVal)    params.tag    = tagVal;
        const cacheKey = `customers:pipeline:${searchVal}:${tagVal}`;

        const data = await fetchWithCache<PipelineColumn[]>(
          cacheKey,
          "/companies/my/customers/pipeline",
          params,
          { maxAge: 2 * 60 * 1000, onUpdate: setPipeline },
        );
        setPipeline(data);
      } catch {
        // ignore
      }
    },
    [search, filterTag],
  );

  const loadStats = async () => {
    try {
      const data = await fetchWithCache<CustomerStats>(
        "customers:stats",
        "/companies/my/customers/stats",
        undefined,
        { maxAge: 3 * 60 * 1000, onUpdate: setStats },
      );
      setStats(data);
    } catch {
      // ignore
    }
  };

  const loadTags = async () => {
    try {
      const data = await fetchWithCache<CompanyTag[]>(
        "customers:tags",
        "/companies/my/tags",
        undefined,
        { maxAge: 5 * 60 * 1000, onUpdate: setCompanyTags },
      );
      setCompanyTags(data);
    } catch {
      // ignore
    }
  };

  // 검색/필터 디바운스
  useEffect(() => {
    setSearching(true);
    const timeout = setTimeout(async () => {
      await loadPipeline(search, filterTag);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, filterTag]); // eslint-disable-line react-hooks/exhaustive-deps

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const newStage = destination.droppableId as PipelineStage;
    const userId   = draggableId;

    setPipeline((prev) => {
      const next = prev.map((col) => ({
        ...col,
        customers: [...col.customers],
      }));
      const srcCol = next.find((c) => c.stage === source.droppableId)!;
      const [moved] = srcCol.customers.splice(source.index, 1);
      moved.pipelineStage = newStage;
      const dstCol = next.find((c) => c.stage === newStage)!;
      dstCol.customers.splice(destination.index, 0, moved);
      return next;
    });

    api
      .patch(`/companies/my/customers/${userId}/stage`, { stage: newStage })
      .then(() => {
        useCacheStore.getState().invalidatePrefix("customers:");
      })
      .catch(() => {
        loadPipeline();
      });
  };

  const toggleSelect = (userId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleStageChange = (userId: string, stage: PipelineStage) => {
    setPipeline((prev) => {
      const next = prev.map((col) => ({
        ...col,
        customers: col.customers.filter((c) => c.userId !== userId),
      }));
      const customer = prev.flatMap((c) => c.customers).find((c) => c.userId === userId);
      if (customer) {
        const dstCol = next.find((c) => c.stage === stage);
        if (dstCol) dstCol.customers.unshift({ ...customer, pipelineStage: stage });
      }
      return next;
    });
  };

  const handleTagsChange = (userId: string, tags: string[]) => {
    setPipeline((prev) =>
      prev.map((col) => ({
        ...col,
        customers: col.customers.map((c) =>
          c.userId === userId ? { ...c, tags } : c,
        ),
      })),
    );
  };

  const handleCreateTag = async (name: string, color: string) => {
    try {
      await api.post("/companies/my/tags", { name, color });
      useCacheStore.getState().invalidate("customers:tags");
      await loadTags();
    } catch {
      // ignore
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      await api.delete(`/companies/my/tags/${tagId}`);
      useCacheStore.getState().invalidatePrefix("customers:");
      await loadTags();
      await loadPipeline();
    } catch {
      // ignore
    }
  };

  const handleBatchSend = async (content: string) => {
    const res = await api.post("/companies/my/customers/batch-message", {
      userIds: Array.from(selectedIds),
      content,
    });
    setSelectedIds(new Set());
    return res.data.data;
  };

  const tagColorMap: Record<string, string> = {};
  companyTags.forEach((t) => { tagColorMap[t.name] = t.color; });

  const totalCustomers = pipeline.reduce((acc, col) => acc + col.customers.length, 0);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#e2ddd6] border-t-[#0284C7]" />
      </div>
    );
  }

  if (!isCompany) return null;

  return (
    <div className="mx-auto max-w-6xl overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* 헤더 */}
        <motion.div variants={itemVariants} className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-bold tracking-tight text-[#141412]">
              고객 관리
            </h1>
            <p className="mt-1 text-[14px] text-[#72706a]">
              파이프라인으로 고객을 단계별로 관리하세요
              {totalCustomers > 0 && (
                <span className="ml-2 text-[13px] font-semibold text-[#0EA5E9]">
                  · 총 {totalCustomers}명
                </span>
              )}
            </p>
          </div>

          {/* 통계 토글 버튼 */}
          <button
            onClick={() => setStatsOpen((v) => !v)}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-xl border border-[#e2ddd6] bg-white px-3 py-2 text-[12px] font-semibold text-[#72706a] transition-colors hover:bg-[#f0ede8]"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className={`transition-transform duration-300 ${statsOpen ? "rotate-0" : "rotate-180"}`}
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
            통계
          </button>
        </motion.div>

        {/* 통계 섹션 (접기/펼치기) */}
        <AnimatePresence initial={false}>
          {statsOpen && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-hidden"
            >
              <motion.div variants={itemVariants} className="mt-5">
                <StatsBar stats={stats} loading={loading} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 필터바 */}
        <motion.div
          variants={itemVariants}
          className="mt-5 flex flex-wrap items-center gap-2.5"
        >
          {/* 검색 */}
          <div className="relative min-w-[200px] flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a49c]"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름, 전화번호 검색"
              className="w-full rounded-xl border border-[#e2ddd6] bg-white py-2 pl-9 pr-9 text-[14px] text-[#141412] placeholder:text-[#c8c4bc] focus:border-[#0EA5E9] focus:outline-none transition-colors"
            />
            <AnimatePresence>
              {searching && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#e2ddd6] border-t-[#0EA5E9]" />
                </motion.div>
              )}
              {search && !searching && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center rounded-full bg-[#a8a49c] text-white"
                >
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* 태그 필터 */}
          <div className="relative">
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="appearance-none rounded-xl border border-[#e2ddd6] bg-white py-2 pl-3 pr-8 text-[13px] font-medium text-[#141412] focus:border-[#0EA5E9] focus:outline-none transition-colors"
            >
              <option value="">전체 태그</option>
              {companyTags.map((tag) => (
                <option key={tag.id} value={tag.name}>
                  {tag.name}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a8a49c]"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          {/* 태그 관리 */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowTagModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-[#e2ddd6] bg-white px-3 py-2 text-[13px] font-semibold text-[#72706a] transition-colors hover:bg-[#f0ede8]"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            태그 관리
          </motion.button>
        </motion.div>

        {/* 칸반 보드 */}
        <motion.div variants={itemVariants} className="mt-4">
          {loading ? (
            <div className="grid gap-3 md:grid-cols-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-10 animate-pulse rounded-xl bg-[#f0ede8]" />
                  <div
                    className="animate-pulse rounded-xl bg-[#f5f3ee]"
                    style={{ height: 80 + i * 24 }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex gap-3 overflow-x-auto pb-24 snap-x md:grid md:grid-cols-5">
                {pipeline.map((col, i) => (
                  <motion.div
                    key={col.stage}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: i * 0.055,
                      duration: 0.38,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                  >
                    <KanbanColumn
                      stage={col.stage}
                      customers={col.customers}
                      selectedIds={selectedIds}
                      onToggleSelect={toggleSelect}
                      onCardClick={(uid) => setDetailUserId(uid)}
                      tagColors={tagColorMap}
                    />
                  </motion.div>
                ))}
              </div>
            </DragDropContext>
          )}
        </motion.div>
      </motion.div>

      {/* 고객 상세 패널 */}
      <CustomerDetailPanel
        userId={detailUserId}
        onClose={() => setDetailUserId(null)}
        companyTags={companyTags}
        onStageChange={handleStageChange}
        onTagsChange={handleTagsChange}
      />

      {/* 일괄 액션바 */}
      <BatchActionBar
        selectedCount={selectedIds.size}
        onSendMessage={() => setShowBatchMessage(true)}
        onClearSelection={() => setSelectedIds(new Set())}
      />

      {/* 태그 관리 모달 */}
      <TagManagementModal
        isOpen={showTagModal}
        onClose={() => setShowTagModal(false)}
        tags={companyTags}
        onCreateTag={handleCreateTag}
        onDeleteTag={handleDeleteTag}
      />

      {/* 일괄 메시지 모달 */}
      <BatchMessageModal
        isOpen={showBatchMessage}
        onClose={() => setShowBatchMessage(false)}
        recipientCount={selectedIds.size}
        onSend={handleBatchSend}
      />
    </div>
  );
}
