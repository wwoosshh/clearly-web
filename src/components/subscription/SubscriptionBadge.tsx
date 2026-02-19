"use client";

import { cn } from "@/lib/utils";
import type { SubscriptionTier } from "@/types";

const TIER_STYLES: Record<SubscriptionTier, { label: string; style: string }> = {
  BASIC: { label: "Basic", style: "bg-gray-100 text-gray-700" },
  PRO: { label: "Pro", style: "bg-blue-50 text-blue-700" },
  PREMIUM: { label: "Premium", style: "bg-gray-900 text-white" },
};

export default function SubscriptionBadge({ tier }: { tier?: SubscriptionTier | null }) {
  if (!tier) return null;
  const info = TIER_STYLES[tier];
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", info.style)}>
      {info.label}
    </span>
  );
}
