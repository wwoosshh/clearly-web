// =====================
// Clearly - 공통 타입 정의
// =====================

/** 사용자 역할 */
export type UserRole = "USER" | "COMPANY" | "ADMIN";

/** 매칭 상태 */
export type MatchingStatus =
  | "pending"
  | "quoted"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled";

/** 리뷰 상태 */
export type ReviewStatus = "visible" | "hidden" | "reported";

/** 사용자 */
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

/** 업체 */
export interface Company {
  id: string;
  userId: string;
  name: string;
  businessName?: string;
  businessNumber: string;
  description: string;
  address: string;
  phone: string;
  profileImage?: string;
  profileImages?: string[];
  averageRating: number;
  totalReviews: number;
  totalMatchings?: number;
  isVerified: boolean;
  serviceAreas: string[];
  specialties?: string[];
  minPrice?: number;
  maxPrice?: number;
  certificates?: string[];
  responseTime?: number;
  contactHours?: string;
  employeeCount?: number;
  companyUrl?: string;
  experienceYears?: number;
  experienceDescription?: string;
  education?: string;
  serviceDetail?: string;
  portfolio?: { title: string; description: string; images: string[] }[];
  certificationDocs?: { name: string; imageUrl: string }[];
  businessRegistration?: string;
  identityVerified?: boolean;
  paymentMethods?: string[];
  contactEmail?: string;
  serviceRange?: number;
  videos?: string[];
  faq?: { question: string; answer: string }[];
  user?: {
    id: string;
    name: string;
    profileImage?: string;
  };
  createdAt: string;
  updatedAt: string;
}

/** 매칭 요청 */
export interface Matching {
  id: string;
  customerId: string;
  companyId?: string;
  address: string;
  detailAddress?: string;
  moveDate: string;
  houseType: string;
  houseSize: number;
  status: MatchingStatus;
  requestMessage?: string;
  quotedPrice?: number;
  finalPrice?: number;
  createdAt: string;
  updatedAt: string;
  customer?: User;
  company?: Company;
  quotes?: Quote[];
}

/** 견적 */
export interface Quote {
  id: string;
  matchingId: string;
  companyId: string;
  price: number;
  message?: string;
  estimatedDuration?: string;
  createdAt: string;
  company?: Company;
}

/** 채팅방 */
export interface ChatRoom {
  id: string;
  matchingId: string;
  customerId: string;
  companyId: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  createdAt: string;
  customer?: User;
  company?: Company;
  matching?: Matching;
}

/** 채팅 메시지 */
export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  content: string;
  messageType: "text" | "image" | "system";
  isRead: boolean;
  createdAt: string;
  sender?: User;
}

/** 리뷰 */
export interface Review {
  id: string;
  matchingId: string;
  customerId: string;
  companyId: string;
  rating: number;
  content: string;
  images?: string[];
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  customer?: User;
  company?: Company;
}

/** API 응답 공통 타입 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/** 페이지네이션 응답 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** 인증 토큰 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** 로그인 요청 */
export interface LoginRequest {
  email: string;
  password: string;
}

/** 회원가입 요청 */
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: UserRole;
}

/** 업체 검색 결과 항목 */
export interface CompanySearchResult {
  id: string;
  businessName: string;
  businessNumber: string;
  representative: string;
  address: string | null;
  detailAddress: string | null;
  description: string | null;
  profileImages: string[];
  specialties: string[];
  serviceAreas: string[];
  minPrice: number | null;
  maxPrice: number | null;
  averageRating: number | null;
  totalReviews: number;
  totalMatchings: number;
  responseTime: number | null;
  identityVerified?: boolean;
  experienceYears?: number | null;
  contactHours?: string | null;
  employeeCount?: number | null;
  distance: number | null;
  score: number;
  user: {
    id: string;
    name: string;
    phone: string | null;
    profileImage: string | null;
  };
}

