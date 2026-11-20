import type { Config } from "tailwindcss";

/* DeepDTA + palette
   sand  #F6C992 · deep  #30525C · mist #ACC0D3
   rose  #D396A6 · teal  #09A1A1 · steel #5484A4
   Default Tailwind hues (green, red, blue…) are remapped onto this palette so
   every page that has not been redesigned yet already follows it. */
const teal = {
  50: "#e6f7f7", 100: "#c2ecec", 200: "#8cdada", 300: "#4cc4c4", 400: "#20b0b0",
  500: "#09A1A1", 600: "#078585", 700: "#066868", 800: "#054d4d", 900: "#033535",
};
const rose = {
  50: "#faf0f3", 100: "#f4dde3", 200: "#eabfca", 300: "#e0a9b8", 400: "#D396A6",
  500: "#c27a8e", 600: "#a65f73", 700: "#854a5b", 800: "#63373f", 900: "#432530",
};
const sand = {
  50: "#fdf6ec", 100: "#fbebd3", 200: "#f9dcb5", 300: "#F6C992", 400: "#efb878",
  500: "#e2a05a", 600: "#c4823f", 700: "#9a6430", 800: "#704824", 900: "#4b301a",
};
const steel = {
  50: "#eef3f7", 100: "#dbe5ee", 200: "#ACC0D3", 300: "#8aa7c0", 400: "#6b93b0",
  500: "#5484A4", 600: "#426a85", 700: "#345469", 800: "#273f4f", 900: "#1b2b36",
};

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
        background: "#000000",
        canvas: { DEFAULT: "#000000", subtle: "#080d0f", inset: "#000000", overlay: "#0e1619" },
        surface: {
          DEFAULT: "#000000",
          card: "#080d0f",
          elevated: "#0e1619",
          overlay: "#142024",
          border: "#1d3036",
          hover: "#30525C",
        },
        fg: { DEFAULT: "#EEF3F7", muted: "#ACC0D3", subtle: "#7b93a6", on_emphasis: "#000000" },
        brand: { ...teal, accent: "#09A1A1", emphasis: "#078a8a", muted: "#30525C" },
        pal: { sand: "#F6C992", deep: "#30525C", mist: "#ACC0D3", rose: "#D396A6", teal: "#09A1A1", steel: "#5484A4" },
        teal, green: teal, emerald: teal, lime: teal,
        red: rose, rose, pink: rose, purple: rose, violet: rose, fuchsia: rose,
        amber: sand, yellow: sand, orange: sand,
        blue: steel, sky: steel, cyan: steel, indigo: steel,
        danger: { DEFAULT: "#D396A6", muted: "#a65f73", subtle: "#241419", emphasis: "#e0a9b8" },
        neutral: {
          50: "#f6f8fa", 100: "#eaeef2", 200: "#d0d7de", 300: "#afb8c1", 400: "#8c959f",
          500: "#6e7781", 600: "#57606a", 700: "#424a53", 800: "#32383f", 900: "#24292f", 950: "#1c2128",
        },
      },
      fontFamily: {
        sans: ["Manrope", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Cascadia Code", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      fontSize: { "2xs": ["0.6875rem", { lineHeight: "1.2" }] },
      borderRadius: { "2xl": "12px", "3xl": "16px" },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.6), 0 0 0 1px rgba(29,48,54,0.7)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.7), 0 0 0 1px rgba(9,161,161,0.35)",
        "glow-sm": "0 0 12px -3px rgba(9,161,161,0.45)",
        glow: "0 0 24px -6px rgba(9,161,161,0.55)",
        "glow-teal": "0 0 20px -5px rgba(9,161,161,0.45)",
        z1: "0 1px 2px rgba(0,0,0,0.6)",
        z2: "0 2px 8px rgba(0,0,0,0.5)",
        z3: "0 8px 24px rgba(0,0,0,0.4)",
        z4: "0 16px 48px rgba(0,0,0,0.5)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "slide-in-right": { from: { opacity: "0", transform: "translateX(12px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        "scale-in": { from: { opacity: "0", transform: "scale(0.96)" }, to: { opacity: "1", transform: "scale(1)" } },
        "ping-slow": { "0%, 100%": { transform: "scale(1)", opacity: "0.8" }, "50%": { transform: "scale(1.4)", opacity: "0" } },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease forwards",
        "slide-in-right": "slide-in-right 0.2s ease forwards",
        "scale-in": "scale-in 0.15s ease forwards",
        "ping-slow": "ping-slow 2s cubic-bezier(0,0,0.2,1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
