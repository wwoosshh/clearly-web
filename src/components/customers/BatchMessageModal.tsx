"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BatchMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientCount: number;
  onSend: (content: string) => Promise<{ successCount: number; failCount: number }>;
}

export default function BatchMessageModal({
  isOpen,
  onClose,
  recipientCount,
  onSend,
}: BatchMessageModalProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{
    successCount: number;
    failCount: number;
  } | null>(null);

  const handleSend = async () => {
    if (!content.trim()) return;
    setSending(true);
    try {
      const res = await onSend(content.trim());
      setResult(res);
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setContent("");
    setResult(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4 sm:items-center sm:pb-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-[#141412]/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="relative w-full max-w-sm rounded-2xl border border-[#e2ddd6] bg-white p-6 shadow-2xl"
          >
            {/* 헤더 */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-[#141412]">
                  일괄 메시지 발송
                </h3>
                {!result && (
                  <p className="mt-0.5 text-[13px] text-[#72706a]">
                    <span className="font-semibold text-[#2d6a4f]">{recipientCount}명</span>의 고객에게 발송합니다
                  </p>
                )}
              </div>
              <button
                onClick={handleClose}
                className="ml-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[#72706a] transition-colors hover:bg-[#f0ede8]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4 space-y-3"
                >
                  <div className="rounded-xl border border-[#d6ede2] bg-[#ebf5ef] px-4 py-3.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2d6a4f]">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <p className="text-[14px] font-bold text-[#2d6a4f]">발송 완료</p>
                    </div>
                    <div className="flex gap-4 text-[13px]">
                      <span className="font-semibold text-[#2d6a4f]">
                        성공 {result.successCount}건
                      </span>
                      {result.failCount > 0 && (
                        <span className="font-semibold text-[#dc2626]">
                          실패 {result.failCount}건
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-full rounded-xl bg-[#141412] py-2.5 text-[14px] font-bold text-white transition-all hover:bg-[#2a2a27] active:scale-[0.98]"
                  >
                    닫기
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="compose"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 space-y-3"
                >
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="메시지 내용을 입력하세요"
                    rows={4}
                    className="w-full resize-none rounded-xl border border-[#e2ddd6] bg-[#f5f3ee] px-3.5 py-3 text-[14px] text-[#141412] placeholder:text-[#c8c4bc] focus:border-[#4a8c6a] focus:bg-white focus:outline-none transition-colors"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#a8a49c] tabular-nums">
                      {content.length}자
                    </span>
                    <button
                      onClick={handleSend}
                      disabled={sending || !content.trim()}
                      className="rounded-xl px-6 py-2.5 text-[14px] font-bold text-white transition-all active:scale-[0.98] disabled:opacity-40"
                      style={{ backgroundColor: "#2d6a4f" }}
                    >
                      {sending ? (
                        <span className="flex items-center gap-1.5">
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          발송 중
                        </span>
                      ) : "발송"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
