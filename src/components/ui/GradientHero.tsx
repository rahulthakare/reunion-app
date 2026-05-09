import type { ReactNode } from "react";
import { FloatingEmoji } from "./FloatingEmoji";

interface GradientHeroProps {
  /** Background gradient style */
  variant?: "sunset" | "party" | "calm" | "fun";
  /** Show floating emoji decoration */
  decorate?: boolean;
  /** Custom emojis to float */
  emojis?: string[];
  /** Confetti dot pattern overlay */
  confetti?: boolean;
  className?: string;
  children: ReactNode;
}

const VARIANTS: Record<NonNullable<GradientHeroProps["variant"]>, string> = {
  sunset: "bg-gradient-to-br from-amber-100 via-brand-200 to-accent-200",
  party: "bg-gradient-to-br from-indigo-100 via-accent-100 to-brand-200",
  calm: "bg-gradient-to-br from-sky2-100 via-indigo-50 to-amber-100",
  fun: "bg-gradient-to-br from-accent-100 via-amber-100 to-sky2-100",
};

export function GradientHero({
  variant = "sunset",
  decorate = true,
  emojis,
  confetti = true,
  className = "",
  children,
}: GradientHeroProps) {
  return (
    <section
      className={`relative overflow-hidden rounded-3xl ${VARIANTS[variant]} ${
        confetti ? "confetti-bg" : ""
      } ${className}`}
    >
      {decorate && <FloatingEmoji emojis={emojis} />}
      <div className="relative z-10">{children}</div>
    </section>
  );
}
