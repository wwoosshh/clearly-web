"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  cream:    "#f5f3ee",
  green:    "#2d6a4f",
  greenMid: "#4a8c6a",
  text:     "#141412",
  dark:     "#1a1918",
  muted:    "#72706a",
  border:   "#e2ddd6",
  bg:       "#f0ede8",
} as const;

// iPhone 14 논리 픽셀 기준
const LW   = 390;  // logical width
const LH   = 844;  // logical height
const RATIO = LH / LW;

function calcPhone(outerW: number) {
  const bezel      = Math.round(outerW * 0.020);
  const innerW     = outerW - bezel * 2;
  const innerH     = Math.round(innerW * RATIO);
  const outerH     = innerH + bezel * 2;
  const radius     = Math.round(outerW * 0.19);
  const scale      = innerW / LW;
  return { bezel, innerW, innerH, outerH, radius, scale };
}

/* ─── 공통 UI (390px 논리 폭 기준 설계) ─────────────────── */

function StatusBar() {
  return (
    <div style={{
      height: 52,
      display: "flex", alignItems: "flex-end", justifyContent: "space-between",
      padding: "0 24px 8px",
      background: "#fff",
    }}>
      <span style={{ fontSize: 15, fontWeight: 600, color: C.dark, letterSpacing: "-0.02em" }}>9:41</span>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <svg width="17" height="12" viewBox="0 0 17 12" fill={C.dark}>
          <rect x="0"    y="8.5" width="3" height="3.5" rx="0.5" />
          <rect x="4.5"  y="5.5" width="3" height="6.5" rx="0.5" />
          <rect x="9"    y="2.5" width="3" height="9.5" rx="0.5" />
          <rect x="13.5" y="0"   width="3" height="12"  rx="0.5" opacity="0.3" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke={C.dark} strokeWidth="1.5" strokeLinecap="round">
          <path d="M1 4.5a9.5 9.5 0 0 1 14 0" />
          <path d="M3.2 7a6.2 6.2 0 0 1 9.6 0" />
          <path d="M5.5 9.5a3 3 0 0 1 5 0" />
          <circle cx="8" cy="11.5" r="1" fill={C.dark} stroke="none" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke={C.dark} strokeOpacity="0.35" />
          <rect x="1.5" y="1.5" width="16" height="9"  rx="1.5" fill={C.dark} />
          <path d="M22.5 3.8v4.4a2 2 0 0 0 0-4.4z" fill={C.dark} fillOpacity="0.4" />
        </svg>
      </div>
    </div>
  );
}

function SiteHeader({ showBack = false }: { showBack?: boolean }) {
  return (
    <div style={{
      height: 60, background: "#fff",
      borderBottom: `1px solid ${C.border}`,
      display: "flex", alignItems: "center",
      padding: "0 16px", gap: 8,
    }}>
      {showBack ? (
        <>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span style={{ fontSize: 14, color: C.muted, fontWeight: 500 }}>뒤로가기</span>
        </>
      ) : (
        <>
          <span style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: "-0.04em" }}>바른오더</span>
          <div style={{ marginLeft: "auto" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="7"  x2="20" y2="7"  />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          </div>
        </>
      )}
    </div>
  );
}

