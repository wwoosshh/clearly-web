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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/30"
        onClick={handleClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-semibold text-gray-900">
            일괄 메시지 발송
          </h3>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p className="mt-3 text-[13px] text-gray-500">
          {recipientCount}명의 고객에게 메시지를 발송합니다
        </p>

        {result ? (
          <div className="mt-4 space-y-2">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-[14px] font-medium text-gray-900">
                발송 완료
              </p>
              <div className="mt-2 flex gap-4 text-[13px]">
                <span className="text-green-600">
                  성공: {result.successCount}건
                </span>
                {result.failCount > 0 && (
                  <span className="text-red-500">
                    실패: {result.failCount}건
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-full rounded-lg bg-gray-900 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-gray-800"
            >
              닫기
            </button>
          </div>
        ) : (
          <>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="메시지 내용을 입력하세요"
              rows={4}
              className="mt-4 w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
            />
            <button
              onClick={handleSend}
              disabled={sending || !content.trim()}
              className="mt-3 w-full rounded-lg bg-gray-900 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
            >
              {sending ? "발송 중..." : "발송"}
            </button>
          </>
        )}
      </motion.div>
    </div>
      )}
    </AnimatePresence>
  );
}
