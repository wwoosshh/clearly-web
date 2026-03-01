import { NextRequest, NextResponse } from "next/server";

// 로그인이 필요한 경로
const PROTECTED_PATHS = [
  "/chat",
  "/matching",
  "/estimates",
  "/customers",
  "/mypage",
  "/estimate",
  "/review",
  "/my-estimates",
  "/my-reviews",
];

// ADMIN 전용 경로
const ADMIN_PATHS = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const userRole = request.cookies.get("userRole")?.value;
  const isLoggedIn = !!userRole;

  // 어드민 경로: ADMIN 역할만
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // 보호 경로: 로그인 필요
  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
