"use client";

import { useRef, useState, useCallback, useEffect, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* ── Design tokens ── */
const C = {
  cream:      "#f5f3ee",
  green:      "#2d6a4f",
  greenMid:   "#4a8c6a",
  greenLight: "#d6ede2",
  text:       "#1a1918",
  muted:      "#72706a",
  border:     "#e2ddd6",
} as const;

const SP = { type: "spring" as const, stiffness: 400, damping: 30, mass: 0.7 };

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/* ════════════════════════════════════════
   TiltCard — 개별 3D Tilt + Specular Light

   구조: motion.div(진입 애니메이션) → div(3D tilt)
   framer-motion의 animate과 수동 transform이
   서로 다른 DOM 요소에 있어야 충돌하지 않음
════════════════════════════════════════ */
interface TiltCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  intensity?: number;
  borderColor?: string;
  specularTint?: string;
  from?: { x?: number; y?: number };
}

function TiltCard({
  children,
  className = "",
  delay = 0,
  intensity = 14,
  borderColor = "rgba(255,255,255,0.35)",
  specularTint = "rgba(255,255,255,0.7)",
  from = { y: 30 },
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const currentRef = useRef({ x: 0.5, y: 0.5 });
  const isInside = useRef(false);
  const prefersReduced = useReducedMotion();

  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 0.5, my: 0.5, active: false });

  const tick = useCallback(() => {
    const target = isInside.current ? mouseRef.current : { x: 0.5, y: 0.5 };
    const ease = isInside.current ? 0.1 : 0.045;

    currentRef.current = {
      x: lerp(currentRef.current.x, target.x, ease),
      y: lerp(currentRef.current.y, target.y, ease),
    };

    const cx = currentRef.current.x;
    const cy = currentRef.current.y;

    setTilt({
      rx: (cy - 0.5) * -intensity,
      ry: (cx - 0.5) * intensity,
      mx: cx,
      my: cy,
      active: isInside.current,
    });

    rafRef.current = requestAnimationFrame(tick);
  }, [intensity]);

  useEffect(() => {
    if (prefersReduced) return;
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick, prefersReduced]);

  const onMove = useCallback((e: React.MouseEvent) => {
    if (prefersReduced) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
    };
  }, [prefersReduced]);

  const onEnter = useCallback(() => { isInside.current = true; }, []);
  const onLeave = useCallback(() => { isInside.current = false; }, []);

  const hlX = tilt.mx * 100;
  const hlY = tilt.my * 100;
  const shadowX = -tilt.ry * 1.2;
  const shadowY = tilt.rx * 1.2;
  const edgeAngle = Math.atan2(tilt.my - 0.5, tilt.mx - 0.5) * (180 / Math.PI) + 180;

  return (
    /* perspective 컨테이너 */
    <div style={{ perspective: "600px" }}>
      {/* 외부: framer-motion 진입 애니메이션 (opacity, scale, translate) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88, ...from }}
        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
        transition={{ delay, ...SP }}
      >
        {/* 내부: 수동 3D tilt (rotateX/Y) — framer-motion과 충돌 없음 */}
        <div
          ref={cardRef}
          onMouseMove={onMove}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          className={`relative overflow-hidden rounded-2xl ${className}`}
          style={{
            /* 글래스모피즘: 반투명 배경 + 블러 → 배경과 대비 */
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: `1px solid ${borderColor}`,
            transform: prefersReduced
              ? "none"
              : `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${tilt.active ? 1.04 : 1})`,
            transition: tilt.active
              ? "box-shadow 0.15s ease"
              : "transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.5s ease",
            boxShadow: tilt.active
              ? `${shadowX}px ${shadowY}px 28px -6px rgba(45,106,79,0.18),
                 0 4px 12px -2px rgba(26,25,24,0.1),
                 inset 0 1px 0 rgba(255,255,255,0.6)`
              : `0 4px 20px -6px rgba(26,25,24,0.1),
                 0 1px 6px -1px rgba(45,106,79,0.06),
                 inset 0 1px 0 rgba(255,255,255,0.5)`,
            willChange: "transform",
            transformStyle: "preserve-3d",
          }}
        >
          {/* ── Specular: 강한 점광원 하이라이트 ── */}
          <div
            className="pointer-events-none absolute inset-0 z-10 rounded-2xl"
            style={{
              opacity: tilt.active ? 1 : 0,
              transition: "opacity 0.35s ease",
              background: `
                radial-gradient(
                  100px circle at ${hlX}% ${hlY}%,
                  ${specularTint} 0%,
                  rgba(255,255,255,0.2) 30%,
                  transparent 65%
                )
              `,
            }}
          />

          {/* ── Edge light: 빛이 닿는 면 테두리 밝아짐 ── */}
          <div
            className="pointer-events-none absolute inset-0 z-10 rounded-2xl"
            style={{
              opacity: tilt.active ? 0.8 : 0,
              transition: "opacity 0.35s ease",
              background: `
                conic-gradient(
                  from ${edgeAngle}deg at 50% 50%,
                  rgba(255,255,255,0.35) 0deg,
                  transparent 70deg,
                  transparent 290deg,
                  rgba(255,255,255,0.35) 360deg
                )
              `,
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "exclude",
              WebkitMaskComposite: "xor",
              padding: "1.5px",
            }}
          />

          {/* ── Card content ── */}
          <div className="relative z-[5]">{children}</div>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SVG 아이콘
═══════════════════════════════════════════ */
const Icon = {
  star: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="#d97706" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  check: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  shield: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  home: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  clock: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  chat: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
};

/* ═══════════════════════════════════════════
   HeroCards — 2열 오프셋 그리드 + 개별 3D Tilt
═══════════════════════════════════════════ */
export default function HeroCards() {
  return (
    <div className="hidden lg:block relative w-[420px] flex-shrink-0">

      {/* ── 배경 그라디언트: 카드가 떠보이도록 대비 제공 ── */}
      <div
        className="pointer-events-none absolute z-0 rounded-[32px]"
        style={{
          inset: "-24px -20px -20px -20px",
          background: `
            radial-gradient(ellipse 340px 280px at 55% 35%, rgba(45,106,79,0.09) 0%, transparent 70%),
            radial-gradient(ellipse 240px 200px at 30% 75%, rgba(45,106,79,0.05) 0%, transparent 70%),
            linear-gradient(165deg, rgba(226,221,214,0.5) 0%, rgba(245,243,238,0.1) 100%)
          `,
        }}
      />

      {/* ── Dot 패턴: 은은한 텍스처 ── */}
      <div
        className="pointer-events-none absolute z-0 rounded-[32px] opacity-[0.35]"
        style={{
          inset: "-24px -20px -20px -20px",
          backgroundImage: `radial-gradient(circle, rgba(45,106,79,0.12) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative z-[1] grid grid-cols-2 gap-3">

        {/* ── 카드 1: 메인 업체 카드 (2열) ── */}
        <div className="col-span-2">
          <TiltCard
            delay={0.3}
            intensity={10}
            specularTint="rgba(214,237,226,0.85)"
            borderColor="rgba(255,255,255,0.5)"
          >
            <div className="p-5">
              <div className="flex items-center gap-3.5">
                <div
                  className="h-11 w-11 flex-shrink-0 rounded-xl flex items-center justify-center"
                  style={{ background: C.greenLight }}
                >
                  {Icon.home}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-bold truncate" style={{ color: C.text }}>
                      클린하우스
                    </p>
                    <span
                      className="rounded px-1.5 py-0.5 text-[9px] font-bold"
                      style={{ background: C.greenLight, color: C.green }}
                    >
                      인증
                    </span>
                  </div>
                  <p className="text-[12px] mt-0.5" style={{ color: C.muted }}>
                    서울 강남구 · 경력 5년
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {Icon.star}
                  <span className="text-[13px] font-bold" style={{ color: C.text }}>4.9</span>
                  <span className="text-[11px]" style={{ color: C.muted }}>(128)</span>
                </div>
              </div>
              <div className="mt-4 flex gap-1.5 flex-wrap">
                {["입주청소", "이사청소", "거주청소"].map((t) => (
                  <span
                    key={t}
                    className="rounded-md px-2.5 py-1 text-[11px] font-medium"
                    style={{ background: C.greenLight, color: C.green }}
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div
                className="mt-4 rounded-xl px-4 py-3 flex items-center justify-between"
                style={{ background: "rgba(245,243,238,0.7)" }}
              >
                <span className="text-[12px]" style={{ color: C.muted }}>예상 가격대</span>
                <span className="text-[16px] font-extrabold tracking-tight" style={{ color: C.text }}>
                  18~25만원
                </span>
              </div>
            </div>
          </TiltCard>
        </div>

        {/* ── 카드 2: 매칭 수락 알림 ── */}
        <TiltCard
          delay={0.44}
          intensity={16}
          borderColor="rgba(187,247,208,0.6)"
          specularTint="rgba(220,252,231,0.9)"
          from={{ x: -20 }}
        >
          <div className="p-4">
            <div className="flex items-center gap-2.5">
              <div
                className="h-8 w-8 flex-shrink-0 rounded-lg flex items-center justify-center"
                style={{ background: "#dcfce7" }}
              >
                {Icon.check}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold" style={{ color: C.text }}>매칭 수락됨</p>
                <p className="text-[10px] mt-0.5" style={{ color: C.muted }}>방금 전</p>
              </div>
              <motion.div
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ background: "#16a34a" }}
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <div
              className="mt-3 rounded-lg px-3 py-2 text-center text-[11px] font-semibold"
              style={{ background: "rgba(22,163,74,0.08)", color: "#16a34a" }}
            >
              채팅방 열기 →
            </div>
          </div>
        </TiltCard>

        {/* ── 카드 3: 평균 응답 시간 ── */}
        <TiltCard
          delay={0.52}
          intensity={16}
          borderColor="rgba(253,230,138,0.5)"
          specularTint="rgba(254,243,199,0.85)"
          from={{ x: 20 }}
        >
          <div className="p-4">
            <div className="flex items-center gap-2.5">
              <div
                className="h-8 w-8 flex-shrink-0 rounded-lg flex items-center justify-center"
                style={{ background: "#fef3c7" }}
              >
                {Icon.clock}
              </div>
              <div>
                <p className="text-[10px]" style={{ color: C.muted }}>평균 응답</p>
                <p className="text-[15px] font-extrabold leading-tight" style={{ color: C.text }}>
                  15분
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full"
                  style={{
                    background: i <= 4 ? "#d97706" : "#e2ddd6",
                    opacity: i <= 4 ? 0.7 : 0.3,
                  }}
                />
              ))}
            </div>
          </div>
        </TiltCard>

        {/* ── 카드 4: 고객 리뷰 ── */}
        <TiltCard
          delay={0.6}
          intensity={18}
          specularTint="rgba(255,255,255,0.75)"
          from={{ y: 20 }}
        >
          <div className="p-4">
            <div className="flex gap-0.5 mb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i}>{Icon.star}</span>
              ))}
            </div>
            <p className="text-[12px] leading-[1.6]" style={{ color: C.text }}>
              &ldquo;꼼꼼하고 친절해요. 다음에도 또 이용하고 싶습니다!&rdquo;
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div
                className="h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                style={{ background: C.greenMid }}
              >
                김
              </div>
              <span className="text-[10px]" style={{ color: C.muted }}>김** · 입주청소</span>
            </div>
          </div>
        </TiltCard>

        {/* ── 카드 5: 플랫폼 신뢰 지표 ── */}
        <TiltCard
          delay={0.68}
          intensity={18}
          specularTint="rgba(214,237,226,0.8)"
          from={{ y: 20 }}
        >
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="h-7 w-7 flex-shrink-0 rounded-lg flex items-center justify-center"
                style={{ background: C.greenLight }}
              >
                {Icon.shield}
              </div>
              <p className="text-[11px] font-bold" style={{ color: C.green }}>
                100% 검증
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              {[
                { label: "사업자 인증" },
                { label: "보험 가입" },
                { label: "이력 검증" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[10px]" style={{ color: C.muted }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </TiltCard>

        {/* ── 카드 6: 실시간 채팅 미리보기 (2열) ── */}
        <div className="col-span-2">
          <TiltCard
            delay={0.76}
            intensity={8}
            specularTint="rgba(214,237,226,0.7)"
            from={{ y: 24 }}
          >
            <div className="px-4 py-3.5 flex items-center gap-3.5">
              <div
                className="h-9 w-9 flex-shrink-0 rounded-xl flex items-center justify-center"
                style={{ background: C.greenLight }}
              >
                {Icon.chat}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[12px] font-bold truncate" style={{ color: C.text }}>
                    클린하우스
                  </p>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#4ade80" }} />
                    <span className="text-[9px]" style={{ color: C.muted }}>온라인</span>
                  </span>
                </div>
                <p className="text-[11px] mt-0.5 truncate" style={{ color: C.muted }}>
                  견적은 18만원입니다. 일정 조율 부탁드려요 😊
                </p>
              </div>
              <div
                className="flex-shrink-0 h-5 min-w-[20px] rounded-full flex items-center justify-center px-1.5 text-[9px] font-bold text-white"
                style={{ background: C.green }}
              >
                2
              </div>
            </div>
          </TiltCard>
        </div>

      </div>
    </div>
  );
}
