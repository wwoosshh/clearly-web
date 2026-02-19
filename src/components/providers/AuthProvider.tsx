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

  useEffect(() => {
    if (isAuthenticated && user?.role === "COMPANY" && subscription === null) {
      // subscription fetch 완료 후 null이면 팝업 표시
      // fetchSubscription이 완료된 후에만 체크하기 위해 약간의 딜레이
      const timer = setTimeout(() => {
        const currentSub = useSubscriptionStore.getState().subscription;
        if (currentSub === null) {
          setShowPaymentPopup(true);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, subscription, setShowPaymentPopup]);

  return (
    <>
      {children}
      <SubscriptionPaymentPopup />
    </>
  );
}
