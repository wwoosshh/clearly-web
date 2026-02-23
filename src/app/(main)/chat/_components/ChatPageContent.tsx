"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/stores/auth.store";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { showToast } from "@/components/ui/Toast";
import { chatCache } from "@/lib/chatCache";
import { uploadImage } from "@/lib/upload";
import { unwrapResponse, unwrapPaginatedResponse } from "@/lib/apiHelpers";
import type { ChatRoomDetail, ChatMessageDetail } from "@/types";

import { useChatState, createTempMessage, isTempId } from "../_hooks/useChatState";
import { useChatSocket } from "../_hooks/useChatSocket";
import { ChatRoomList } from "./ChatRoomList";
import { ChatHeader } from "./ChatHeader";
import { ChatBanners } from "./ChatBanners";
import { ChatInputArea } from "./ChatInputArea";
import { ChatMessages } from "./ChatMessages";
import { DeclineModal } from "./modals/DeclineModal";
import { CompleteModal } from "./modals/CompleteModal";
import { ConsultationCompleteModal, type ConsultationCompleteDetails } from "./modals/ConsultationCompleteModal";
import { ReportModal } from "./modals/ReportModal";
import { CompletionReportModal } from "./modals/CompletionReportModal";
import { CompletionConfirmModal } from "./modals/CompletionConfirmModal";

const ImageLightbox = dynamic(
  () => import("@/components/ui/ImageLightbox").then((m) => m.ImageLightbox),
  { ssr: false },
);

