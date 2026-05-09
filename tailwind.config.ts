import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Reunion brand palette — warm sunset + playful accents
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        // Companion accent (deep berry pink)
        accent: {
          50: "#fdf2f8",
          100: "#fce7f3",
          200: "#fbcfe8",
          300: "#f9a8d4",
          400: "#f472b6",
          500: "#ec4899",
          600: "#db2777",
          700: "#be185d",
        },
        // Friendly secondary (teal/sky)
        sky2: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "sunset-radial":
          "radial-gradient(circle at top right, #fef3c7 0%, #fde68a 25%, #fdba74 60%, #fb7185 100%)",
        "party-radial":
          "radial-gradient(circle at top left, #c7d2fe 0%, #fbcfe8 50%, #fdba74 100%)",
        "confetti-stripes":
          "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 6px, transparent 6px 12px)",
      },
      boxShadow: {
        glow: "0 8px 30px -8px rgba(249, 115, 22, 0.35)",
        pop: "0 12px 40px -12px rgba(236, 72, 153, 0.4)",
      },
      animation: {
        "float-slow": "float 7s ease-in-out infinite",
        "float-med": "float 5s ease-in-out infinite",
        "float-fast": "float 3.5s ease-in-out infinite",
        wiggle: "wiggle 2.5s ease-in-out infinite",
        "gradient-pan": "gradient-pan 14s ease infinite",
        "fade-in-up": "fade-in-up 0.6s ease-out both",
        "pop-in": "pop-in 0.45s cubic-bezier(.2,1.6,.4,1) both",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.85)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
