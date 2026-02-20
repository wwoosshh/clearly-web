"use client";

import { Droppable } from "@hello-pangea/dnd";
import {
  PipelineStage,
  PIPELINE_STAGE_LABELS,
  PIPELINE_STAGE_COLORS,
  CustomerCard,
} from "@/types";
import CustomerCardItem from "./CustomerCardItem";

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
  const borderColor = PIPELINE_STAGE_COLORS[stage];

  return (
    <div className="flex min-w-[260px] flex-col snap-start md:min-w-0">
      <div
        className="mb-3 rounded-t-lg border-t-4 bg-white px-3.5 py-2.5"
        style={{ borderTopColor: borderColor }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-gray-700">
            {PIPELINE_STAGE_LABELS[stage]}
          </span>
          <span className="text-[12px] text-gray-400">{customers.length}</span>
        </div>
      </div>

      <Droppable droppableId={stage}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 space-y-2 rounded-b-lg p-1 transition-colors ${
              snapshot.isDraggingOver ? "bg-gray-100" : "bg-gray-50/50"
            }`}
            style={{ minHeight: 80 }}
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
          </div>
        )}
      </Droppable>
    </div>
  );
}