export function ChatPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const companyIdParam = searchParams.get("companyId");
  const roomIdParam = searchParams.get("room");
  const { user } = useAuthStore();

  const {
    rooms, setRooms,
    selectedRoom, setSelectedRoom,
    messages, setMessages,
    newMessage, setNewMessage,
    isLoading, setIsLoading,
    isSending, setIsSending,
    showMobileChat, setShowMobileChat,
    showDeclineModal, setShowDeclineModal,
    isDeclining, setIsDeclining,
    showReportModal, setShowReportModal,
    showCompleteModal, setShowCompleteModal,
    showConsultationCompleteModal, setShowConsultationCompleteModal,
    isCompleting, setIsCompleting,
    isLoadingMessages, setIsLoadingMessages,
    isUploadingImage, setIsUploadingImage,
    lightboxImages, setLightboxImages,
    lightboxIndex, setLightboxIndex,
    showCompletionReportModal, setShowCompletionReportModal,
    completionImages, setCompletionImages,
    isSubmittingReport, setIsSubmittingReport,
    isUploadingCompletionImage, setIsUploadingCompletionImage,
    completionImageInputRef,
    showCompletionConfirmModal, setShowCompletionConfirmModal,
    isConfirmingCompletion, setIsConfirmingCompletion,
    consultationModalForConfirm, setConsultationModalForConfirm,
    isRefreshing, setIsRefreshing,
    imageInputRef,
    chatScrollRef,
  } = useChatState();

  const selectedRoomRef = useRef<ChatRoomDetail | null>(null);
  // POST /chat/rooms 중복 호출 방지: 동일 companyId로 이미 방 생성이 시작된 경우 차단
  const roomCreatedForCompanyRef = useRef<string | null>(null);

  // selectedRoom이 바뀔 때 ref도 동기화 (소켓 콜백 내에서 최신값 참조용)
  useEffect(() => {
    selectedRoomRef.current = selectedRoom;
  }, [selectedRoom]);

  const socketRef = useChatSocket({
    user,
    selectedRoomRef,
    setMessages,
    setRooms,
  });

  // ─── 서버에서 방 목록 가져오기 (백그라운드) ──────────
  const syncRooms = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await api.get("/chat/rooms");
      const result = unwrapResponse<ChatRoomDetail[]>(response);
      const serverRooms: ChatRoomDetail[] = Array.isArray(result) ? result : [];
      setRooms(serverRooms);
      chatCache.setRooms(serverRooms);
      // 현재 열려있는 방이 있으면 최신 데이터로 동기화 (스테일 캐시로 인한 잘못된 조작 방지)
      const currentRoom = selectedRoomRef.current;
      if (currentRoom) {
        const freshRoom = serverRooms.find((r) => r.id === currentRoom.id);
        if (freshRoom) setSelectedRoom(freshRoom);
      }
    } catch {
      // 캐시 데이터 유지
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [setRooms, setIsLoading, setSelectedRoom, setIsRefreshing]);

  // ─── 서버에서 메시지 가져오기 (백그라운드) ────────────
  const syncMessages = useCallback(async (roomId: string) => {
    try {
      const response = await api.get(`/chat/rooms/${roomId}/messages`);
      const { data: serverMessages } =
        unwrapPaginatedResponse<ChatMessageDetail>(response);
      // 응답 도착 시 이미 다른 방으로 이동한 경우 무시
      if (selectedRoomRef.current?.id !== roomId) return;
      setMessages((prev) => {
        // 전송중인 temp 메시지는 유지
        const pending = prev.filter((m) => isTempId(m.id));
        const merged = [...serverMessages];
        for (const p of pending) {
          if (!merged.some((m) => m.content === p.content && m.senderId === p.senderId)) {
            merged.push(p);
          }
        }
        return merged;
      });
      chatCache.setMessages(roomId, serverMessages);
    } catch {
      // 캐시 데이터 유지
    } finally {
      if (selectedRoomRef.current?.id === roomId) {
        setIsLoadingMessages(false);
      }
    }
  }, [setMessages, setIsLoadingMessages]);

  // ─── 초기 로드 + companyId 자동 채팅방 생성 / roomId 자동 선택 ──────────
  useEffect(() => {
    if (!user) return;

    if (companyIdParam) {
      // Next.js soft navigation 중 useSearchParams 값이 일시 변동하여 useEffect가
      // 재실행될 수 있음 → 같은 companyId로 이미 방 생성을 시작했다면 중복 차단
      if (roomCreatedForCompanyRef.current === companyIdParam) return;
      roomCreatedForCompanyRef.current = companyIdParam;
      (async () => {
        try {
          const response = await api.post("/chat/rooms", {
            companyId: companyIdParam,
          });
          const room = unwrapResponse<ChatRoomDetail>(response);
          setSelectedRoom(room);
          setShowMobileChat(true);
          // 캐시에서 메시지 즉시 로드
          const cached = chatCache.getMessages(room.id);
          if (cached?.length) setMessages(cached);
          syncMessages(room.id);
        } catch {
          // silent
        }
        syncRooms();
      })();
    } else if (roomIdParam) {
      (async () => {
        await syncRooms();
        try {
          const response = await api.get(`/chat/rooms/${roomIdParam}`);
          const room = unwrapResponse<ChatRoomDetail>(response);
          setSelectedRoom(room);
          setShowMobileChat(true);
          const cached = chatCache.getMessages(room.id);
          if (cached?.length) setMessages(cached);
          syncMessages(room.id);
        } catch {
          // silent
        }
      })();
    } else {
      syncRooms();
    }
  }, [companyIdParam, roomIdParam, user, syncRooms, syncMessages, setSelectedRoom, setShowMobileChat, setMessages]);

  // ─── 방 선택 시: 캐시 먼저, 서버 동기화는 백그라운드 ─
  useEffect(() => {
    if (!selectedRoom) return;

    // 0) 이전 방 메시지 즉시 제거 + 안읽은 카운트 초기화
    setMessages([]);
    setRooms((prev) =>
      prev.map((r) =>
        r.id === selectedRoom.id ? { ...r, unreadCount: 0 } : r
      )
    );

    // 1) 캐시에서 즉시 로드
    const cached = chatCache.getMessages(selectedRoom.id);
    if (cached?.length) {
      setMessages(cached);
    }

    // 2) 로딩 상태 시작
    setIsLoadingMessages(true);

    // 3) 소켓 방 입장 + 읽음 처리
    if (socketRef.current) {
      socketRef.current.emit("joinRoom", selectedRoom.id);
      socketRef.current.emit("markRead", selectedRoom.id);
    }

    // 4) 서버에서 최신 데이터 동기화 (백그라운드)
    syncMessages(selectedRoom.id);
    api.patch(`/chat/rooms/${selectedRoom.id}/read`).catch(() => {});

    return () => {
      if (selectedRoom && socketRef.current) {
        socketRef.current.emit("leaveRoom", selectedRoom.id);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoom]);

  // ─── 메시지 전송 (Optimistic) ──────────────────────
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedRoom || !user || isSending) return;
    const content = newMessage.trim();
    setIsSending(true);
    setNewMessage("");

    // 1) Optimistic: 즉시 화면에 추가
    const tempMsg = createTempMessage(
      selectedRoom.id,
      user.id,
      user.name,
      content,
    );
    setMessages((prev) => [...prev, tempMsg]);
    setRooms((prev) =>
      prev.map((r) =>
        r.id === selectedRoom.id
          ? { ...r, lastMessage: content, lastSentAt: tempMsg.createdAt }
          : r
      )
    );

    // 2) 서버에 전송 (백그라운드)
    try {
      if (socketRef.current?.connected) {
        socketRef.current.emit("sendMessage", {
          roomId: selectedRoom.id,
          content,
        });
      } else {
        // REST 폴백
        const response = await api.post(
          `/chat/rooms/${selectedRoom.id}/messages`,
          { content },
        );
        const real = unwrapResponse<ChatMessageDetail>(response);
        // temp -> real 교체
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempMsg.id ? real : m,
          ),
        );
        chatCache.replaceTempMessage(
          selectedRoom.id,
          user.id,
          content,
          real,
        );
      }
    } catch {
      // 전송 실패: temp 메시지에 실패 표시 가능 (현재는 유지)
      setNewMessage(content);
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
    } finally {
      setIsSending(false);
    }
  };

  // ─── 이미지 전송 ──────────────────────────────────
  const handleImageSend = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedRoom || !user || isUploadingImage) return;
    e.target.value = "";

    setIsUploadingImage(true);
    try {
      const result = await uploadImage(file, "chat");
      // Optimistic 메시지
      const tempMsg = createTempMessage(
        selectedRoom.id,
        user.id,
        user.name,
        "[이미지]",
      );
      tempMsg.messageType = "IMAGE";
      tempMsg.fileUrl = result.url;
      setMessages((prev) => [...prev, tempMsg]);

      if (socketRef.current?.connected) {
        socketRef.current.emit("sendMessage", {
          roomId: selectedRoom.id,
          content: "[이미지]",
          messageType: "IMAGE",
          fileUrl: result.url,
        });
      } else {
        const msgResponse = await api.post(
          `/chat/rooms/${selectedRoom.id}/messages`,
          { content: "[이미지]", messageType: "IMAGE", fileUrl: result.url },
        );
        const real = unwrapResponse<ChatMessageDetail>(msgResponse);
        setMessages((prev) =>
          prev.map((m) => (m.id === tempMsg.id ? real : m)),
        );
      }
    } catch {
      // silent
    } finally {
      setIsUploadingImage(false);
    }
  };

  // ─── 거래 취소 (Optimistic) ────────────────────────
  const handleDecline = async () => {
    if (!selectedRoom || isDeclining) return;
    setIsDeclining(true);

    // Optimistic: 모달 즉시 닫기 + 상태 업데이트
    setShowDeclineModal(false);
    const isCompany = user?.role === "COMPANY";
    const declinePatch = isCompany
      ? { companyDeclined: true }
      : { userDeclined: true };

    setSelectedRoom((prev) => prev ? { ...prev, ...declinePatch } : prev);
    setRooms((prev) =>
      prev.map((r) =>
        r.id === selectedRoom.id ? { ...r, ...declinePatch } : r
      )
    );

    try {
      const declineResponse = await api.patch(`/chat/rooms/${selectedRoom.id}/decline`);
      const result = unwrapResponse<{ bothDeclined?: boolean }>(declineResponse);
      // 서버 응답으로 정확한 상태 동기화 (양측 취소 여부 반영)
      if (result.bothDeclined) {
        const bothPatch = { userDeclined: true, companyDeclined: true, refundStatus: "REQUESTED" as const };
        setSelectedRoom((prev) => prev ? { ...prev, ...bothPatch } : prev);
        setRooms((prev) => prev.map((r) => r.id === selectedRoom.id ? { ...r, ...bothPatch } : r));
      }
      syncMessages(selectedRoom.id);
    } catch {
      // 실패 시 롤백
      const rollbackPatch = isCompany
        ? { companyDeclined: false }
        : { userDeclined: false };
      setSelectedRoom((prev) => prev ? { ...prev, ...rollbackPatch } : prev);
      setRooms((prev) =>
        prev.map((r) =>
          r.id === selectedRoom.id ? { ...r, ...rollbackPatch } : r
        )
      );
    } finally {
      setIsDeclining(false);
    }
  };

  // ─── 거래완료 ────────────────────────────────────
  const handleComplete = async (details?: ConsultationCompleteDetails) => {
    if (!selectedRoom || isCompleting) return;
    setIsCompleting(true);
    setShowCompleteModal(false);
    setShowConsultationCompleteModal(false);

    try {
      const completeResponse = await api.patch(
        `/chat/rooms/${selectedRoom.id}/complete`,
        details ?? {},
      );
      const result = unwrapResponse<{ matchingId?: string; companyId?: string }>(completeResponse);
      // 즉시 UI 반영: 매칭 완료 상태
      const completedPatch = {
        matching: {
          ...selectedRoom.matching,
          id: selectedRoom.matching?.id || result.matchingId || "",
          status: "COMPLETED",
          completedAt: new Date().toISOString(),
        },
      } as Partial<ChatRoomDetail>;
      setSelectedRoom((prev) => prev ? { ...prev, ...completedPatch } : prev);
      setRooms((prev) => prev.map((r) => r.id === selectedRoom.id ? { ...r, ...completedPatch } : r));
      syncMessages(selectedRoom.id);
      // replace: 뒤로가기 시 /chat?companyId=X 로 돌아가지 않도록 히스토리 교체
      // 'company' 파라미터명 사용: chat 페이지의 'companyId' useSearchParams와 구별하여
      // useEffect 중복 트리거(POST /chat/rooms 재호출) 방지
      router.replace(`/review/write?matchingId=${result.matchingId}&company=${result.companyId}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "거래완료 처리에 실패했습니다.";
      showToast("오류", msg);
    } finally {
      setIsCompleting(false);
    }
  };

  // ─── 거래완료 버튼 클릭 분기 ─────────────────────
  const handleShowCompleteModal = () => {
    if (!selectedRoom || isRefreshing) return;
    // 이미 완료된 매칭은 재완료 불가 (뒤로가기 후 stale 캐시 상태에서 실수로 재완료 방지)
    if (selectedRoom.matching?.status === "COMPLETED") return;
    // 직접 채팅 상담(CONSULTATION)이면 정보입력 모달, 아니면 단순 확인 모달
    if (selectedRoom.matching?.cleaningType === "CONSULTATION") {
      setConsultationModalForConfirm(false);
      setShowConsultationCompleteModal(true);
    } else {
      setShowCompleteModal(true);
    }
  };

  // ─── 완료확인 버튼 클릭 → CompletionConfirmModal 열기 ────────────
  const handleShowCompletionConfirmModal = () => {
    if (!selectedRoom || isRefreshing) return;
    // 완료보고 이미지 확인 먼저 (CompletionConfirmModal) → 그 다음 타입별 분기
    setShowCompletionConfirmModal(true);
  };

  // ─── CompletionConfirmModal "완료 확인" 클릭 분기 ─────────────
  // 1) CompletionConfirmModal을 닫고
  // 2) CONSULTATION이면 ConsultationCompleteModal(거래정보 입력) 열기
  // 3) 아니면 바로 confirm-completion API 호출
  const handleCompletionConfirmModalConfirm = () => {
    setShowCompletionConfirmModal(false);
    if (selectedRoom?.matching?.cleaningType === "CONSULTATION") {
      setConsultationModalForConfirm(true);
      setShowConsultationCompleteModal(true);
    } else {
      handleConfirmCompletion();
    }
  };

  // ─── 완료보고 이미지 업로드 (업체용) ─────────────────
  const handleCompletionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isUploadingCompletionImage) return;
    e.target.value = "";

    if (completionImages.length >= 5) {
      showToast("업로드 제한", "최대 5장까지 업로드할 수 있습니다.");
      return;
    }

    setIsUploadingCompletionImage(true);
    try {
      const result = await uploadImage(file, "completion");
      setCompletionImages((prev) => [...prev, result.url]);
    } catch {
      showToast("오류", "이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploadingCompletionImage(false);
    }
  };

  const handleRemoveCompletionImage = (index: number) => {
    setCompletionImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── 완료보고 제출 (업체용) ──────────────────────────
  const handleSubmitCompletionReport = async () => {
    const reportMatchingId = selectedRoom?.matching?.id || selectedRoom?.matchingId;
    if (!reportMatchingId || isSubmittingReport || completionImages.length === 0) return;
    setIsSubmittingReport(true);

    try {
      const submittedImages = [...completionImages];
      await api.post(`/matchings/requests/${reportMatchingId}/report-completion`, {
        images: submittedImages,
      });
      setShowCompletionReportModal(false);
      setCompletionImages([]);
      // 즉시 UI 반영: 완료보고 상태
      const reportPatch = {
        matching: {
          ...selectedRoom!.matching,
          id: selectedRoom!.matching?.id || selectedRoom!.matchingId || "",
          status: selectedRoom!.matching?.status || "ACCEPTED",
          completionImages: submittedImages,
          completionReportedAt: new Date().toISOString(),
        },
      } as Partial<ChatRoomDetail>;
      setSelectedRoom((prev) => prev ? { ...prev, ...reportPatch } : prev);
      setRooms((prev) => prev.map((r) => r.id === selectedRoom!.id ? { ...r, ...reportPatch } : r));
      syncMessages(selectedRoom!.id);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "완료 보고에 실패했습니다.";
      showToast("오류", msg);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // ─── 완료확인 (사용자용) ──────────────────────────────
  const handleConfirmCompletion = async (details?: ConsultationCompleteDetails) => {
    const confirmMatchingId = selectedRoom?.matching?.id || selectedRoom?.matchingId;
    if (!confirmMatchingId || isConfirmingCompletion) return;
    setIsConfirmingCompletion(true);
    setShowCompletionConfirmModal(false);
    setShowConsultationCompleteModal(false);
    setConsultationModalForConfirm(false);

    try {
      await api.patch(`/matchings/requests/${confirmMatchingId}/confirm-completion`, details ?? {});
      // 즉시 UI 반영: 매칭 완료 상태
      const completedPatch = {
        matching: {
          ...selectedRoom!.matching,
          id: selectedRoom!.matching?.id || selectedRoom!.matchingId || "",
          status: "COMPLETED",
          completedAt: new Date().toISOString(),
        },
      } as Partial<ChatRoomDetail>;
      setSelectedRoom((prev) => prev ? { ...prev, ...completedPatch } : prev);
      setRooms((prev) => prev.map((r) => r.id === selectedRoom!.id ? { ...r, ...completedPatch } : r));
      syncMessages(selectedRoom!.id);
      // replace: 뒤로가기 시 /chat?companyId=X 로 돌아가지 않도록 히스토리 교체
      // 'company' 파라미터명 사용: chat 페이지의 'companyId' useSearchParams와 구별하여
      // useEffect 중복 트리거(POST /chat/rooms 재호출) 방지
      router.replace(`/review/write?matchingId=${confirmMatchingId}&company=${selectedRoom!.companyId}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "완료 확인에 실패했습니다.";
      showToast("오류", msg);
    } finally {
      setIsConfirmingCompletion(false);
    }
  };

  // ─── Room selection handler ─────────────────────────
  const handleSelectRoom = (room: ChatRoomDetail) => {
    setSelectedRoom(room);
    setShowMobileChat(true);
  };

  const handleBack = () => {
    setShowMobileChat(false);
    setSelectedRoom(null);
  };

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-60px)] items-center justify-center">
        <p className="text-[15px] text-[#72706a]">로그인이 필요합니다</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-60px)] items-center justify-center">
        <Spinner size="lg" className="text-[#4a8c6a]" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-60px)]">
      {/* 좌측: 채팅방 목록 */}
      <ChatRoomList
        rooms={rooms}
        selectedRoom={selectedRoom}
        showMobileChat={showMobileChat}
        user={user}
        onSelectRoom={handleSelectRoom}
      />

      {/* 우측: 대화 영역 */}
      <div
        className={cn(
          "flex flex-1 flex-col bg-[#f5f3ee]",
          !showMobileChat && !selectedRoom ? "hidden md:flex" : "flex"
        )}
      >
        {selectedRoom ? (
          <>
            <ChatHeader
              selectedRoom={selectedRoom}
              user={user}
              onBack={handleBack}
              onShowDeclineModal={() => setShowDeclineModal(true)}
              onShowReportModal={() => {
                setShowReportModal(true);
              }}
              onShowCompleteModal={handleShowCompleteModal}
              onShowCompletionReportModal={() => {
                setCompletionImages([]);
                setShowCompletionReportModal(true);
              }}
              onShowCompletionConfirmModal={handleShowCompletionConfirmModal}
              isCompleting={isCompleting}
              isConfirmingCompletion={isConfirmingCompletion}
              isRefreshing={isRefreshing}
            />

            <ChatBanners
              selectedRoom={selectedRoom}
              user={user}
              onConfirmCompletion={handleShowCompletionConfirmModal}
              isConfirmingCompletion={isConfirmingCompletion}
              isRefreshing={isRefreshing}
              router={router}
            />

            <ChatMessages
              chatScrollRef={chatScrollRef}
              isLoadingMessages={isLoadingMessages}
              messages={messages}
              user={user}
              setLightboxImages={setLightboxImages}
              setLightboxIndex={setLightboxIndex}
            />

            <ChatInputArea
              selectedRoom={selectedRoom}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              onSend={handleSend}
              onImageSend={handleImageSend}
              isSending={isSending}
              isUploadingImage={isUploadingImage}
              imageInputRef={imageInputRef}
            />
          </>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f0ede8]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#72706a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="mt-4 text-[15px] text-[#72706a]">채팅방을 선택해주세요</p>
            </div>
          </div>
        )}
      </div>

      <DeclineModal
        isOpen={showDeclineModal}
        onClose={() => setShowDeclineModal(false)}
        onDecline={handleDecline}
        isDeclining={isDeclining}
      />

      <CompleteModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onComplete={() => handleComplete()}
        isCompleting={isCompleting}
      />

      <ConsultationCompleteModal
        isOpen={showConsultationCompleteModal}
        onClose={() => {
          setShowConsultationCompleteModal(false);
          setConsultationModalForConfirm(false);
        }}
        onComplete={(details) => {
          if (consultationModalForConfirm) {
            handleConfirmCompletion(details);
          } else {
            handleComplete(details);
          }
        }}
        isCompleting={consultationModalForConfirm ? isConfirmingCompletion : isCompleting}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        selectedRoom={selectedRoom}
        user={user}
      />

      <CompletionReportModal
        isOpen={showCompletionReportModal}
        onClose={() => {
          setShowCompletionReportModal(false);
          setCompletionImages([]);
        }}
        onSubmit={handleSubmitCompletionReport}
        completionImages={completionImages}
        onImageUpload={handleCompletionImageUpload}
        onRemoveImage={handleRemoveCompletionImage}
        isSubmitting={isSubmittingReport}
        isUploading={isUploadingCompletionImage}
        imageInputRef={completionImageInputRef}
      />

      <CompletionConfirmModal
        isOpen={showCompletionConfirmModal}
        onClose={() => setShowCompletionConfirmModal(false)}
        onConfirm={handleCompletionConfirmModalConfirm}
        selectedRoom={selectedRoom}
        isConfirming={isConfirmingCompletion}
        setLightboxImages={setLightboxImages}
        setLightboxIndex={setLightboxIndex}
      />

      {lightboxImages.length > 0 && (
        <ImageLightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxImages([])}
        />
      )}
    </div>
  );
}
