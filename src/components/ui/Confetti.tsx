"use client";

import { useEffect, useState } from "react";

/**
 * Lightweight CSS-based confetti burst — no external libs needed.
 * Renders a few dozen colored squares that fall + spin then disappear.
 * Use `<Confetti trigger />` and pass `trigger=true` to play once.
 */

interface ConfettiProps {
  trigger: boolean;
  durationMs?: number;
}

const COLORS = [
  "#f97316", // brand-500
  "#ec4899", // accent-500
  "#22d3ee", // sky2-400
  "#facc15", // amber-400
  "#a78bfa", // violet-400
  "#34d399", // emerald-400
];

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  rotate: number;
  color: string;
}

export function Confetti({ trigger, durationMs = 1800 }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!trigger) return;
    const next: Particle[] = Array.from({ length: 60 }, (_, i) => ({
      id: i + Date.now(),
      left: Math.random() * 100,
      delay: Math.random() * 250,
      duration: 1200 + Math.random() * 800,
      rotate: (Math.random() - 0.5) * 720,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
    setParticles(next);
    setVisible(true);
    const t = setTimeout(() => setVisible(false), durationMs);
    return () => clearTimeout(t);
  }, [trigger, durationMs]);

  if (!visible) return null;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            top: "-2vh",
            left: `${p.left}%`,
            width: 9,
            height: 14,
            background: p.color,
            opacity: 0.9,
            borderRadius: 2,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confetti-fall ${p.duration}ms cubic-bezier(.2,.6,.4,1) ${p.delay}ms forwards`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
