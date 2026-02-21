"use client";

import { Suspense } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { ChatPageContent } from "./_components/ChatPageContent";

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-60px)] items-center justify-center">
          <Spinner size="lg" className="text-[#4a8c6a]" />
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}