/** 업체 검색 응답 */
export interface CompanySearchResponse {
  data: CompanySearchResult[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  searchLocation: {
    latitude: number;
    longitude: number;
  } | null;
}

// =====================
// 견적 시스템
// =====================

/** 견적요청 상태 */
export type EstimateRequestStatus = "OPEN" | "CLOSED" | "EXPIRED";

/** 견적 상태 */
export type EstimateStatus = "SUBMITTED" | "ACCEPTED" | "REJECTED";

/** 포인트 거래 유형 */
export type PointTransactionType = "CHARGE" | "USE" | "REFUND";

/** 환불 상태 */
export type RefundStatus = "NONE" | "REQUESTED" | "APPROVED" | "REJECTED";

/** 청소 유형 */
export type CleaningType =
  | "MOVE_IN"
  | "MOVE_OUT"
  | "FULL"
  | "OFFICE"
  | "STORE"
  | "CONSTRUCTION"
  | "AIRCON"
  | "CARPET"
  | "EXTERIOR";

/** 청소 유형 라벨 매핑 */
export const CLEANING_TYPE_LABELS: Record<CleaningType, string> = {
  MOVE_IN: "입주청소",
  MOVE_OUT: "이사청소",
  FULL: "거주청소",
  OFFICE: "사무실청소",
  STORE: "상가청소",
  CONSTRUCTION: "준공청소",
  AIRCON: "에어컨청소",
  CARPET: "카펫청소",
  EXTERIOR: "외벽청소",
};

/** 견적요청 */
export interface EstimateRequest {
  id: string;
  userId: string;
  cleaningType: CleaningType;
  address: string;
  detailAddress?: string;
  areaSize?: number;
  desiredDate?: string;
  desiredTime?: string;
  message: string;
  budget?: number;
  images?: string[];
  status: EstimateRequestStatus;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string; phone?: string };
  estimates?: Estimate[];
}

/** 견적 응답 */
export interface Estimate {
  id: string;
  estimateRequestId: string;
  companyId: string;
  price: number;
  message?: string;
  estimatedDuration?: string;
  availableDate?: string;
  pointsUsed: number;
  images?: string[];
  status: EstimateStatus;
  createdAt: string;
  company?: {
    id: string;
    businessName: string;
    averageRating?: number;
    totalReviews?: number;
    user?: { id: string; name: string };
  };
  estimateRequest?: {
    id: string;
    cleaningType: CleaningType;
    address: string;
    desiredDate?: string;
    images?: string[];
    status: EstimateRequestStatus;
  };
}

/** 포인트 지갑 */
export interface PointWallet {
  id: string;
  companyId: string;
  balance: number;
}

/** 포인트 거래내역 */
export interface PointTransaction {
  id: string;
  type: PointTransactionType;
  amount: number;
  description?: string;
  relatedId?: string;
  createdAt: string;
}

/** 채팅방 (확장) */
export interface ChatRoomDetail {
  id: string;
  matchingId?: string;
  userId: string;
  companyId: string;
  isActive: boolean;
  lastMessage?: string;
  lastSentAt?: string;
  userDeclined: boolean;
  companyDeclined: boolean;
  refundStatus: RefundStatus;
  estimateId?: string;
  createdAt: string;
  unreadCount: number;
  user: { id: string; name: string; profileImage?: string };
  company: {
    id: string;
    businessName: string;
    user: { id: string; name: string; profileImage?: string };
  };
}

/** 채팅 메시지 (확장) */
export interface ChatMessageDetail {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  messageType: "TEXT" | "IMAGE" | "FILE" | "SYSTEM";
  fileUrl?: string;
  isRead: boolean;
  createdAt: string;
  sender?: { id: string; name: string; profileImage?: string };
}

// =====================
// 알림 시스템
// =====================

/** 알림 유형 */
export type NotificationType =
  | "MATCHING_REQUEST"
  | "MATCHING_ACCEPTED"
  | "MATCHING_REJECTED"
  | "NEW_MESSAGE"
  | "NEW_REVIEW"
  | "SUBSCRIPTION"
  | "SYSTEM"
  | "ESTIMATE_SUBMITTED"
  | "ESTIMATE_ACCEPTED"
  | "ESTIMATE_REJECTED"
  | "NEW_ESTIMATE_REQUEST"
  | "POINT_CHANGE";

/** 알림 */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content?: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}
