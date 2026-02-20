"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
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
import FadeIn from "@/components/animation/FadeIn";
import ScrollReveal from "@/components/animation/ScrollReveal";
import StatsBar from "@/components/customers/StatsBar";
import KanbanColumn from "@/components/customers/KanbanColumn";
import CustomerDetailPanel from "@/components/customers/CustomerDetailPanel";
import BatchActionBar from "@/components/customers/BatchActionBar";
import TagManagementModal from "@/components/customers/TagManagementModal";
import BatchMessageModal from "@/components/customers/BatchMessageModal";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const STAGES: PipelineStage[] = [
  "LEAD",
  "CONSULTING",
  "BOOKED",
  "COMPLETED",
  "VIP",
];

export default function CustomersPage() {
  const { user, isInitialized } = useAuthStore();
  const router = useRouter();

  const [pipeline, setPipeline] = useState<PipelineColumn[]>(
    STAGES.map((stage) => ({ stage, customers: [] })),
  );
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [companyTags, setCompanyTags] = useState<CompanyTag[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const [showTagModal, setShowTagModal] = useState(false);
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
    const hasCached = cache.get("customers:pipeline") && cache.get("customers:stats");
    if (!hasCached) setLoading(true);
    await Promise.all([loadPipeline(), loadStats(), loadTags()]);
    setLoading(false);
  };

  const loadPipeline = useCallback(
    async (s?: string, t?: string) => {
      try {
        const searchVal = s ?? search;
        const tagVal = t ?? filterTag;
        const params: Record<string, string> = {};
        if (searchVal) params.search = searchVal;
        if (tagVal) params.tag = tagVal;
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

  // 검색/필터 변경 시 파이프라인 리로드 (디바운스)
  useEffect(() => {
    setSearching(true);
    const timeout = setTimeout(async () => {
      await loadPipeline(search, filterTag);
      setSearching(false);
    }, 300);
    return () => {
      clearTimeout(timeout);
    };
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
    const userId = draggableId;

    // Optimistic update
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

    // API call + 캐시 무효화
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
      const customer = prev
        .flatMap((c) => c.customers)
        .find((c) => c.userId === userId);
      if (customer) {
        const dstCol = next.find((c) => c.stage === stage);
        if (dstCol) {
          dstCol.customers.unshift({ ...customer, pipelineStage: stage });
        }
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
  companyTags.forEach((t) => {
    tagColorMap[t.name] = t.color;
  });

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#e2ddd6] border-t-[#2d6a4f]" />
      </div>
    );
  }

  if (!isCompany) return null;

  return (
    <div className="mx-auto max-w-6xl overflow-x-hidden px-4 sm:px-6 py-6 sm:py-8">
      <motion.div variants={stagger} initial="hidden" animate="show">

        <motion.div variants={fadeUp}>
          <h1 className="text-[22px] font-bold text-[#141412]">고객 관리</h1>
          <p className="mt-1 text-[14px] text-[#72706a]">
            고객을 파이프라인으로 관리하고 일괄 메시지를 발송하세요
          </p>
        </motion.div>

        {/* 통계 */}
        <motion.div variants={fadeUp} className="mt-6">
          <StatsBar stats={stats} loading={loading} />
        </motion.div>

        {/* 필터바 */}
        <motion.div variants={fadeUp} className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a49c]"
              width="16"
              height="16"
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
              className="w-full rounded-lg border border-[#e2ddd6] bg-white py-2 pl-9 pr-9 text-[14px] text-[#141412] placeholder:text-[#a8a49c] focus:border-[#4a8c6a] focus:outline-none transition-colors"
            />
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#e2ddd6] border-t-[#4a8c6a]" />
              </div>
            )}
          </div>

          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="rounded-lg border border-[#e2ddd6] bg-white px-3 py-2 text-[14px] text-[#1a1918] focus:border-[#4a8c6a] focus:outline-none transition-colors"
          >
            <option value="">전체 태그</option>
            {companyTags.map((tag) => (
              <option key={tag.id} value={tag.name}>
                {tag.name}
              </option>
            ))}
          </select>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowTagModal(true)}
            className="press-scale rounded-lg border border-[#e2ddd6] bg-white px-3 py-2 text-[13px] font-medium text-[#1a1918] transition-colors hover:bg-[#f0ede8]"
          >
            태그 관리
          </motion.button>
        </motion.div>

        {/* 칸반 보드 */}
        <motion.div variants={fadeUp} className="mt-5">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-10 animate-pulse rounded-t-lg bg-[#e2ddd6]" />
                  <div className="h-32 animate-pulse rounded-b-lg bg-[#f0ede8]" />
                </div>
              ))}
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex gap-3 overflow-x-auto pb-4 snap-x md:grid md:grid-cols-5">
                {pipeline.map((col) => (
                  <KanbanColumn
                    key={col.stage}
                    stage={col.stage}
                    customers={col.customers}
                    selectedIds={selectedIds}
                    onToggleSelect={toggleSelect}
                    onCardClick={(uid) => setDetailUserId(uid)}
                    tagColors={tagColorMap}
                  />
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
