"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

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
    keys: ["payment_bank_account"],
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900">시스템 설정</h1>
      <p className="mt-1 text-sm text-gray-500">
        서비스 운영에 필요한 설정값을 관리합니다.
      </p>

      {Object.entries(CATEGORIES).map(([catKey, cat]) => (
        <div key={catKey} className="mt-6">
          <h2 className="text-[15px] font-bold text-gray-900">{cat.label}</h2>
          <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">설정키</th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">설명</th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 w-32">값</th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 w-20">작업</th>
                </tr>
              </thead>
              <tbody>
                {cat.keys.map((key) => {
                  const entry = settings[key];
                  if (!entry) return null;
                  const hasChanged = String(entry.value) !== editValues[key];
                  return (
                    <tr key={key} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3 text-[13px] font-mono text-gray-700">{key}</td>
                      <td className="px-4 py-3 text-[13px] text-gray-600">{entry.description || "-"}</td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editValues[key] ?? ""}
                          onChange={(e) =>
                            setEditValues((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                          className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-[13px] outline-none focus:border-gray-400"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleSave(key)}
                          disabled={!hasChanged || saving === key}
                          className="rounded-md bg-gray-900 px-3 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-30"
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
        </div>
      ))}
    </div>
  );
}
