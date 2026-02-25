"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MyReviewsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/my-reviews");
  }, [router]);
  return null;
}
