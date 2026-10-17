"use client";

import type { PointerEvent, ReactNode } from "react";

/** Leans its content toward the mouse. Writes CSS variables directly, so moving never re-renders. */
export default function Tilt({ children, className = "", max = 8 }: { children: ReactNode; className?: string; max?: number }) {
  function handleMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    const style = event.currentTarget.style;
    style.setProperty("--ry", `${(x - 0.5) * max * 2}deg`);
    style.setProperty("--rx", `${(0.5 - y) * max * 2}deg`);
    style.setProperty("--gx", `${x * 100}%`);
    style.setProperty("--gy", `${y * 100}%`);
    style.setProperty("--glare", "1");
  }

  function handleLeave(event: PointerEvent<HTMLDivElement>) {
    const style = event.currentTarget.style;
    style.setProperty("--rx", "0deg");
    style.setProperty("--ry", "0deg");
    style.setProperty("--glare", "0");
  }

  return (
    <div className={`tilt-card ${className}`} onPointerMove={handleMove} onPointerLeave={handleLeave}>
      {children}
    </div>
  );
}
