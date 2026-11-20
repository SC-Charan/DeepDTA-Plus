import type { Config } from "tailwindcss";

const palette = {
  // DeepDTA + palette: sand F6C992 · deep 30525C · mist ACC0D3 · rose D396A6 · teal 09A1A1 · steel 5484A4
  bgBase: "#000000",
  bgSurface: "#070c0e",
  bgElevated: "#0d1518",
  bgHover: "#132026",
  borderSubtle: "#14242a",
  borderDefault: "#1d3036",
  borderBright: "#30525C",
  accent: "#09A1A1",
  accentBright: "#09A1A1",
  accentPink: "#D396A6",
  accentCyan: "#5484A4",
  sand: "#F6C992",
  mist: "#ACC0D3",
  heading: "#F8FAFC",
  body: "#ACC0D3",
  muted: "#7b93a6",
} as const;

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      inherit: "inherit",

      // Semantic
      page: palette.bgBase,
      panel: palette.bgSurface,
      secondary: palette.bgElevated,
      pixel: palette.borderDefault,
      accent: palette.accent,
      "btn-accent": palette.accent,
      "accent-bright": palette.accentBright,
      "accent-pink": palette.accentPink,
      "accent-cyan": palette.accentCyan,
      heading: palette.heading,
      body: palette.body,
      muted: palette.muted,
      "border-subtle": palette.borderSubtle,
      "border-bright": palette.borderBright,

      // Binding
      "binding-veryhigh": { DEFAULT: palette.accent, text: palette.bgBase },
      "binding-high": { DEFAULT: palette.accentCyan, text: palette.heading },
      "binding-moderate": { DEFAULT: palette.sand, text: palette.bgBase },
      "binding-none": { DEFAULT: palette.accentPink, text: palette.bgBase },

      // Legacy surfaces
      background: palette.bgBase,
      canvas: { DEFAULT: palette.bgBase, subtle: palette.bgSurface, inset: palette.bgSurface, overlay: palette.bgElevated },
      surface: { DEFAULT: palette.bgBase, card: palette.bgSurface, elevated: palette.bgElevated, overlay: palette.bgElevated, border: palette.borderDefault, hover: palette.bgElevated },
      fg: { DEFAULT: palette.heading, muted: palette.body, subtle: palette.muted, on_emphasis: palette.bgBase },

      // Legacy families → remapped to palette
      white: palette.heading,
      black: palette.bgBase,
      zinc: { 100: palette.heading, 200: palette.heading, 300: palette.body, 400: palette.body, 500: palette.muted, 600: palette.muted, 700: palette.borderDefault, 800: palette.bgElevated, 900: palette.bgSurface },
      slate: { 100: palette.heading, 200: palette.heading, 300: palette.body, 400: palette.body, 500: palette.muted, 600: palette.muted, 700: palette.borderDefault, 800: palette.bgElevated, 900: palette.bgSurface },
      gray: { 100: palette.heading, 200: palette.heading, 300: palette.body, 400: palette.body, 500: palette.muted, 600: palette.muted, 700: palette.borderDefault, 800: palette.bgElevated, 900: palette.bgSurface },
      neutral: { 50: palette.heading, 100: palette.heading, 200: palette.heading, 300: palette.body, 400: palette.body, 500: palette.muted, 600: palette.muted, 700: palette.borderDefault, 800: palette.bgElevated, 900: palette.bgSurface, 950: palette.bgBase },
      blue: { 300: palette.body, 400: palette.accentCyan, 500: palette.accentCyan, 600: palette.accentCyan },
      cyan: { 300: palette.body, 400: palette.accentCyan, 500: palette.accentCyan },
      sky: { 400: palette.accentCyan, 500: palette.accentCyan },
      emerald: { 300: palette.accentBright, 400: palette.accentBright, 500: palette.accentBright },
      green: { 300: palette.accentBright, 400: palette.accentBright, 500: palette.accentBright },
      red: { 300: palette.accentPink, 400: palette.accentPink, 500: palette.accentPink },
      rose: { 400: palette.accentPink, 500: palette.accentPink },
      purple: { 300: palette.accentBright, 400: palette.accent, 500: palette.accent },
      violet: { 400: palette.accent, 500: palette.accent },
      pink: { 400: palette.accentPink, 500: palette.accentPink },
      orange: { 300: palette.accent, 400: palette.accent, 500: palette.accent },
      amber: { 300: palette.accent, 400: palette.accent, 500: palette.accent },
      yellow: { 400: palette.accent, 500: palette.accent },
      indigo: { 400: palette.accent, 500: palette.accent },

      brand: {
        50: palette.heading, 100: palette.heading, 200: palette.body,
        300: palette.accentBright, 400: palette.accentBright, 500: palette.accent,
        600: palette.accent, 700: palette.accent, 800: palette.bgElevated,
        900: palette.bgSurface, accent: palette.accent, emphasis: palette.accentBright,
        muted: palette.muted,
      },
      teal: { 50: palette.heading, 300: palette.accentCyan, 400: palette.accentCyan, 500: palette.accentCyan, 600: palette.accentCyan, 700: palette.bgElevated, accent: palette.accentCyan },
      danger: { DEFAULT: palette.accentPink, muted: palette.muted, subtle: palette.bgElevated, emphasis: palette.accentPink },
    },

    borderRadius: {
      none: "0", sm: "4px", DEFAULT: "8px", md: "8px", lg: "12px",
      xl: "16px", "2xl": "20px", "3xl": "24px", full: "9999px",
    },

    boxShadow: {
      none: "none",
      sm: "0 1px 2px rgba(0,0,0,0.5)",
      DEFAULT: "0 4px 16px rgba(0,0,0,0.5)",
      md: "0 8px 24px rgba(0,0,0,0.5)",
      lg: "0 16px 40px rgba(0,0,0,0.6)",
      xl: "0 24px 60px rgba(0,0,0,0.7)",
      inner: "inset 0 1px 0 rgba(248,250,252,0.06)",
      glow: "0 0 30px -5px rgba(9, 161, 161, 0.5)",
      "glow-sm": "0 0 20px -5px rgba(9, 161, 161, 0.4)",
      "glow-accent": "0 0 40px -10px rgba(172, 192, 211, 0.6)",
      "glow-pink": "0 0 30px -5px rgba(211, 150, 166, 0.5)",
      "glow-cyan": "0 0 30px -5px rgba(84, 132, 164, 0.5)",
      card: "0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(248,250,252,0.04)",
      "card-hover": "0 16px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(248,250,252,0.06)",
      z1: "0 2px 8px rgba(0,0,0,0.4)",
      z2: "0 4px 16px rgba(0,0,0,0.5)",
      z3: "0 8px 24px rgba(0,0,0,0.5)",
      z4: "0 16px 40px rgba(0,0,0,0.6)",
    },

    extend: {
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1.1" }],
        "6xl": ["3.75rem", { lineHeight: "1.1" }],
      },
      borderColor: ({ theme }) => ({
        ...(theme("colors") as Record<string, unknown>),
        DEFAULT: palette.borderDefault,
      }),
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-accent": "linear-gradient(135deg, #09A1A1 0%, #5484A4 100%)",
        "gradient-accent-soft": "linear-gradient(135deg, rgba(9,161,161,0.15) 0%, rgba(84,132,164,0.15) 100%)",
        "grid-faint": "linear-gradient(rgba(248,250,252,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(248,250,252,0.03) 1px, transparent 1px)",
      },
      backgroundSize: { grid: "40px 40px" },
      keyframes: {
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
      animation: {
        "fade-in": "fade-in 150ms ease-out",
        shimmer: "shimmer 2s linear infinite",
      },
      transitionTimingFunction: { DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)" },
      transitionDuration: { DEFAULT: "200ms" },
    },
  },
  plugins: [],
};

export default config;
