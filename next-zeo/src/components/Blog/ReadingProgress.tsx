"use client";

import { motion, useScroll, useSpring } from 'framer-motion';

export default function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      className="fixed left-0 right-0 top-0 z-[100] h-1.5 origin-left bg-primary"
      style={{ scaleX }}
    />
  );
}
