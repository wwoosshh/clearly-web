"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* ── Design tokens (mirrored from page.tsx) ── */
const C = {
  cream:      "#f5f3ee",
  dark:       "#141412",
  green:      "#2d6a4f",
  greenMid:   "#4a8c6a",
  greenLight: "#d6ede2",
  text:       "#1a1918",
  muted:      "#72706a",
  border:     "#e2ddd6",
} as const;

/* ── Spring config for entry animations ── */
const SP = { type: "spring" as const, stiffness: 380, damping: 32, mass: 0.8 };

/* ── Types ── */
interface Vec2 {
  x: number;
  y: number;
}

/* ── Helpers ── */
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val));
}

/* ════════════════════════════════════════
   HeroCards — 3D Tilt + Per-card Parallax
════════════════════════════════════════ */
export default function HeroCards() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef<Vec2>({ x: 0.5, y: 0.5 });
  const currentRef = useRef<Vec2>({ x: 0.5, y: 0.5 });
  const isInsideRef = useRef(false);
  const prefersReduced = useReducedMotion();

  /* Smoothed values for rendering */
  const [smooth, setSmooth] = useState<Vec2>({ x: 0.5, y: 0.5 });
  const [isHovering, setIsHovering] = useState(false);

  /* RAF loop for buttery-smooth interpolation */
  const tick = useCallback(() => {
    const target = isInsideRef.current
      ? mouseRef.current
      : { x: 0.5, y: 0.5 };

    const ease = isInsideRef.current ? 0.08 : 0.04;
    currentRef.current = {
      x: lerp(currentRef.current.x, target.x, ease),
      y: lerp(currentRef.current.y, target.y, ease),
    };

    const dx = Math.abs(currentRef.current.x - target.x);
    const dy = Math.abs(currentRef.current.y - target.y);

    if (dx > 0.0005 || dy > 0.0005) {
      setSmooth({ ...currentRef.current });
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (prefersReduced) return;
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick, prefersReduced]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (prefersReduced) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseRef.current = {
        x: clamp((e.clientX - rect.left) / rect.width, 0, 1),
        y: clamp((e.clientY - rect.top) / rect.height, 0, 1),
      };
    },
    [prefersReduced],
  );

  const handleMouseEnter = useCallback(() => {
    isInsideRef.current = true;
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    isInsideRef.current = false;
    setIsHovering(false);
  }, []);

  /* ── Derived transforms ── */
  const nx = smooth.x - 0.5; // -0.5 ~ 0.5
  const ny = smooth.y - 0.5;
  const tiltX = ny * -12;     // rotateX (inverted)
  const tiltY = nx * 12;      // rotateY

  /* Gloss position */
  const glossX = smooth.x * 100;
  const glossY = smooth.y * 100;

  /* Per-card parallax offsets (px) */
  const parallax = (depth: number) => ({
    x: nx * depth * 28,
    y: ny * depth * 20,
  });

  const mainP  = parallax(0.5);
  const notifP = parallax(1.2);
  const statsP = parallax(0.85);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="hidden lg:block relative pb-2"
      style={{
        perspective: "800px",
        perspectiveOrigin: "50% 50%",
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative"
        style={{
          transformStyle: "preserve-3d",
          transform: prefersReduced
            ? "none"
            : `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          transition: isHovering ? "none" : "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          willChange: "transform",
        }}
      >
        {/* ── Gloss overlay ── */}
        <div
          className="pointer-events-none absolute -inset-6 z-10 rounded-3xl opacity-0 transition-opacity duration-500"
          style={{
            opacity: isHovering ? 0.45 : 0,
            background: `radial-gradient(
              320px circle at ${glossX}% ${glossY}%,
              rgba(45, 106, 79, 0.08) 0%,
              transparent 70%
            )`,
          }}
        />

        {/* ── Ambient glow behind cards ── */}
        <div
          className="pointer-events-none absolute z-0"
          style={{
            width: "300px",
            height: "300px",
            top: "20%",
            left: "10%",
            background: `radial-gradient(circle, rgba(45,106,79,0.06) 0%, transparent 70%)`,
            filter: "blur(40px)",
            transform: `translate(${nx * 15}px, ${ny * 10}px)`,
          }}
        />

        <div className="relative z-[1] flex flex-col gap-3.5">
          {/* ── Card 1: Main company card ── */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.35, ...SP }}
            className="group w-[284px] rounded-2xl p-5 transition-shadow duration-300"
            style={{
              background: "#fff",
              border: `1px solid ${C.border}`,
              boxShadow: "0 4px 24px rgba(26,25,24,0.07)",
              transform: prefersReduced
                ? "none"
                : `translate3d(${mainP.x}px, ${mainP.y}px, 20px)`,
              willChange: "transform",
            }}
          >
            {/* Inner glow on hover */}
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400"
              style={{
                background: `radial-gradient(
                  200px circle at ${glossX}% ${glossY}%,
                  rgba(45,106,79,0.04) 0%,
                  transparent 70%
                )`,
              }}
            />
            <div className="relative flex items-center gap-3">
              <div
                className="h-10 w-10 flex-shrink-0 rounded-xl flex items-center justify-center"
                style={{ background: C.greenLight }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={C.green}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold truncate" style={{ color: C.text }}>
                  클린하우스
                </p>
                <p className="text-[12px]" style={{ color: C.muted }}>
                  서울 강남구
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#d97706" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span className="text-[12px] font-semibold" style={{ color: C.text }}>
                  4.9
                </span>
              </div>
            </div>
            <div className="relative mt-3.5 flex gap-1.5">
              {["입주청소", "이사청소"].map((t) => (
                <span
                  key={t}
                  className="rounded-md px-2 py-0.5 text-[11px] font-medium"
                  style={{ background: C.greenLight, color: C.green }}
                >
                  {t}
                </span>
              ))}
            </div>
            <div
              className="relative mt-3.5 rounded-lg px-3 py-2 flex items-center justify-between"
              style={{ background: C.cream }}
            >
              <span className="text-[12px]" style={{ color: C.muted }}>
                예상 가격대
              </span>
              <span className="text-[14px] font-bold" style={{ color: C.text }}>
                18~25만원
              </span>
            </div>
          </motion.div>

          {/* ── Card 2: Match notification ── */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.88 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.52, ...SP }}
            className="w-[240px] self-end rounded-xl px-4 py-3 flex items-center gap-3 transition-shadow duration-300 hover:shadow-[0_8px_28px_-4px_rgba(21,128,61,0.14)]"
            style={{
              background: "#fff",
              border: "1px solid #bbf7d0",
              boxShadow: "0 4px 12px rgba(21,128,61,0.08)",
              transform: prefersReduced
                ? "none"
                : `translate3d(${notifP.x}px, ${notifP.y}px, 40px)`,
              willChange: "transform",
            }}
          >
            <div
              className="h-7 w-7 flex-shrink-0 rounded-lg flex items-center justify-center"
              style={{ background: "#dcfce7" }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <p className="text-[12px] font-semibold" style={{ color: C.text }}>
                매칭 수락됨
              </p>
              <p className="text-[11px]" style={{ color: C.muted }}>
                방금 전
              </p>
            </div>

            {/* Animated pulse ring */}
            <motion.div
              className="ml-auto h-2 w-2 rounded-full flex-shrink-0"
              style={{ background: "#16a34a" }}
              animate={{ scale: [1, 1.6, 1], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          {/* ── Card 3: Response time stats ── */}
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.66, ...SP }}
            className="w-[240px] rounded-xl px-4 py-3 flex items-center gap-3 transition-shadow duration-300 hover:shadow-[0_6px_20px_-4px_rgba(26,25,24,0.1)]"
            style={{
              background: "#fff",
              border: `1px solid ${C.border}`,
              boxShadow: "0 4px 12px rgba(26,25,24,0.05)",
              transform: prefersReduced
                ? "none"
                : `translate3d(${statsP.x}px, ${statsP.y}px, 30px)`,
              willChange: "transform",
            }}
          >
            <div
              className="h-7 w-7 flex-shrink-0 rounded-lg flex items-center justify-center"
              style={{ background: "#fef3c7" }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d97706"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <p className="text-[11px]" style={{ color: C.muted }}>
                평균 응답
              </p>
              <p className="text-[13px] font-bold" style={{ color: C.text }}>
                15분 이내
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
