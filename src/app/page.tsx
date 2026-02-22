"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuthStore } from "@/stores/auth.store";
import FadeIn from "@/components/animation/FadeIn";
import HeroCards from "@/components/home/HeroCards";

/* ── 디자인 토큰 ─────────────────────────────────────── */
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

const TOTAL_FRAMES = 9;

/* ── 애니메이션 상수 ─────────────────────────────────── */
const SP      = { type: "spring" as const, stiffness: 400, damping: 34, mass: 0.75 };
const SP_SLOW = { type: "spring" as const, stiffness: 280, damping: 30, mass: 0.9 };

const frameVariants = {
  enter: (dir: 1 | -1) => ({
    x: `${dir * 55}%`,
    opacity: 0,
    scale: 0.88,
    rotate: dir * 1.5,
  }),
  center: {
    x: "0%",
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { ...SP, opacity: { duration: 0.2 } },
  },
  exit: (dir: 1 | -1) => ({
    x: `${-dir * 55}%`,
    opacity: 0,
    scale: 0.88,
    rotate: -dir * 1.5,
    transition: { ...SP, duration: 0.28, ease: [0.55, 0, 1, 0.45] as [number,number,number,number] },
  }),
};

/* ════════════════════════════════════════
   프레임 컴포넌트들
════════════════════════════════════════ */