function Stars({ count, size = 14 }: { count: number; size?: number }) {
  return (
    <span style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= count ? "#f59e0b" : "none"}
          stroke={i <= count ? "#f59e0b" : C.border} strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════
   SCREEN A — 업체 찾기 (search/page.tsx + CompanyCard.tsx)
   모두 390px 논리 폭 기준 실제 사이트 디자인 그대로
═══════════════════════════════════════════════════════ */
function ScreenSearch() {
  const Chip = ({ label, active }: { label: string; active: boolean }) => (
    <div style={{
      borderRadius: 99,
      border: `1px solid ${active ? C.green : C.border}`,
      background: active ? C.green : "#fff",
      color: active ? "#f5f3ee" : C.muted,
      fontSize: 13, fontWeight: 500,
      padding: "5px 12px", whiteSpace: "nowrap",
    }}>{label}</div>
  );

  const Avatar = ({ ch, bg }: { ch: string; bg: string }) => (
    <div style={{
      width: 46, height: 46, borderRadius: 99, background: bg, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{ color: "#f5f3ee", fontSize: 18, fontWeight: 700 }}>{ch}</span>
    </div>
  );

  return (
    <div style={{ background: C.cream }}>
      <StatusBar />
      <SiteHeader />
      <div style={{ padding: "14px 16px 0" }}>

        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: "-0.02em" }}>업체 찾기</span>
          <div style={{
            border: `1px solid ${C.border}`, background: "#fff",
            borderRadius: 8, padding: "6px 12px",
            fontSize: 13, color: C.dark, fontWeight: 500,
          }}>견적 요청하기</div>
        </div>

        {/* 검색바 — 실제: h-[46px] */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <div style={{
            flex: 1, height: 46, background: "#fff",
            border: `1px solid ${C.border}`, borderRadius: 8,
            display: "flex", alignItems: "center", padding: "0 14px", gap: 8,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span style={{ fontSize: 14, color: "#a8a49c" }}>업체명 또는 키워드로 검색</span>
          </div>
          <div style={{
            height: 46, background: C.green, borderRadius: 8,
            display: "flex", alignItems: "center", padding: "0 18px",
            fontSize: 14, fontWeight: 600, color: "#fff",
          }}>검색</div>
        </div>

        {/* 전문분야 필터 */}
        <div style={{ marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: C.muted }}>전문분야</span>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 7 }}>
            <Chip label="이사청소"   active={true} />
            <Chip label="입주청소"   active={false} />
            <Chip label="거주청소"   active={false} />
            <Chip label="사무실청소" active={false} />
          </div>
        </div>

        {/* 구분선 + 정렬 */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderTop: `1px solid ${C.border}`, padding: "10px 0 12px",
        }}>
          <span style={{ fontSize: 14, color: C.muted }}>
            총 <span style={{ fontWeight: 600, color: C.green }}>12</span>개의 업체
          </span>
          <div style={{
            fontSize: 13, color: C.dark,
            border: `1px solid ${C.border}`, background: "#fff",
            borderRadius: 7, padding: "4px 10px",
          }}>추천순</div>
        </div>

        {/* 업체 카드 1 — 실제: rounded-xl border border-gray-200 bg-white p-5 */}
        <div style={{
          background: "#fff", border: `1px solid ${C.border}`,
          borderRadius: 12, padding: 16, marginBottom: 10,
        }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Avatar ch="클" bg={C.dark} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>클린하우스</span>
                <span style={{ background: C.dark, color: "#f5f3ee", fontSize: 10, fontWeight: 600, borderRadius: 99, padding: "2px 6px" }}>프리미엄</span>
              </div>
              <span style={{ fontSize: 13, color: C.muted }}>서울 강남구</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 10 }}>
            <Stars count={5} size={13} />
            <span style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>4.9</span>
            <span style={{ fontSize: 12, color: C.muted }}>(128)</span>
            <span style={{ color: C.border }}>|</span>
            <span style={{ fontSize: 12, color: C.muted }}>매칭 342건</span>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            {["입주청소", "이사청소", "거주청소"].map((t) => (
              <span key={t} style={{ background: C.bg, color: C.dark, fontSize: 12, fontWeight: 500, borderRadius: 99, padding: "3px 10px" }}>{t}</span>
            ))}
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: C.muted }}>
            예상 가격 <span style={{ fontWeight: 600, color: C.dark }}>18만원 ~ 25만원</span>
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <div style={{ flex: 1, height: 38, border: `1px solid ${C.border}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, color: C.dark }}>상세 보기</div>
            <div style={{ flex: 1, height: 38, background: C.green, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, color: "#fff" }}>채팅 상담</div>
          </div>
        </div>

        {/* 업체 카드 2 — partial */}
        <div style={{
          background: "#fff", border: `1px solid ${C.border}`,
          borderRadius: 12, padding: 16, opacity: 0.5,
        }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Avatar ch="새" bg="#374151" />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>새벽청소단</span>
                <span style={{ background: "#eef7f3", color: C.green, fontSize: 10, fontWeight: 600, borderRadius: 99, padding: "2px 6px" }}>프로</span>
              </div>
              <span style={{ fontSize: 13, color: C.muted }}>서울 마포구</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 10 }}>
            <Stars count={5} size={13} />
            <span style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>4.8</span>
            <span style={{ fontSize: 12, color: C.muted }}>(96)</span>
            <span style={{ color: C.border }}>|</span>
            <span style={{ fontSize: 12, color: C.muted }}>매칭 215건</span>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SCREEN B — 업체 상세 (companies/[id]/page.tsx)
═══════════════════════════════════════════════════════ */
function ScreenDetail() {
  return (
    <div style={{ background: C.cream, height: LH, position: "relative", paddingBottom: 90 }}>
      <StatusBar />
      <SiteHeader showBack />
      <div style={{ padding: "12px 16px 0", display: "flex", flexDirection: "column", gap: 10 }}>

        {/* 프로필 헤더 카드 — 실제: rounded-xl border border-[#e2ddd6] bg-white p-6 */}
        <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 60, height: 60, borderRadius: 99, background: C.dark, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "#f5f3ee", fontSize: 22, fontWeight: 700 }}>클</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: C.text }}>클린하우스</span>
                <span style={{ background: "#eef7f3", color: C.green, fontSize: 11, fontWeight: 600, borderRadius: 99, padding: "2px 8px" }}>인증완료</span>
              </div>
              <span style={{ fontSize: 14, color: C.muted }}>서울 강남구</span>
            </div>
          </div>

          {/* 통계 바 — 실제: grid grid-cols-3 divide-x bg-[#f0ede8] py-4 rounded-xl */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: C.bg, borderRadius: 12, marginTop: 16, overflow: "hidden" }}>
            {[["15분", "평균응답"], ["342", "총매칭"], ["5년", "경력"]].map(([v, l], i) => (
              <div key={l} style={{ padding: "14px 0", textAlign: "center", borderLeft: i > 0 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{v}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* 평점 */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
            <Stars count={5} size={18} />
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>4.9</span>
            <span style={{ fontSize: 13, color: C.muted }}>(128개 리뷰)</span>
          </div>

          {/* 전문분야 */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.muted, marginBottom: 8 }}>전문분야</div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {["입주청소", "이사청소", "거주청소", "사무실"].map((t) => (
                <span key={t} style={{ background: C.bg, color: C.dark, fontSize: 13, fontWeight: 500, borderRadius: 99, padding: "5px 12px" }}>{t}</span>
              ))}
            </div>
          </div>

          {/* 가격대 */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.muted, marginBottom: 4 }}>예상 가격대</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>18만원 ~ 25만원</div>
          </div>

          {/* 서비스 상세 */}
          <div style={{ marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.muted, marginBottom: 6 }}>서비스 상세</div>
            <div style={{ fontSize: 14, color: C.dark, lineHeight: 1.65, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              꼼꼼하고 체계적인 청소 서비스를 제공합니다. 입주·이사청소 전문이며 고객 만족을 최우선으로 합니다.
            </div>
          </div>
        </div>

        {/* 리뷰 카드 */}
        <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 14 }}>
            리뷰 <span style={{ fontWeight: 400, color: C.muted, fontSize: 14 }}>128</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.dark }}>김**</span>
              <Stars count={5} size={13} />
            </div>
            <span style={{ fontSize: 12, color: C.muted }}>2025.12.03</span>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: C.dark, lineHeight: 1.65 }}>
            꼼꼼하고 친절해요. 다음에도 또 이용하고 싶습니다!
          </p>
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            {["입주청소", "2025.12.03 완료"].map((t) => (
              <span key={t} style={{ background: C.bg, color: C.muted, fontSize: 12, borderRadius: 6, padding: "3px 8px" }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 고정 버튼 — 실제: fixed bottom-0 border-t bg-white p-4 */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: "#fff", borderTop: `1px solid ${C.border}`,
        padding: "12px 16px 20px",
      }}>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, height: 46, border: `1px solid ${C.border}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 500, color: C.dark }}>목록으로</div>
          <div style={{ flex: 1, height: 46, background: C.dark, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 500, color: "#f5f3ee" }}>채팅 상담</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SCREEN C — 채팅 (chat 페이지 디자인)
