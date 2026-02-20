"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { type ReactNode, useContext, useRef, useEffect } from "react";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

function FrozenRouter({ children }: { children: ReactNode }) {
  const context = useContext(LayoutRouterContext);
  const frozen = useRef(context).current;

  return (
    <LayoutRouterContext.Provider value={frozen}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

const ease = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

const variants = {
  initial: { x: 60, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease },
  },
  exit: (scrollY: number) => ({
    x: -60,
    opacity: 0,
    y: -scrollY,
    transition: {
      duration: 0.25,
      ease,
      y: { duration: 0 },
    },
  }),
};

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const scrollRef = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      scrollRef.current = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence mode="wait" initial={false} custom={scrollRef.current}>
      <motion.div
        key={pathname}
        custom={scrollRef.current}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
}
