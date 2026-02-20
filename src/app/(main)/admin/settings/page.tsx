"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

interface SettingEntry {
  value: any;
  description: string | null;
  updatedAt: string;
}

const CATEGORIES: Record<string, { label: string; keys: string[] }> = {
  estimate: {
    label: "견적 시스템",
    keys: [
      "max_concurrent_requests",
      "estimate_expiry_days",
      "request_expiry_days",
      "auto_complete_hours",
    ],
  },
  subscription: {
    label: "구독 설정",
    keys: [
      "free_trial_months",
      "subscription_expiry_warning_days",
      "basic_daily_estimate_limit",
      "pro_daily_estimate_limit",
      "premium_daily_estimate_limit",
    ],
  },
  payment: {
    label: "결제 설정",
    keys: ["payment_bank_name", "payment_bank_account", "payment_account_holder"],
  },
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, SettingEntry>>({});
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get("/admin/settings");
      const raw = data?.data ?? data;
      setSettings(raw);
      const edits: Record<string, string> = {};
      for (const [key, entry] of Object.entries(raw) as [string, SettingEntry][]) {
        edits[key] = String(entry.value);
      }
      setEditValues(edits);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (key: string) => {
    const rawValue = editValues[key];
    const numValue = Number(rawValue);
    const value = isNaN(numValue) ? rawValue : numValue;

    setSaving(key);
    try {
      await api.patch("/admin/settings", { [key]: value });
      await fetchSettings();
    } catch {
      alert("설정 변경에 실패했습니다.");
    } finally {
      setSaving(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e2ddd6] border-t-[#2d6a4f]" />
      </div>
    );
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <h1 className="text-xl font-bold text-[#141412]">시스템 설정</h1>
        <p className="mt-1 text-sm text-[#72706a]">
          서비스 운영에 필요한 설정값을 관리합니다.
        </p>
      </motion.div>

      {Object.entries(CATEGORIES).map(([catKey, cat]) => (
        <motion.div key={catKey} variants={fadeUp} className="mt-6">
          <h2 className="text-[15px] font-semibold text-[#141412]">{cat.label}</h2>
          <div className="mt-3 overflow-hidden rounded-xl border border-[#e2ddd6] bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#e2ddd6] bg-[#f0ede8]">
                  <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">설정키</th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">설명</th>
                  <th className="w-32 px-4 py-3 text-[12px] font-semibold text-[#72706a]">값</th>
                  <th className="w-20 px-4 py-3 text-[12px] font-semibold text-[#72706a]">작업</th>
                </tr>
              </thead>
              <tbody>
                {cat.keys.map((key) => {
                  const entry = settings[key];
                  if (!entry) return null;
                  const hasChanged = String(entry.value) !== editValues[key];
                  return (
                    <tr key={key} className="border-b border-[#e2ddd6] last:border-0">
                      <td className="px-4 py-3 font-mono text-[13px] text-[#1a1918]">{key}</td>
                      <td className="px-4 py-3 text-[13px] text-[#72706a]">{entry.description || "-"}</td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editValues[key] ?? ""}
                          onChange={(e) =>
                            setEditValues((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                          className="w-full rounded-lg border border-[#e2ddd6] px-2.5 py-1.5 text-[13px] text-[#1a1918] outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleSave(key)}
                          disabled={!hasChanged || saving === key}
                          className="rounded-lg bg-[#2d6a4f] px-3 py-1 text-[11px] font-semibold text-[#f5f3ee] transition-colors hover:bg-[#4a8c6a] disabled:opacity-30"
                        >
                          {saving === key ? "..." : "저장"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
