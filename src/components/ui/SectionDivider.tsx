/**
 * Decorative SVG divider used between major sections of the home page.
 * Subtle wavy or scalloped shape with the brand color washes.
 */
interface SectionDividerProps {
  variant?: "wave" | "tilt" | "scallop";
  /** Background color the divider sits ABOVE (i.e. the section above) */
  fromColor?: string;
  /** Background color the divider sits ON (i.e. the section below) */
  toColor?: string;
  flip?: boolean;
}

export function SectionDivider({
  variant = "wave",
  fromColor = "transparent",
  toColor = "white",
  flip = false,
}: SectionDividerProps) {
  const path =
    variant === "wave"
      ? "M0,40 C300,80 900,0 1200,40 L1200,60 L0,60 Z"
      : variant === "tilt"
      ? "M0,60 L1200,0 L1200,60 Z"
      : "M0,60 Q300,0 600,30 T1200,60 L1200,60 L0,60 Z";
  return (
    <div
      aria-hidden="true"
      className={`relative w-full pointer-events-none leading-none ${
        flip ? "rotate-180" : ""
      }`}
      style={{ background: fromColor }}
    >
      <svg
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
        className="w-full h-10 sm:h-14 block"
      >
        <path d={path} fill={toColor} />
      </svg>
    </div>
  );
}
