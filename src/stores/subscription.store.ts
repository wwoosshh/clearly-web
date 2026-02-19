import { create } from "zustand";
import api from "@/lib/api";
import type { ActiveSubscription, EstimateLimitInfo, SubscriptionPlan } from "@/types";

interface SubscriptionStackItem {
  id: string;
  companyId: string;
  planId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  projectedEnd: string;
  isTrial: boolean;
  pausedAt: string | null;
  plan: {
    id: string;
    name: string;
    tier: string;
    durationMonths: number;
    price: number;
    dailyEstimateLimit: number;
    priorityWeight: number;
  };
}

interface SubscriptionState {
  subscription: ActiveSubscription | null;
  subscriptionStack: SubscriptionStackItem[];
  estimateLimit: EstimateLimitInfo | null;
  plans: { BASIC: SubscriptionPlan[]; PRO: SubscriptionPlan[]; PREMIUM: SubscriptionPlan[] } | null;
  showPaymentPopup: boolean;
  isLoading: boolean;

  fetchSubscription: () => Promise<void>;
  fetchSubscriptionStack: () => Promise<void>;
  fetchEstimateLimit: () => Promise<void>;
  fetchPlans: () => Promise<void>;
  setShowPaymentPopup: (show: boolean) => void;
  reset: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  subscription: null,
  subscriptionStack: [],
  estimateLimit: null,
  plans: null,
  showPaymentPopup: false,
  isLoading: false,

  fetchSubscription: async () => {
    try {
      const { data } = await api.get("/subscriptions/my");
      set({ subscription: data?.data ?? null });
    } catch {
      set({ subscription: null });
    }
  },

  fetchSubscriptionStack: async () => {
    try {
      const { data } = await api.get("/subscriptions/my/stack");
      const stack = data?.data ?? data ?? [];
      set({ subscriptionStack: Array.isArray(stack) ? stack : [] });
    } catch {
      set({ subscriptionStack: [] });
    }
  },

  fetchEstimateLimit: async () => {
    try {
      const { data } = await api.get("/subscriptions/my/estimate-limit");
      const limit = data?.data ?? data;
      set({ estimateLimit: limit });
    } catch {
      set({ estimateLimit: null });
    }
  },

  fetchPlans: async () => {
    try {
      const { data } = await api.get("/subscriptions/plans");
      const plans = data?.data ?? data;
      set({ plans });
    } catch {
      set({ plans: null });
    }
  },

  setShowPaymentPopup: (show) => set({ showPaymentPopup: show }),

  reset: () =>
    set({
      subscription: null,
      subscriptionStack: [],
      estimateLimit: null,
      plans: null,
      showPaymentPopup: false,
    }),
}));