═══════════════════════════════════════════════════════ */
function ScreenChat() {
  const msgs = [
    { text: "안녕하세요, 이사청소 견적 문의드립니다.", mine: true },
    { text: "네, 말씀해 주세요! 평수와 날짜를 알려주시면 바로 견적 드릴게요.", mine: false },
    { text: "30평 아파트이고, 3월 15일 오전 중 부탁드립니다.", mine: true },
    { text: "확인했습니다. 해당 일정 가능합니다. 견적은 18만원입니다 😊", mine: false },
  ];

  return (
    <div style={{ height: LH, display: "flex", flexDirection: "column", background: C.cream }}>
      <StatusBar />

      {/* 채팅 헤더 */}
      <div style={{
        height: 60, background: "#fff",
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center",
        padding: "0 16px", gap: 12, flexShrink: 0,
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <div style={{ width: 36, height: 36, borderRadius: 99, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>클</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>클린하우스</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
            <div style={{ width: 7, height: 7, borderRadius: 99, background: "#4ade80" }} />
            <span style={{ fontSize: 11, color: C.muted }}>온라인</span>
          </div>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
        </svg>
      </div>

      {/* 메시지 영역 */}
      <div style={{ flex: 1, padding: "16px", display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" }}>
        {msgs.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.mine ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
            {!msg.mine && (
              <div style={{ width: 32, height: 32, borderRadius: 99, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>클</span>
              </div>
            )}
            <div style={{
              maxWidth: "70%", padding: "10px 14px", fontSize: 14, lineHeight: 1.55,
              borderRadius: msg.mine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: msg.mine ? C.green : "#fff",
              color: msg.mine ? "#fff" : C.dark,
              border: msg.mine ? "none" : `1px solid ${C.border}`,
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* 거래 완료 배지 */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          background: "rgba(74,140,106,0.08)", border: "1px solid rgba(74,140,106,0.2)",
          borderRadius: 12, padding: "10px 0",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.greenMid} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.greenMid }}>거래 완료 확인</span>
        </div>
      </div>

      {/* 입력창 */}
      <div style={{ background: "#fff", borderTop: `1px solid ${C.border}`, padding: "12px 16px 24px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <div style={{ flex: 1, height: 40, background: C.bg, borderRadius: 99, padding: "0 16px", display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 14, color: "#a8a49c" }}>메시지를 입력하세요...</span>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: 99, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PhoneFrame — iPhone 14 하드웨어 껍데기
   버튼: 바깥쪽(왼쪽 버튼→왼쪽, 오른쪽 버튼→오른쪽)만 둥글게
═══════════════════════════════════════════════════════ */
function PhoneFrame({
  outerW,
  children,
  frameStyle,
}: {
  outerW: number;
  children: React.ReactNode;
  frameStyle?: React.CSSProperties;
}) {
  const { bezel, innerW, innerH, outerH, radius, scale } = calcPhone(outerW);
  const innerRadius = radius - bezel;
  const BT = 3; // 버튼 두께(px)

  return (
    <div style={{
      width: outerW, height: outerH, borderRadius: radius,
      background: "linear-gradient(145deg, #1e1e20 0%, #0c0c0e 55%, #161618 100%)",
      position: "relative", flexShrink: 0,
      boxShadow: `
        0 0 0 1px rgba(255,255,255,0.07) inset,
        0 0 0 ${bezel - 1}px #111 inset,
        0 40px 80px -20px rgba(0,0,0,0.55),
        0 16px 36px -10px rgba(0,0,0,0.36),
        0 4px 12px -2px rgba(0,0,0,0.20)
      `,
      ...frameStyle,
    }}>
      {/* 볼륨 UP — 왼쪽: 바깥(왼쪽) 모서리만 둥글게 */}
      <div style={{
        position: "absolute", left: -BT, top: "22%",
        width: BT, height: Math.round(outerH * 0.07),
        background: "#2c2c2e",
        borderRadius: `${BT}px 0 0 ${BT}px`,  // 왼쪽(외부) 둥글게, 오른쪽(폰 본체 접합부) 직각
      }} />
      {/* 볼륨 DOWN */}
      <div style={{
        position: "absolute", left: -BT, top: "31%",
        width: BT, height: Math.round(outerH * 0.07),
        background: "#2c2c2e",
        borderRadius: `${BT}px 0 0 ${BT}px`,
      }} />
      {/* 전원 버튼 — 오른쪽: 바깥(오른쪽) 모서리만 둥글게 */}
      <div style={{
        position: "absolute", right: -BT, top: "27%",
        width: BT, height: Math.round(outerH * 0.1),
        background: "#2c2c2e",
        borderRadius: `0 ${BT}px ${BT}px 0`,  // 오른쪽(외부) 둥글게, 왼쪽(폰 본체 접합부) 직각
      }} />

      {/* 내부 스크린 */}
      <div style={{
        position: "absolute", inset: bezel,
        borderRadius: innerRadius, overflow: "hidden",
        background: C.cream,
      }}>
        {/* Dynamic Island 오버레이 */}
        <div style={{
          position: "absolute",
          top: Math.round(innerH * 0.011),
          left: "50%", transform: "translateX(-50%)",
          width: "33%", height: Math.round(innerH * 0.044),
          background: "#000", borderRadius: 99, zIndex: 40,
          pointerEvents: "none",
        }} />

        {/* 콘텐츠 clip 영역 */}
        <div style={{ width: innerW, height: innerH, overflow: "hidden", position: "relative" }}>
          {/* 390px 논리 폭 → innerW 픽셀로 scale */}
          <div style={{
            width: LW, height: LH,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "relative", overflow: "hidden",
          }}>
            {children}
          </div>
        </div>

        {/* 홈 인디케이터 */}
        <div style={{
          position: "absolute",
          bottom: Math.round(innerH * 0.010),
          left: "50%", transform: "translateX(-50%)",
          width: "32%", height: Math.round(innerH * 0.005),
          background: "rgba(0,0,0,0.2)", borderRadius: 99, zIndex: 40,
          pointerEvents: "none",
        }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   HeroCards — 메인 컴포넌트
═══════════════════════════════════════════════════════ */
const SCREENS = ["detail", "chat"] as const;
type Screen = typeof SCREENS[number];
const SP = { type: "spring" as const, stiffness: 320, damping: 30, mass: 0.85 };

export default function HeroCards() {
  const [screen, setScreen] = useState<Screen>("detail");
  const [dir, setDir] = useState<1 | -1>(1);

  const advance = useCallback(() => {
    setDir(1);
    setScreen((s) => (s === "detail" ? "chat" : "detail"));
  }, []);

  useEffect(() => {
    const t = setInterval(advance, 3800);
    return () => clearInterval(t);
  }, [advance]);

  const FRONT_W = 224;
  const BACK_W  = 186;
  const { outerH: frontH, innerW: frontInnerW } = calcPhone(FRONT_W);
  const containerH = frontH + 20; // 인디케이터 여백 포함

  return (
    <div className="hidden lg:block relative flex-shrink-0" style={{ width: 420, height: containerH }}>

      {/* ── 앰비언트 글로우 ── */}
      <div className="pointer-events-none absolute" style={{
        inset: "-32px -24px",
        background: `
          radial-gradient(ellipse 260px 220px at 72% 38%, rgba(45,106,79,0.10) 0%, transparent 70%),
          radial-gradient(ellipse 180px 150px at 28% 70%, rgba(45,106,79,0.06) 0%, transparent 70%)
        `,
        zIndex: 0,
      }} />
      <div className="pointer-events-none absolute opacity-[0.20]" style={{
        inset: "-32px -24px",
        backgroundImage: `radial-gradient(circle, rgba(45,106,79,0.18) 1px, transparent 1px)`,
        backgroundSize: "18px 18px",
        zIndex: 0,
      }} />

      {/* ── 뒤쪽 폰 (검색 결과, 정적) ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88, x: -20, rotate: -5 }}
        animate={{ opacity: 1, scale: 1, x: 0, rotate: -5 }}
        transition={{ delay: 0.28, ...SP }}
        style={{
          position: "absolute", left: 0,
          top: Math.round(containerH * 0.07),
          zIndex: 2, transformOrigin: "center center",
          filter: "brightness(0.76) saturate(0.85)",
        }}
      >
        <PhoneFrame outerW={BACK_W}>
          <ScreenSearch />
        </PhoneFrame>
      </motion.div>

      {/* ── 앞쪽 폰 (업체 상세 ↔ 채팅 자동 슬라이드) ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.46, ...SP }}
        style={{ position: "absolute", right: 0, top: 0, zIndex: 10 }}
      >
        <PhoneFrame outerW={FRONT_W}>
          {/* AnimatePresence: x 슬라이드는 390px(LW) 단위 → scale 후 innerW만큼 이동 */}
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={screen}
              custom={dir}
              initial={{ x: dir * LW, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -dir * LW, opacity: 0 }}
              transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ position: "absolute", top: 0, left: 0, width: LW }}
            >
              {screen === "detail" ? <ScreenDetail /> : <ScreenChat />}
            </motion.div>
          </AnimatePresence>
        </PhoneFrame>

        {/* 스크린 인디케이터 도트 */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10 }}>
          {SCREENS.map((s) => (
            <motion.button
              key={s}
              onClick={() => { setDir(s === "detail" ? -1 : 1); setScreen(s); }}
              animate={{ width: s === screen ? 20 : 6, background: s === screen ? C.green : C.border }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ height: 6, borderRadius: 99, border: "none", cursor: "pointer", padding: 0 }}
            />
          ))}
        </div>
      </motion.div>

      {/* ── 플로팅 알림 배지 ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.9, type: "spring", stiffness: 420, damping: 22 }}
        style={{
          position: "absolute",
          left: Math.round(BACK_W * 0.48),
          top: Math.round(containerH * 0.36),
          zIndex: 20,
          background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14,
          padding: "10px 14px",
          boxShadow: "0 8px 28px -6px rgba(45,106,79,0.18), 0 2px 8px -2px rgba(26,25,24,0.10)",
          display: "flex", alignItems: "center", gap: 10, minWidth: 158,
        }}
      >
        <div style={{ width: 32, height: 32, borderRadius: 10, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>매칭 수락됨</div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>클린하우스 · 방금 전</div>
        </div>
        <motion.div
          style={{ width: 7, height: 7, borderRadius: 99, background: "#16a34a", flexShrink: 0 }}
          animate={{ scale: [1, 1.6, 1], opacity: [1, 0.35, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

    </div>
  );
}
