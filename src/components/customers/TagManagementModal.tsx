"use client";

import { useState } from "react";
import { CompanyTag } from "@/types";

interface TagManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  tags: CompanyTag[];
  onCreateTag: (name: string, color: string) => Promise<void>;
  onDeleteTag: (tagId: string) => Promise<void>;
}

const PRESET_COLORS = [
  "#6b7280",
  "#ef4444",
  "#f59e0b",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-semibold text-gray-900">
            태그 관리
          </h3>
          <button
            onClick={onClose}
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

        <div className="mt-4 max-h-[300px] space-y-1.5 overflow-y-auto">
          {tags.length === 0 && (
            <p className="py-6 text-center text-[13px] text-gray-400">
              등록된 태그가 없습니다
            </p>
          )}
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-gray-50"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="text-[14px] text-gray-700">{tag.name}</span>
              </div>
              <button
                onClick={() => handleDelete(tag.id)}
                disabled={deletingId === tag.id}
                className="text-[12px] text-gray-400 hover:text-red-500 disabled:opacity-50"
              >
                {deletingId === tag.id ? "..." : "삭제"}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="새 태그 이름"
              maxLength={50}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
            />
            <button
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
              className="rounded-lg bg-gray-900 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
            >
              {creating ? "..." : "추가"}
            </button>
          </div>
          <div className="mt-2.5 flex gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setNewColor(color)}
                className={`h-6 w-6 rounded-full transition-all ${
                  newColor === color
                    ? "ring-2 ring-gray-900 ring-offset-2"
                    : "hover:scale-110"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
