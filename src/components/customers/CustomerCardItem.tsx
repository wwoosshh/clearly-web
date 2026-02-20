"use client";

import { Draggable } from "@hello-pangea/dnd";
import { CustomerCard } from "@/types";

interface CustomerCardItemProps {
  customer: CustomerCard;
  index: number;
  isSelected: boolean;
  onToggleSelect: (userId: string) => void;
  onClick: (userId: string) => void;
  tagColors: Record<string, string>;
}

function formatCurrency(value: number): string {
  if (value >= 10000) {
    return `${Math.floor(value / 10000)}만원`;
  }
  return `${value.toLocaleString()}원`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "오늘";
  if (days === 1) return "어제";
  if (days < 30) return `${days}일 전`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}개월 전`;
  return `${Math.floor(months / 12)}년 전`;
}

export default function CustomerCardItem({
  customer,
  index,
  isSelected,
  onToggleSelect,
  onClick,
  tagColors,
}: CustomerCardItemProps) {
  return (
    <Draggable draggableId={customer.userId} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`rounded-lg border bg-white p-3.5 cursor-grab transition-shadow ${
            snapshot.isDragging
              ? "shadow-md border-gray-300"
              : "border-gray-200 hover:shadow-sm"
          } ${isSelected ? "ring-2 ring-gray-900 ring-offset-1" : ""}`}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('input[type="checkbox"]'))
              return;
            onClick(customer.userId);
          }}
        >
          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(customer.userId)}
              className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold text-gray-900 truncate">
                  {customer.name}
                </span>
                {customer.isRepeat && (
                  <span className="ml-1 shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                    재방문
                  </span>
                )}
              </div>

              {customer.phone && (
                <p className="mt-0.5 text-[12px] text-gray-400">
                  {customer.phone}
                </p>
              )}

              {customer.tags.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {customer.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                      style={{
                        backgroundColor: `${tagColors[tag] || "#6b7280"}20`,
                        color: tagColors[tag] || "#6b7280",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                  {customer.tags.length > 3 && (
                    <span className="text-[10px] text-gray-400">
                      +{customer.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              <div className="mt-2 flex items-center justify-between">
                <span className="text-[12px] tabular-nums text-gray-500">
                  {formatCurrency(customer.totalRevenue)}
                </span>
                <span className="text-[11px] text-gray-400">
                  {timeAgo(customer.lastInteractionAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
