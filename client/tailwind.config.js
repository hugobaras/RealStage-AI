/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        deep: "rgb(var(--c-deep) / <alpha-value>)",
        panel: "rgb(var(--c-panel) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        fg: "rgb(var(--c-fg) / <alpha-value>)",
        "fg-muted": "rgb(var(--c-fg-muted) / <alpha-value>)",
        "fg-subtle": "rgb(var(--c-fg-subtle) / <alpha-value>)",
        line: "rgb(var(--c-line) / <alpha-value>)",
        elevated: "rgb(var(--c-elevated) / <alpha-value>)",
        "elevated-hover": "rgb(var(--c-elevated-hover) / <alpha-value>)",
        muted: "#9CA3AF",
        accent: "#D9A520",
        "accent-light": "#F0CA45",
        "accent-dark": "#C4941A",
        navy: "#1C2B3A",
        estate: {
          cream: "#FAF8F5",
          sand: "#F0EBE3",
          linen: "#E8E0D4",
          navy: "#1C2B3A",
          slate: "#3D4F5F",
          muted: "#6B7C8A",
          gold: "#D9A520",
          "gold-light": "#F0CA45",
          stone: "#A69482",
          "stone-light": "#C4B5A6",
          "stone-dark": "#857566",
          "stone-warm": "#AA9888",
          "stone-warm-light": "#C6B6A8",
          "stone-warm-dark": "#877568",
          "stone-cool": "#9C9389",
          "stone-cool-light": "#BAB2A8",
          "stone-cool-dark": "#7A736C",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ['"Playfair Display"', "Georgia", "serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -20px) scale(1.05)" },
          "66%": { transform: "translate(-20px, 15px) scale(0.95)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.08)" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "ken-burns": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.06)" },
        },
        "slide-reveal": {
          "0%, 45%": { transform: "translateX(0%)" },
          "55%, 100%": { transform: "translateX(100%)" },
        },
        "bounce-x": {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(4px)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out forwards",
        "fade-in": "fade-in 0.5s ease-out forwards",
        float: "float 4s ease-in-out infinite",
        "float-slow": "float-slow 12s ease-in-out infinite",
        marquee: "marquee 28s linear infinite",
        shimmer: "shimmer 3s linear infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "gradient-x": "gradient-x 6s ease infinite",
        "ken-burns": "ken-burns 8s ease-out forwards",
        "bounce-x": "bounce-x 1.2s ease-in-out infinite",
        "spin-slow": "spin-slow 20s linear infinite",
      },
    },
  },
  plugins: [],
};
