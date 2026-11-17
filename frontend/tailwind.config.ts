import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0F17",
        surface: {
          DEFAULT: "#0B0F17",
          50: "#1E293B",
          100: "#171F30",
          200: "#131A29",
          card: "#111622",
          elevated: "#182032",
          border: "#1F293D",
          hover: "#26344E",
        },
        brand: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
        },
        teal: {
          glow: "#14B8A6",
        },
        cyan: {
          glow: "#06B6D4",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        glow: "0 0 20px -5px rgba(16, 185, 129, 0.3)",
        "glow-teal": "0 0 25px -5px rgba(20, 184, 166, 0.35)",
        "glow-card": "0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(31, 41, 61, 0.6)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 10px rgba(16, 185, 129, 0.2)" },
          "100%": { boxShadow: "0 0 25px rgba(16, 185, 129, 0.5)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
