"use client";

import { motion, AnimatePresence } from "framer-motion";

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
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: "120%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "120%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 340, damping: 32, mass: 0.85 }}
          className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 sm:px-6"
        >
          <div className="mx-auto max-w-6xl">
            <div
              className="flex items-center justify-between rounded-2xl px-5 py-3.5 shadow-[0_8px_32px_rgba(45,106,79,0.25)]"
              style={{ backgroundColor: "#2d6a4f" }}
            >
              <div className="flex items-center gap-2.5">
                <motion.span
                  key={selectedCount}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 24 }}
                  className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-bold tabular-nums text-[#2d6a4f]"
                >
                  {selectedCount}
                </motion.span>
                <span className="text-[14px] font-semibold text-[#f5f3ee]">
                  명 선택됨
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClearSelection}
                  className="rounded-xl px-3 py-1.5 text-[13px] font-medium text-[#d6ede2] transition-colors hover:bg-[#3a7d5e] hover:text-white"
                >
                  선택 해제
                </button>
                <button
                  onClick={onSendMessage}
                  className="rounded-xl bg-white px-4 py-1.5 text-[13px] font-bold text-[#2d6a4f] transition-all hover:bg-[#f5f3ee] active:scale-95"
                >
                  메시지 발송
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
