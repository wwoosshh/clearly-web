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
  if (value >= 100000000) return `${Math.floor(value / 100000000)}억`;
  if (value >= 10000) return `${Math.floor(value / 10000)}만`;
  return value.toLocaleString();
}

function formatRevenue(value: number): string {
  if (value >= 100000000) return `${Math.floor(value / 100000000)}억원`;
  if (value >= 10000) return `${Math.floor(value / 10000)}만원`;
  return `${value.toLocaleString()}원`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[#e2ddd6] bg-white px-3.5 py-2.5 shadow-lg">
      <p className="text-[11px] font-medium text-[#a8a49c]">{label}</p>
      <p className="mt-0.5 text-[14px] font-bold text-[#141412]">
        {Number(payload[0].value).toLocaleString()}원
      </p>
    </div>
  );
}

export default function StatsBar({ stats, loading }: StatsBarProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-[#e2ddd6] bg-white p-5"
            >
              <div className="h-8 w-16 rounded-lg bg-[#f0ede8]" />
              <div className="mt-2 h-3.5 w-12 rounded bg-[#f0ede8]" />
            </div>
          ))}
        </div>
        <div className="h-[200px] animate-pulse rounded-2xl bg-[#f5f3ee] border border-[#e2ddd6]" />
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      label: "총 고객",
      value: stats.totalCustomers.toLocaleString(),
      suffix: "명",
      accent: "#141412",
    },
    {
      label: "이달 신규",
      value: stats.newThisMonth.toLocaleString(),
      suffix: "명",
      accent: "#4a8c6a",
    },
    {
      label: "재방문율",
      value: `${stats.repeatRate}`,
      suffix: "%",
      accent: "#2d6a4f",
    },
    {
      label: "총 매출",
      value: formatCurrency(stats.totalRevenue),
      suffix: "원",
      accent: "#2d6a4f",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="group rounded-2xl border border-[#e2ddd6] bg-white px-5 py-4 transition-shadow hover:shadow-[0_4px_16px_rgba(20,20,18,0.07)]"
          >
            <div className="flex items-baseline gap-0.5">
              <p
                className="text-[28px] font-bold tabular-nums leading-none"
                style={{ color: card.accent }}
              >
                {card.value}
              </p>
              <span className="text-[13px] font-medium" style={{ color: card.accent, opacity: 0.7 }}>
                {card.suffix}
              </span>
            </div>
            <p className="mt-1.5 text-[12px] text-[#a8a49c]">{card.label}</p>
          </div>
        ))}
      </div>

      {stats.monthlyRevenue.length > 0 && (
        <div className="rounded-2xl border border-[#e2ddd6] bg-white px-5 py-4">
          <p className="mb-4 text-[13px] font-semibold text-[#72706a]">
            월별 매출
          </p>
          <ResponsiveContainer width="100%" height={156}>
            <BarChart data={stats.monthlyRevenue} barCategoryGap="35%">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0ede8"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#a8a49c", fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#a8a49c" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatCurrency(v)}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#f0ede8", radius: 6 }}
              />
              <Bar
                dataKey="revenue"
                fill="#2d6a4f"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {stats.topCustomers && stats.topCustomers.length > 0 && (
        <div className="rounded-2xl border border-[#e2ddd6] bg-white px-5 py-4">
          <p className="mb-3 text-[13px] font-semibold text-[#72706a]">
            매출 상위 고객
          </p>
          <div className="space-y-2">
            {stats.topCustomers.slice(0, 3).map((c, i) => (
              <div
                key={c.userId}
                className="flex items-center justify-between py-1"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                    style={{
                      backgroundColor: i === 0 ? "#d97706" : i === 1 ? "#a8a49c" : "#c8c4bc",
                      color: "#fff",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-[13px] font-medium text-[#141412]">
                    {c.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-[#a8a49c]">
                    완료 {c.completedMatchings}건
                  </span>
                  <span className="text-[13px] font-semibold tabular-nums text-[#2d6a4f]">
                    {formatRevenue(c.totalRevenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