/* ── 0. 통계 ── */
function FrameStats() {
  return (
    <div className="w-full max-w-4xl text-center">
      <motion.p
        initial={{ opacity: 0, y: -18, letterSpacing: "0.1em" }}
        animate={{ opacity: 1, y: 0, letterSpacing: "0.22em" }}
        transition={{ delay: 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-16 text-[11px] font-semibold uppercase"
        style={{ color: C.greenMid }}
      >
        플랫폼 현황
      </motion.p>
      <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 sm:gap-14">
        {[
          { value: "120+",   label: "검증된 업체" },
          { value: "4.8★",  label: "평균 평점" },
          { value: "2,400+", label: "매칭 완료" },
          { value: "97%",    label: "고객 만족도" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ y: 64, opacity: 0, scale: 0.7 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.08 + i * 0.09, ...SP_SLOW }}
          >
            <p
              className="tabular-nums font-extrabold leading-none tracking-[-0.05em]"
              style={{ fontSize: "clamp(44px, 7vw, 68px)", color: "#fff" }}
            >
              {s.value}
            </p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.24 + i * 0.06 }}
              className="mt-4 text-[13px]"
              style={{ color: "rgba(255,255,255,0.32)" }}
            >
              {s.label}
            </motion.p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── 1~3. 이용 단계 ── */
const STEPS = [
  {
    num: "01", label: "첫 번째 단계",
    title: ["주소와 일정을", "입력하세요"],
    desc: "청소할 주소, 평수, 희망 일정을 입력하면 조건에 맞는 검증된 업체를 추천해드립니다.",
  },
  {
    num: "02", label: "두 번째 단계",
    title: ["업체를 비교하고", "매칭 요청"],
    desc: "추천된 업체의 평점, 리뷰, 가격대를 비교하고 원하는 업체에 매칭을 요청하세요.",
  },
  {
    num: "03", label: "세 번째 단계",
    title: ["채팅으로", "직접 상담"],
    desc: "매칭이 수락되면 1:1 채팅방에서 세부 일정과 비용을 업체와 직접 조율합니다.",
  },
];

function FrameStep({ step, idx }: { step: typeof STEPS[number]; idx: number }) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <motion.div
        initial={{ x: -90, opacity: 0, scale: 0.85 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        transition={{ delay: 0.04, ...SP_SLOW }}
        className="flex-shrink-0 select-none"
      >
        <span
          className="font-extrabold tabular-nums leading-[0.82]"
          style={{
            fontSize: "clamp(110px, 22vw, 220px)",
            color: "rgba(255,255,255,0.06)",
            letterSpacing: "-0.07em",
          }}
        >
          {step.num}
        </span>
      </motion.div>

      <div className="flex-1 sm:pl-10 lg:pl-20">
        <motion.p
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1, ...SP }}
          className="mb-5 text-[11px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: C.greenMid }}
        >
          {step.label}
        </motion.p>
        <motion.h2
          initial={{ x: 50, y: 16, opacity: 0, scale: 0.96 }}
          animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.16, ...SP }}
          className="font-extrabold leading-[1.06] tracking-[-0.04em] text-white"
          style={{ fontSize: "clamp(36px, 5.5vw, 62px)" }}
        >
          {step.title[0]}<br />{step.title[1]}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, ...SP_SLOW }}
          className="mt-6 max-w-[400px] text-[15px] leading-[1.9]"
          style={{ color: "rgba(255,255,255,0.42)" }}
        >
          {step.desc}
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex gap-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.32 + i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="h-0.5 flex-1 rounded-full origin-left"
              style={{ background: i <= idx ? C.greenMid : "rgba(255,255,255,0.1)" }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

/* ── 4. 실시간 채팅 ── */
function FrameChat() {
  const messages = [
    { text: "안녕하세요, 이사청소 견적 문의드립니다.", mine: true },
    { text: "네, 말씀해 주세요! 평수와 희망 날짜를 알려주시면 바로 견적 드릴게요.", mine: false },
    { text: "30평 아파트이고, 3월 15일 오전 중 부탁드립니다.", mine: true },
    { text: "확인했습니다. 해당 일정 가능합니다. 견적은 18만원입니다.", mine: false },
  ];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 sm:flex-row sm:items-center sm:gap-16">

      {/* 채팅 UI 목업 */}
      <motion.div
        initial={{ x: 60, opacity: 0, scale: 0.9 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        transition={{ delay: 0.06, ...SP_SLOW }}
        className="w-full sm:w-[300px] flex-shrink-0 rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* 채팅 헤더 */}
        <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white" style={{ background: C.green }}>클</div>
          <div>
            <p className="text-[13px] font-semibold text-white">클린하우스</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#4ade80" }} />
              <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>온라인</span>
            </div>
          </div>
        </div>

        {/* 메시지 목록 */}
        <div className="flex flex-col gap-2.5 px-4 py-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.18 + i * 0.1, ...SP }}
              className={`flex ${msg.mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className="max-w-[200px] rounded-2xl px-3.5 py-2.5 text-[12px] leading-[1.55]"
                style={{
                  background: msg.mine ? C.green : "rgba(255,255,255,0.08)",
                  color: msg.mine ? "#fff" : "rgba(255,255,255,0.75)",
                  borderRadius: msg.mine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                }}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}

          {/* 완료 뱃지 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.65, type: "spring", stiffness: 350, damping: 22 }}
            className="mt-1 flex items-center justify-center gap-2 rounded-xl py-2.5"
            style={{ background: "rgba(74,140,106,0.15)", border: "1px solid rgba(74,140,106,0.25)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.greenMid} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-[11px] font-semibold" style={{ color: C.greenMid }}>거래 완료 확인</span>
          </motion.div>
        </div>
      </motion.div>

      {/* 설명 */}
      <div className="flex-1">
        <motion.p
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.08, ...SP }}
          className="mb-5 text-[11px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: C.greenMid }}
        >
          채팅 & 거래 관리
        </motion.p>
        <motion.h2
          initial={{ x: -40, y: 14, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 1 }}
          transition={{ delay: 0.14, ...SP }}
          className="font-extrabold leading-[1.08] tracking-[-0.035em] text-white"
          style={{ fontSize: "clamp(30px, 4.5vw, 52px)" }}
        >
          실시간 1:1 채팅으로
          <br />
          처음부터 끝까지
        </motion.h2>
        <div className="mt-7 flex flex-col gap-3.5">
          {[
            {
              svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.greenMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
              text: "소켓 기반 실시간 메시지 — 즉각적인 소통",
            },
            {
              svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.greenMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
              text: "이미지 공유 — 현장 사진으로 명확하게",
            },
            {
              svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.greenMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
              text: "완료보고 & 완료확인 — 거래 전 과정 추적",
            },
            {
              svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.greenMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
              text: "완료 후 자동 리뷰 연동",
            },
          ].map((item, i) => (
            <motion.div
              key={item.text}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.24 + i * 0.08, ...SP_SLOW }}
              className="flex items-start gap-3"
            >
              <span className="mt-0.5 flex-shrink-0">{item.svg}</span>
              <p className="text-[14px] leading-[1.7]" style={{ color: "rgba(255,255,255,0.48)" }}>
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 5. 업체 프로필 ── */
function FrameProfile() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 sm:flex-row sm:items-center sm:gap-16">

      {/* 텍스트 — 왼쪽 */}
      <div className="flex-1">
        <motion.p
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.06, ...SP }}
          className="mb-5 text-[11px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: C.greenMid }}
        >
          업체 상세 프로필
        </motion.p>
        <motion.h2
          initial={{ x: -40, y: 14, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 1 }}
          transition={{ delay: 0.12, ...SP }}
          className="font-extrabold leading-[1.08] tracking-[-0.035em] text-white"
          style={{ fontSize: "clamp(30px, 4.5vw, 52px)" }}
        >
          숨기는 것 없이
          <br />
          투명하게 공개
        </motion.h2>
        <div className="mt-7 flex flex-col gap-3.5">
          {[
            {
              svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.greenMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
              text: "사업자 인증 · 보험가입 검증 배지",
            },
            {
              svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.greenMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
              text: "실제 고객 평점 및 리뷰 전체 공개",
            },
            {
              svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.greenMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
              text: "포트폴리오 사진 및 동영상 확인",
            },
            {
              svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.greenMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
              text: "서비스 지역 · 전문 분야 · 가격대 명시",
            },
            {
              svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.greenMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
              text: "업체 FAQ — 궁금한 점 미리 해결",
            },
          ].map((item, i) => (
            <motion.div
              key={item.text}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.22 + i * 0.07, ...SP_SLOW }}
              className="flex items-start gap-3"
            >
              <span className="mt-0.5 flex-shrink-0">{item.svg}</span>
              <p className="text-[14px] leading-[1.7]" style={{ color: "rgba(255,255,255,0.48)" }}>
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 프로필 카드 목업 */}
      <motion.div
        initial={{ x: 60, opacity: 0, scale: 0.88, rotate: 2 }}
        animate={{ x: 0, opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.08, ...SP_SLOW }}
        className="w-full sm:w-[260px] flex-shrink-0 rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
      >
        {/* 상단 아바타 영역 */}
        <div className="px-5 pt-6 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center text-[18px] font-bold text-white flex-shrink-0"
              style={{ background: C.green }}
            >
              클
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-[14px] font-bold text-white">클린하우스</p>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 500, damping: 20 }}
                  className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase"
                  style={{ background: "rgba(74,140,106,0.25)", color: C.greenMid, border: "1px solid rgba(74,140,106,0.3)" }}
                >
                  인증완료
                </motion.span>
              </div>
              <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>서울 강남구</p>
            </div>
          </div>

          {/* 별점 */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, ...SP }}
            className="mt-4 flex items-center gap-3"
          >
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map((i) => (
                <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#d97706" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <span className="text-[13px] font-bold text-white">4.9</span>
            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>리뷰 128개</span>
          </motion.div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-px" style={{ background: "rgba(255,255,255,0.06)" }}>
          {[
            { value: "342", label: "완료" },
            { value: "15분", label: "응답" },
            { value: "5년↑", label: "경력" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.07, ...SP }}
              className="py-3 text-center"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <p className="text-[13px] font-bold text-white">{s.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* 태그 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap gap-1.5 px-5 py-4"
        >
          {["입주청소", "이사청소", "거주청소", "사무실"].map((t) => (
            <span
              key={t}
              className="rounded-md px-2 py-0.5 text-[10px] font-medium"
              style={{ background: "rgba(74,140,106,0.12)", color: C.greenMid }}
            >
              {t}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ── 6. 견적 비교 시스템 ── */
function FrameEstimates() {
  const estimates = [
    { company: "클린하우스", price: "18만원", date: "3월 15일", time: "오전 10시", rating: "4.9", tag: "빠른 응답", tagColor: C.greenMid, tagBg: "rgba(74,140,106,0.15)" },
    { company: "새벽청소단", price: "22만원", date: "3월 15일", time: "오후 2시", rating: "4.8", tag: "리뷰 많음", tagColor: "#d97706", tagBg: "rgba(217,119,6,0.12)" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 sm:flex-row sm:items-center sm:gap-16">

      {/* 견적 카드 목업 */}
      <div className="flex flex-col gap-3 w-full sm:w-[280px] flex-shrink-0">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className="text-[10px] font-semibold uppercase tracking-[0.18em] text-center mb-1"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          받은 견적 2건
        </motion.p>
        {estimates.map((est, i) => (
          <motion.div
            key={est.company}
            initial={{ x: i === 0 ? -50 : 50, opacity: 0, scale: 0.92 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.14, ...SP_SLOW }}
            className="rounded-2xl p-4"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white" style={{ background: C.green }}>
                  {est.company[0]}
                </div>
                <span className="text-[13px] font-semibold text-white">{est.company}</span>
              </div>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: est.tagBg, color: est.tagColor }}
              >
                {est.tag}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[20px] font-extrabold text-white leading-none">{est.price}</p>
                <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {est.date} {est.time}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="#d97706" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span className="text-[12px] font-semibold text-white">{est.rating}</span>
              </div>
            </div>
          </motion.div>
        ))}

        {/* 수락 버튼 */}
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.42, ...SP }}
          className="rounded-xl py-3 text-center text-[13px] font-semibold text-white"
          style={{ background: C.green }}
        >
          견적 수락 → 채팅 시작
        </motion.div>
      </div>

      {/* 설명 */}
      <div className="flex-1">
        <motion.p
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.08, ...SP }}
          className="mb-5 text-[11px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: C.greenMid }}
        >
          견적 비교 시스템
        </motion.p>
        <motion.h2
          initial={{ x: 40, y: 14, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 1 }}
          transition={{ delay: 0.14, ...SP }}
          className="font-extrabold leading-[1.08] tracking-[-0.035em] text-white"
          style={{ fontSize: "clamp(30px, 4.5vw, 52px)" }}
        >
          여러 업체 견적을
          <br />
          한눈에 비교
        </motion.h2>
        <div className="mt-7 flex flex-col gap-3.5">
          {[
            {
              svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.greenMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
              text: "견적 요청 한 번으로 여러 업체에 동시 발송",
            },
            {
              svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.greenMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
              text: "가격 · 날짜 · 메시지 · 평점을 한 화면에서 비교",
            },
            {
              svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.greenMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
              text: "마음에 드는 견적 수락 즉시 채팅방 자동 개설",
            },
            {
              svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.greenMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
              text: "새 견적 도착 시 실시간 알림",
            },
          ].map((item, i) => (
            <motion.div
              key={item.text}
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.24 + i * 0.08, ...SP_SLOW }}
              className="flex items-start gap-3"
            >
              <span className="mt-0.5 flex-shrink-0">{item.svg}</span>
              <p className="text-[14px] leading-[1.7]" style={{ color: "rgba(255,255,255,0.48)" }}>
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 7. 왜 바른오더인가요 ── */
const VALUES = [
  { title: "전수 검증 시스템",    desc: "사업자등록증, 보험가입 여부, 실제 서비스 이력까지 다단계로 검증합니다." },
  { title: "수수료 없음",          desc: "고객 매칭에 일체의 수수료를 받지 않습니다. 업체와 고객 모두 무료로 이용하세요." },
  { title: "이사청소 전문",        desc: "이사청소에 특화된 검색과 매칭. 입주·퇴거 청소 전문 업체만 모아드립니다." },
  { title: "투명한 직접 소통",     desc: "1:1 채팅으로 업체와 직접 소통합니다. 중간 개입 없이 자유롭게 조율하세요." },
];

function FrameValues() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04, ...SP }}
        className="mb-10 text-center text-[11px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: C.greenMid }}
      >
        왜 바른오더인가요
      </motion.p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {VALUES.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ x: [-50, 50, -50, 50][i], y: [20, 30, 40, 20][i], opacity: 0, scale: 0.93 }}
            animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.06 + i * 0.1, ...SP_SLOW }}
            className="rounded-2xl p-6 sm:p-7"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.12 + i * 0.1, type: "spring", stiffness: 500, damping: 22 }}
              className="mb-4 block h-1.5 w-1.5 rounded-full"
              style={{ background: C.greenMid }}
            />
            <h3 className="mb-2.5 text-[16px] font-bold text-white">{item.title}</h3>
            <p className="text-[14px] leading-[1.8]" style={{ color: "rgba(255,255,255,0.38)" }}>
              {item.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── 8. CTA ── */
function FrameCTA({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
      <motion.p
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, ...SP }}
        className="mb-7 text-[11px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: C.greenMid }}
      >
        {isLoggedIn ? "바른오더" : "지금 시작하기"}
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.12, ...SP_SLOW }}
        className="font-extrabold tracking-[-0.04em] text-white"
        style={{ fontSize: "clamp(36px, 6vw, 72px)", lineHeight: 1.06 }}
      >
        깨끗한 시작,
        <br />
        <em
          className="not-italic"
          style={{
            background: `linear-gradient(135deg, ${C.greenMid} 0%, #7dd3b0 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          지금 바로.
        </em>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, ...SP_SLOW }}
        className="mt-5 max-w-[380px] text-[15px] leading-[1.8]"
        style={{ color: "rgba(255,255,255,0.38)" }}
      >
        {isLoggedIn
          ? "검증된 이사청소 업체를 지금 바로 찾아보세요."
          : "회원가입 후 바로 매칭을 시작할 수 있습니다.\n수수료 없이 무료입니다."}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32, ...SP }}
        className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
      >
        {isLoggedIn ? (
          <Link
            href="/search"
            className="press-scale inline-flex h-[54px] items-center rounded-xl px-10 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: C.green }}
          >
            업체 찾기
          </Link>
        ) : (
          <>
            <Link
              href="/register"
              className="press-scale inline-flex h-[54px] items-center rounded-xl px-10 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: C.green }}
            >
              무료로 시작하기
            </Link>
            <Link
              href="/register/company"
              className="press-scale inline-flex h-[54px] items-center rounded-xl px-10 text-[15px] font-medium transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.62)" }}
            >
              업체 등록 신청
            </Link>
          </>
        )}
      </motion.div>

      {/* 하단 신뢰 지표 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.48 }}
        className="mt-10 flex items-center gap-2"
        style={{ color: "rgba(255,255,255,0.22)" }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span className="text-[12px]">수수료 없음 · 100% 검증 업체 · 개인정보 안전</span>
      </motion.div>
    </div>
  );
}

/* ── 진행 점 ─────────────────────────────────────────── */
function ProgressDots({ current }: { current: number }) {
  return (
    <div className="absolute right-6 sm:right-8 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2.5">
      {Array.from({ length: TOTAL_FRAMES }).map((_, i) => (
        <motion.span
          key={i}
          animate={{
            opacity: i === current ? 1 : 0.2,
            scale: i === current ? 1.4 : 1,
          }}
          style={{ backgroundColor: "#fff" }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="block h-1.5 w-1.5 rounded-full"
        />
      ))}
    </div>
  );
}

/* ════════════════════════════════════════
   메인 페이지
════════════════════════════════════════ */
export default function Home() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const { isAuthenticated, isInitialized } = useAuthStore();
  const isLoggedIn = isInitialized && isAuthenticated;

  const handleSearch = () => {
    if (keyword.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
    }
  };

  /* ── sticky scroll ── */
  const stickyRef = useRef<HTMLDivElement>(null);
  const frameRef  = useRef(0);
  const animRef   = useRef(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [direction,    setDirection]    = useState<1 | -1>(1);

  const scrollToFrame = useCallback((frame: number) => {
    const el = stickyRef.current;
    if (!el) return;
    window.scrollTo({ top: el.offsetTop + frame * window.innerHeight, behavior: "smooth" });
  }, []);

  const goToFrame = useCallback((next: number, dir: 1 | -1) => {
    if (animRef.current) return;
    if (next < 0 || next >= TOTAL_FRAMES) return;
    frameRef.current = next;
    animRef.current  = true;
    setDirection(dir);
    setCurrentFrame(next);
    scrollToFrame(next);
    setTimeout(() => { animRef.current = false; }, 900);
  }, [scrollToFrame]);

  const exitSection = useCallback((dir: "up" | "down") => {
    const el = stickyRef.current;
    if (!el || animRef.current) return;
    animRef.current = true;
    if (dir === "up") {
      window.scrollTo({ top: el.offsetTop - window.innerHeight * 0.6, behavior: "smooth" });
    } else {
      const end = el.offsetTop + el.offsetHeight - window.innerHeight;
      window.scrollTo({ top: end + 80, behavior: "smooth" });
    }
    setTimeout(() => { animRef.current = false; }, 900);
  }, []);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const el = stickyRef.current;
      if (!el) return;
      const top = el.offsetTop;
      const end = top + el.offsetHeight - window.innerHeight;
      const sy  = window.scrollY;
      if (sy < top - 6 || sy > end + 6) return;
      e.preventDefault();
      const dir  = (e.deltaY > 0 ? 1 : -1) as 1 | -1;
      const next = frameRef.current + dir;
      if      (next < 0)             exitSection("up");
      else if (next >= TOTAL_FRAMES) exitSection("down");
      else                           goToFrame(next, dir);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [goToFrame, exitSection]);

  useEffect(() => {
    const onScroll = () => {
      if (animRef.current) return;
      const el = stickyRef.current;
      if (!el) return;
      const inSection = window.scrollY - el.offsetTop;
      if (inSection < 0 || inSection > el.offsetHeight) return;
      const f = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(inSection / window.innerHeight)));
      if (f !== frameRef.current) {
        frameRef.current = f;
        setCurrentFrame(f);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const renderFrame = (f: number) => {
    if (f === 0) return <FrameStats />;
    if (f >= 1 && f <= 3) return <FrameStep step={STEPS[f - 1]} idx={f - 1} />;
    if (f === 4) return <FrameChat />;
    if (f === 5) return <FrameProfile />;
    if (f === 6) return <FrameEstimates />;
    if (f === 7) return <FrameValues />;
    if (f === 8) return <FrameCTA isLoggedIn={isLoggedIn} />;
    return null;
  };

  return (
    <div className="flex min-h-screen flex-col" style={{ background: C.cream }}>
      <Header />

      <main className="flex-1">

        {/* ════════ HERO ════════ */}
        <section className="relative overflow-hidden pt-14 pb-20 sm:pt-24 sm:pb-32">
          <div
            className="pointer-events-none absolute right-0 top-0 h-[520px] w-[520px] rounded-full opacity-[0.055]"
            style={{ background: C.green, filter: "blur(90px)", transform: "translate(38%, -28%)" }}
          />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <FadeIn y={14} duration={0.55}>
              <div className="mb-8 flex items-center gap-2.5">
                <div className="h-px w-6" style={{ background: C.green }} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: C.green }}>
                  검증된 이사청소 플랫폼
                </span>
              </div>
            </FadeIn>

            <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
              <div className="lg:max-w-[560px]">
                <FadeIn y={28} delay={0.08} duration={0.7}>
                  <h1
                    className="font-extrabold leading-[1.06] tracking-[-0.04em]"
                    style={{ fontSize: "clamp(44px, 7vw, 72px)", color: C.text }}
                  >
                    이사청소,
                    <br />
                    <em className="not-italic" style={{ color: C.green }}>검증된 업체</em>와
                    <br />
                    함께.
                  </h1>
                </FadeIn>

                <FadeIn y={18} delay={0.2} duration={0.7}>
                  <p className="mt-6 text-[16px] leading-[1.85] sm:text-[17px]" style={{ color: C.muted, maxWidth: "420px" }}>
                    사업자 인증부터 서비스 품질, 고객 평가까지 꼼꼼하게
                    검증된 이사청소 업체를{" "}
                    <strong className="font-semibold" style={{ color: C.text }}>무료로</strong>{" "}
                    매칭해드립니다.
                  </p>
                </FadeIn>

                <FadeIn y={16} delay={0.32} duration={0.7}>
                  <div className="mt-9 max-w-[480px] sm:mt-11">
                    <div
                      className="flex overflow-hidden rounded-xl"
                      style={{ border: `1.5px solid ${C.border}`, background: "#fff", boxShadow: "0 2px 16px rgba(26,25,24,0.06)" }}
                    >
                      <div className="flex items-center pl-4" style={{ color: "#bbb" }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="업체명 또는 키워드로 검색"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="h-[52px] flex-1 bg-transparent px-3 text-[15px] placeholder:text-gray-400 focus:outline-none"
                        style={{ color: C.text }}
                      />
                      <button
                        onClick={handleSearch}
                        className="press-scale shrink-0 px-7 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ background: C.green }}
                      >
                        찾기
                      </button>
                    </div>
                    <p className="mt-2.5 pl-1 text-[12px]" style={{ color: C.muted }}>
                      수수료 없이 무료로 이용할 수 있습니다.
                    </p>
                  </div>
                </FadeIn>

                <FadeIn y={12} delay={0.44} duration={0.7}>
                  <div className="mt-9 flex items-center gap-5">
                    <div className="flex -space-x-2">
                      {(["#2d6a4f","#4a8c6a","#1a2f1a","#52b788"] as const).map((c, i) => (
                        <div key={i} className="flex h-7 w-7 items-center justify-center rounded-full ring-2 ring-white text-[10px] font-bold text-white" style={{ background: c }}>
                          {["김","이","박","최"][i]}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((i) => (
                          <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#d97706" stroke="none">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-[12px]" style={{ color: C.muted }}>2,400+ 만족한 고객</span>
                    </div>
                  </div>
                </FadeIn>
              </div>

              {/* 우측 카드 목업 — 3D Tilt + Parallax */}
              <HeroCards />
            </div>
          </div>
        </section>

        {/* ════════ STICKY SCROLL (9 프레임) ════════ */}
        <div ref={stickyRef} style={{ height: `${TOTAL_FRAMES * 100}vh` }} className="relative">
          <div
            className="sticky top-0 h-screen overflow-hidden"
            style={{ background: C.dark }}
          >
            <ProgressDots current={currentFrame} />

            <div className="relative h-full w-full flex items-center justify-center">
              <AnimatePresence mode="sync" custom={direction}>
                <motion.div
                  key={currentFrame}
                  custom={direction}
                  variants={frameVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 flex items-center justify-center px-6 sm:px-14 lg:px-20"
                >
                  {renderFrame(currentFrame)}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* 첫 프레임 스크롤 힌트 */}
            <AnimatePresence>
              {currentFrame === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
                >
                  <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </motion.div>
                  <p className="text-[11px] tracking-wider" style={{ color: "rgba(255,255,255,0.18)" }}>스크롤</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
