"use client";

import { useEffect, useState } from "react";

const EVENT_DATE = new Date("2026-06-13T09:00:00+05:30"); // IST

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(): TimeLeft {
  const diff = EVENT_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) return null;

  const isOver =
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0;

  if (isOver) {
    return (
      <p className="text-amber-200 text-2xl font-bold animate-pulse heading-display">
        🎉 The Reunion is Today!
      </p>
    );
  }

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {units.map(({ label, value }, i) => (
        <div key={label} className="flex items-center gap-2 sm:gap-4">
          <div className="text-center">
            <div
              className="relative bg-gradient-to-br from-white/15 to-white/5 backdrop-blur ring-1 ring-white/20 rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3 min-w-[64px] sm:min-w-[80px] shadow-lg"
            >
              <span className="block text-3xl sm:text-5xl font-extrabold text-white tabular-nums tracking-tight">
                {pad(value)}
              </span>
              <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />
            </div>
            <p className="text-amber-200/80 text-[10px] sm:text-xs mt-1.5 font-semibold uppercase tracking-[0.2em]">
              {label}
            </p>
          </div>
          {i < units.length - 1 && (
            <span className="text-white/30 text-2xl sm:text-3xl font-light mb-5">·</span>
          )}
        </div>
      ))}
    </div>
  );
}
