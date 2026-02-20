"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useSubscriptionStore } from "@/stores/subscription.store";
import SubscriptionPaymentPopup from "@/components/subscription/SubscriptionPaymentPopup";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const { user, isAuthenticated } = useAuthStore();
  const { subscription, fetchSubscription, setShowPaymentPopup } =
    useSubscriptionStore();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "COMPANY") {
      fetchSubscription();
    }
  }, [isAuthenticated, user, fetchSubscription]);

  // 구독 데이터 로딩이 완료된 후에만 팝업 판단
  const subscriptionLoaded = useSubscriptionStore((s) => s.subscriptionLoaded);

  useEffect(() => {
    if (isAuthenticated && user?.role === "COMPANY" && subscriptionLoaded) {
      const currentSub = useSubscriptionStore.getState().subscription;
      if (currentSub === null || currentSub.isTrial === true) {
        setShowPaymentPopup(true);
      }
    }
  }, [isAuthenticated, user, subscriptionLoaded, setShowPaymentPopup]);

  return (
    <>
      {children}
      <SubscriptionPaymentPopup />
    </>
  );
}
