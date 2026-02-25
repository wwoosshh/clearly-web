"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CompanyTag } from "@/types";

interface TagManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  tags: CompanyTag[];
  onCreateTag: (name: string, color: string) => Promise<void>;
  onDeleteTag: (tagId: string) => Promise<void>;
}

const PRESET_COLORS = [
  "#0284C7",
  "#0EA5E9",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#0284c7",
];

export default function TagManagementModal({
  isOpen,
  onClose,
  tags,
  onCreateTag,
  onDeleteTag,
}: TagManagementModalProps) {
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await onCreateTag(newName.trim(), newColor);
      setNewName("");
      setNewColor(PRESET_COLORS[0]);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (tagId: string) => {
    setDeletingId(tagId);
    try {
      await onDeleteTag(tagId);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-[#141412]/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="relative w-full max-w-sm rounded-2xl border border-[#e2ddd6] bg-white p-6 shadow-2xl"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[#141412]">태그 관리</h3>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#72706a] transition-colors hover:bg-[#f0ede8]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* 태그 목록 */}
            <div className="mt-4 max-h-[240px] space-y-1 overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {tags.length === 0 && (
                  <p className="py-6 text-center text-[13px] text-[#a8a49c]">
                    등록된 태그가 없습니다
                  </p>
                )}
                {tags.map((tag) => (
                  <motion.div
                    key={tag.id}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8, scale: 0.95 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-[#f5f3ee]"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-3 w-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-[14px] font-medium text-[#141412]">
                        {tag.name}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      disabled={deletingId === tag.id}
                      className="text-[12px] font-medium text-[#a8a49c] transition-colors hover:text-[#dc2626] disabled:opacity-40"
                    >
                      {deletingId === tag.id ? "..." : "삭제"}
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* 태그 추가 */}
            <div className="mt-4 border-t border-[#f0ede8] pt-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="새 태그 이름"
                  maxLength={50}
                  className="flex-1 rounded-xl border border-[#e2ddd6] bg-[#f5f3ee] px-3 py-2 text-[14px] text-[#141412] placeholder:text-[#c8c4bc] focus:border-[#0EA5E9] focus:bg-white focus:outline-none transition-colors"
                />
                <button
                  onClick={handleCreate}
                  disabled={creating || !newName.trim()}
                  className="rounded-xl px-4 py-2 text-[13px] font-bold text-white transition-all active:scale-95 disabled:opacity-40"
                  style={{ backgroundColor: newColor }}
                >
                  {creating ? "..." : "추가"}
                </button>
              </div>

              {/* 색상 선택 */}
              <div className="mt-3 flex items-center gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewColor(color)}
                    className="relative h-6 w-6 rounded-full transition-transform active:scale-90"
                    style={{
                      backgroundColor: color,
                      transform: newColor === color ? "scale(1.2)" : "scale(1)",
                      outline: newColor === color ? `2.5px solid ${color}` : "none",
                      outlineOffset: "2px",
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
