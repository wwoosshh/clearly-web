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
  if (value >= 10000) return `${Math.floor(value / 10000)}만원`;
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
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('input[type="checkbox"]')) return;
            onClick(customer.userId);
          }}
          style={provided.draggableProps.style}
          className={[
            "relative rounded-xl border bg-white px-4 py-3.5 cursor-grab select-none",
            "transition-[transform,box-shadow,border-color] duration-200",
            snapshot.isDragging
              ? "rotate-[1.5deg] scale-[1.03] shadow-xl border-[#c8c4bc] cursor-grabbing z-50"
              : isSelected
              ? "border-[#0284C7] shadow-[0_2px_12px_rgba(2,132,199,0.14)] hover:-translate-y-px hover:shadow-md"
              : "border-[#e2ddd6] shadow-[0_1px_4px_rgba(20,20,18,0.05)] hover:-translate-y-px hover:shadow-md hover:border-[#c8c4bc]",
          ].join(" ")}
        >
          {isSelected && (
            <div className="absolute left-0 top-3.5 bottom-3.5 w-[3px] rounded-r-sm bg-[#0284C7]" />
          )}

          <div className="flex items-start gap-2.5">
            <div className="mt-[3px] flex-shrink-0">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelect(customer.userId)}
                className="h-3.5 w-3.5 rounded-sm cursor-pointer"
                style={{ accentColor: "#0284C7" }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[13px] font-semibold text-[#141412] truncate">
                  {customer.name}
                </span>
                {customer.isRepeat && (
                  <span className="flex-shrink-0 rounded-full bg-[#BAE6FD] px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-[#0284C7]">
                    재방문
                  </span>
                )}
              </div>

              {customer.phone && (
                <p className="mt-0.5 text-[11px] tabular-nums text-[#a8a49c]">
                  {customer.phone}
                </p>
              )}

              {customer.tags.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {customer.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                      style={{
                        backgroundColor: `${tagColors[tag] || "#72706a"}18`,
                        color: tagColors[tag] || "#72706a",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                  {customer.tags.length > 2 && (
                    <span className="rounded-full bg-[#f0ede8] px-1.5 py-0.5 text-[9px] text-[#a8a49c]">
                      +{customer.tags.length - 2}
                    </span>
                  )}
                </div>
              )}

              <div className="mt-2 flex items-center justify-between border-t border-[#f0ede8] pt-2">
                <span className="text-[11px] font-semibold tabular-nums text-[#0284C7]">
                  {formatCurrency(customer.totalRevenue)}
                </span>
                <span className="text-[10px] text-[#a8a49c]">
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
