"use client";

interface BatchActionBarProps {
  selectedCount: number;
  onSendMessage: () => void;
  onClearSelection: () => void;
}

export default function BatchActionBar({
  selectedCount,
  onSendMessage,
  onClearSelection,
}: BatchActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-between rounded-t-xl bg-gray-900 px-5 py-3.5 text-white shadow-lg">
          <span className="text-[14px] font-medium">
            {selectedCount}명 선택됨
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClearSelection}
              className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-gray-400 transition-colors hover:text-white"
            >
              선택 해제
            </button>
            <button
              onClick={onSendMessage}
              className="rounded-lg bg-white px-4 py-1.5 text-[13px] font-medium text-gray-900 transition-colors hover:bg-gray-100"
            >
              메시지 발송
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
