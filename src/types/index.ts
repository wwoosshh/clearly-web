// =====================
// Clearly - 공통 타입 정의
// =====================

/** 사용자 역할 */
export type UserRole = "customer" | "company" | "admin";

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
  businessNumber: string;
  description: string;
  address: string;
  phone: string;
  profileImage?: string;
  averageRating: number;
  totalReviews: number;
  isVerified: boolean;
  serviceAreas: string[];
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
