"use client";

import React, { useEffect, useState } from "react";

export function Meteors({ number = 30 }: { number?: number }) {
  const [isDark, setIsDark] = useState(false);
  const [meteorStyles, setMeteorStyles] = useState<{ left: string; delay: string; duration: string }[]>([]);

  useEffect(() => {
    // Check initial dark mode
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDark();

    // Observe theme updates
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    // Generate static styles on mount to avoid hydration mismatch
    const styles = Array.from({ length: number }).map(() => ({
      left: Math.floor(Math.random() * 800 - 400) + "px",
      delay: (Math.random() * 0.8 + 0.2).toFixed(2) + "s",
      duration: Math.floor(Math.random() * 10 + 4) + "s",
    }));
    setMeteorStyles(styles);

    return () => observer.disconnect();
  }, [number]);

  if (!isDark) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[2]">
      {meteorStyles.map((style, idx) => (
        <span
          key={"meteor" + idx}
          className="animate-meteor-effect absolute top-0 left-1/2 h-0.5 w-0.5 rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10] rotate-[215deg]"
          style={{
            left: `calc(50% + ${style.left})`,
            animationDelay: style.delay,
            animationDuration: style.duration,
          }}
        />
      ))}
    </div>
  );
}
