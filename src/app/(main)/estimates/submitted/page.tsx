"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SubmittedEstimatesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/my-estimates");
  }, [router]);
  return null;
}
