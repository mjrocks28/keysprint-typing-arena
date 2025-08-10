"use client";

import { useEffect } from "react";

export function useConfetti(open: boolean) {
  useEffect(() => {
    if (!open) return;
    let stopped = false;
    let raf: number | undefined;
    (async () => {
      const { default: confetti } = await import("canvas-confetti");
      const duration = 1200;
      const end = Date.now() + duration;
      const defaults = { startVelocity: 35, spread: 360, ticks: 80, zIndex: 3000 } as const;
      const frame = () => {
        if (stopped) return;
        confetti({ ...defaults, particleCount: 24, origin: { x: 0.2, y: 0.2 } });
        confetti({ ...defaults, particleCount: 24, origin: { x: 0.8, y: 0.2 } });
        confetti({ ...defaults, particleCount: 20, origin: { x: 0.5, y: 0.1 } });
        if (Date.now() < end) raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    })();
    return () => {
      stopped = true;
      if (raf) cancelAnimationFrame(raf);
    };
  }, [open]);
}


