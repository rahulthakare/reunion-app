import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  decorate?: boolean;
}

/**
 * Elegant section heading: small uppercase eyebrow, big serif title, soft subtitle.
 * Used to give every page section a magazine-like rhythm.
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  decorate = true,
}: SectionHeadingProps) {
  const alignClass = align === "center" ? "text-center items-center" : "text-left items-start";
  return (
    <div className={`flex flex-col gap-2 ${alignClass} mb-8`}>
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.25em] text-brand-700 font-semibold">
          {eyebrow}
        </p>
      )}
      <h2 className="heading-display text-3xl sm:text-4xl font-bold text-gray-900">
        {title}
      </h2>
      {decorate && (
        <span
          className={`block h-1 w-16 rounded-full bg-gradient-to-r from-brand-400 via-accent-400 to-amber-300 mt-1 ${
            align === "center" ? "mx-auto" : ""
          }`}
        />
      )}
      {subtitle && (
        <p className="text-gray-500 max-w-2xl mt-2">{subtitle}</p>
      )}
    </div>
  );
}
