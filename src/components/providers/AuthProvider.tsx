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
    if (isAuthenticated && user?.role === "COMPANY") {
      const timer = setTimeout(() => {
        const currentSub = useSubscriptionStore.getState().subscription;
        if (currentSub === null || currentSub.isTrial === true) {
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
