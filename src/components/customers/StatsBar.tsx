"use client";

import { CustomerStats } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface StatsBarProps {
  stats: CustomerStats | null;
  loading: boolean;
}

function formatCurrency(value: number): string {
  if (value >= 10000) {
    return `${Math.floor(value / 10000)}만`;
  }
  return value.toLocaleString();
}

export default function StatsBar({ stats, loading }: StatsBarProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="h-8 w-16 rounded bg-gray-200" />
              <div className="mt-2 h-4 w-12 rounded bg-gray-100" />
            </div>
          ))}
        </div>
        <div className="h-[200px] animate-pulse rounded-xl bg-gray-50" />
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    { label: "총 고객", value: stats.totalCustomers.toLocaleString() },
    { label: "이달 신규", value: stats.newThisMonth.toLocaleString() },
    { label: "재방문율", value: `${stats.repeatRate}%` },
    {
      label: "총 매출",
      value: `${formatCurrency(stats.totalRevenue)}원`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >
            <p className="text-[28px] font-bold tabular-nums text-gray-900">
              {card.value}
            </p>
            <p className="mt-1 text-[13px] text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      {stats.monthlyRevenue.length > 0 && (
        <div className="rounded-xl bg-gray-50 p-5">
          <p className="mb-3 text-[13px] font-semibold text-gray-700">
            월별 매출
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={stats.monthlyRevenue}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f3f4f6"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatCurrency(v)}
              />
              <Tooltip
                formatter={(value) => [
                  `${Number(value).toLocaleString()}원`,
                  "매출",
                ]}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                }}
              />
              <Bar dataKey="revenue" fill="#111827" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
