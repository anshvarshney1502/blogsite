"use client";

import React from "react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

interface ScrollRevealSectionProps {
  children: React.ReactNode;
  delay?: number;
}

export default function ScrollRevealSection({ children, delay = 0 }: ScrollRevealSectionProps) {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`reveal ${isVisible ? "reveal-visible" : ""}`}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
