import { create } from "zustand";
import api from "@/lib/api";
import type { ActiveSubscription, EstimateLimitInfo, SubscriptionPlan } from "@/types";

interface SubscriptionState {
  subscription: ActiveSubscription | null;
  estimateLimit: EstimateLimitInfo | null;
  plans: { BASIC: SubscriptionPlan[]; PRO: SubscriptionPlan[]; PREMIUM: SubscriptionPlan[] } | null;
  showPaymentPopup: boolean;
  isLoading: boolean;

  fetchSubscription: () => Promise<void>;
  fetchEstimateLimit: () => Promise<void>;
  fetchPlans: () => Promise<void>;
  setShowPaymentPopup: (show: boolean) => void;
  reset: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  subscription: null,
  estimateLimit: null,
  plans: null,
  showPaymentPopup: false,
  isLoading: false,

  fetchSubscription: async () => {
    try {
      const { data } = await api.get("/subscriptions/my");
      const sub = data?.data ?? data;
      set({ subscription: sub });
    } catch {
      set({ subscription: null });
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
      estimateLimit: null,
      plans: null,
      showPaymentPopup: false,
    }),
}));
