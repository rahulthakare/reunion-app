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

  if (!mounted) return null; // avoid hydration mismatch

  const isOver = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  if (isOver) {
    return (
      <p className="text-white text-2xl font-bold animate-pulse">
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
    <div className="flex items-center justify-center gap-3 sm:gap-6">
      {units.map(({ label, value }, i) => (
        <div key={label} className="flex items-center gap-3 sm:gap-6">
          <div className="text-center">
            <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-3 min-w-[64px]">
              <span className="text-3xl sm:text-4xl font-extrabold text-white tabular-nums">
                {pad(value)}
              </span>
            </div>
            <p className="text-indigo-200 text-xs mt-1 font-medium uppercase tracking-wide">
              {label}
            </p>
          </div>
          {i < units.length - 1 && (
            <span className="text-white/50 text-3xl font-light mb-5">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
