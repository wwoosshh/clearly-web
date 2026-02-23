"use client";

import { Droppable } from "@hello-pangea/dnd";
import {
  PipelineStage,
  PIPELINE_STAGE_LABELS,
  CustomerCard,
} from "@/types";
import CustomerCardItem from "./CustomerCardItem";

const STAGE_CONFIG: Record<
  PipelineStage,
  { accent: string; bg: string; activeBg: string; countBg: string }
> = {
  LEAD:       { accent: "#a8a49c", bg: "transparent",  activeBg: "#ede9e3",  countBg: "#a8a49c18" },
  CONSULTING: { accent: "#4a8c6a", bg: "transparent",  activeBg: "#e4f2ea",  countBg: "#4a8c6a18" },
  BOOKED:     { accent: "#2d6a4f", bg: "transparent",  activeBg: "#ddeee6",  countBg: "#2d6a4f18" },
  COMPLETED:  { accent: "#141412", bg: "transparent",  activeBg: "#e6e2dc",  countBg: "#14141218" },
  VIP:        { accent: "#d97706", bg: "transparent",  activeBg: "#fdf3d7",  countBg: "#d9770618" },
};

interface KanbanColumnProps {
  stage: PipelineStage;
  customers: CustomerCard[];
  selectedIds: Set<string>;
  onToggleSelect: (userId: string) => void;
  onCardClick: (userId: string) => void;
  tagColors: Record<string, string>;
}

export default function KanbanColumn({
  stage,
  customers,
  selectedIds,
  onToggleSelect,
  onCardClick,
  tagColors,
}: KanbanColumnProps) {
  const cfg = STAGE_CONFIG[stage];

  return (
    <div className="flex min-w-[252px] flex-col snap-start md:min-w-0">
      {/* 컬럼 헤더 */}
      <div
        className="mb-2.5 flex items-center justify-between rounded-xl px-3.5 py-2.5 border"
        style={{
          borderColor: `${cfg.accent}30`,
          backgroundColor: cfg.countBg,
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: cfg.accent }}
          />
          <span
            className="text-[12px] font-bold tracking-wide"
            style={{ color: cfg.accent }}
          >
            {PIPELINE_STAGE_LABELS[stage]}
          </span>
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums"
          style={{
            backgroundColor: `${cfg.accent}25`,
            color: cfg.accent,
          }}
        >
          {customers.length}
        </span>
      </div>

      <Droppable droppableId={stage}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex-1 space-y-2 rounded-xl p-1.5 transition-all duration-200"
            style={{
              minHeight: 88,
              backgroundColor: snapshot.isDraggingOver
                ? cfg.activeBg
                : "transparent",
              outline: snapshot.isDraggingOver
                ? `2px dashed ${cfg.accent}50`
                : "2px dashed transparent",
              outlineOffset: "-1px",
            }}
          >
            {customers.map((customer, index) => (
              <CustomerCardItem
                key={customer.userId}
                customer={customer}
                index={index}
                isSelected={selectedIds.has(customer.userId)}
                onToggleSelect={onToggleSelect}
                onClick={onCardClick}
                tagColors={tagColors}
              />
            ))}
            {provided.placeholder}

            {customers.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex items-center justify-center py-8">
                <span
                  className="text-[12px]"
                  style={{ color: cfg.accent, opacity: 0.35 }}
                >
                  비어있음
                </span>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
