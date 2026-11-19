import type { Config } from "tailwindcss";

// ── Core palette ────────────────────────────────────────────────────────────
const palette = {
  page: "#203B6F",
  panel: "#312048",
  secondary: "#384F95",
  pixel: "#8E68A9",
  accent: "#BC7EBF",
  heading: "#DBC9F9",
  body: "#A6BAEE",
} as const;

// ── Derived neutrals (for depth) ────────────────────────────────────────────
const neutral = {
  950: "#0F1A33",
  900: "#1A2A4F",
  800: "#2B3A63",
  700: "#4A5A87",
} as const;

// ── Shadows (tinted with neutral-950, never pure black) ─────────────────────
const shadowCard =
  "0 1px 0 rgba(219, 201, 249, 0.04) inset, 0 8px 24px -12px rgba(15, 26, 51, 0.6)";
const shadowCardHover =
  "0 1px 0 rgba(219, 201, 249, 0.06) inset, 0 12px 28px -12px rgba(15, 26, 51, 0.7)";
const shadowSm = "0 1px 2px 0 rgba(15, 26, 51, 0.35)";
const shadowMd = "0 4px 12px -4px rgba(15, 26, 51, 0.5)";
const shadowLg = "0 8px 24px -12px rgba(15, 26, 51, 0.6)";
const shadowXl = "0 16px 36px -16px rgba(15, 26, 51, 0.7)";

// Legacy alias scales, shared by zinc and slate
const grey = {
  100: palette.heading,
  200: palette.heading,
  300: palette.body,
  400: palette.body,
  500: neutral[700],
  600: neutral[700],
  700: palette.secondary,
  800: palette.panel,
  900: palette.panel,
};

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // Replaces Tailwind's default colours: the palette is the entire colour set.
    colors: {
      transparent: "transparent",
      current: "currentColor",
      inherit: "inherit",

      // ── Semantic tokens ──────────────────────────────────────────────────
      page: palette.page, // bg-page
      panel: palette.panel, // bg-panel
      secondary: palette.secondary, // bg-secondary
      elevated: palette.panel, // bg-elevated
      pixel: palette.pixel, // border-pixel
      accent: palette.accent, // ring-accent, text-accent
      heading: palette.heading, // text-heading
      body: palette.body, // text-body
      muted: neutral[700], // text-muted

      // Buttons (bg-btn-accent / bg-btn-secondary; see .btn-* in globals.css)
      "btn-accent": {
        DEFAULT: palette.accent,
        hover: palette.heading,
        text: palette.panel,
      },
      "btn-secondary": {
        DEFAULT: palette.secondary,
        hover: neutral[700],
        text: palette.heading,
      },

      // Binding-status tokens
      "binding-veryhigh": { DEFAULT: "#DBC9F9", text: "#312048" },
      "binding-high": { DEFAULT: "#BC7EBF", text: "#312048" },
      "binding-moderate": { DEFAULT: "#A6BAEE", text: "#312048" },
      "binding-none": { DEFAULT: "#384F95", text: "#A6BAEE", border: "#8E68A9" },

      // Neutrals. 700–950 are the derived neutrals; 50–600 are legacy aliases.
      neutral: {
        50: palette.heading,
        100: palette.heading,
        200: palette.heading,
        300: palette.body,
        400: palette.body,
        500: palette.pixel,
        600: palette.pixel,
        700: neutral[700],
        800: neutral[800],
        900: neutral[900],
        950: neutral[950],
      },

      // ── LEGACY ALIASES ───────────────────────────────────────────────────
      // Existing pages use these class names. Remove once the page restyles
      // are applied.
      white: palette.heading,
      black: neutral[950],
      zinc: grey,
      slate: grey,
      blue: { 300: palette.body, 400: palette.body, 500: palette.secondary },
      cyan: { 300: palette.body, 400: palette.body, 500: palette.secondary },
      emerald: { 300: palette.accent, 400: palette.accent, 500: palette.accent },
      green: { 300: palette.accent, 400: palette.accent, 500: palette.accent },
      red: { 300: palette.accent, 400: palette.accent, 500: palette.accent },
      purple: { 300: palette.heading, 400: palette.accent, 500: palette.pixel },
      orange: { 300: palette.heading, 400: palette.accent, 500: palette.pixel },
      amber: { 300: palette.heading, 400: palette.accent, 500: palette.pixel },
      yellow: { 400: palette.accent, 500: palette.pixel },

      // Older semantic names carried over from the pixel config, still mapped
      // onto the palette so nothing renders off-palette.
      background: palette.page,
      canvas: {
        DEFAULT: palette.page,
        subtle: palette.panel,
        inset: palette.panel,
        overlay: palette.secondary,
      },
      surface: {
        DEFAULT: palette.page,
        card: palette.panel,
        elevated: palette.secondary,
        overlay: palette.secondary,
        border: palette.pixel,
        hover: palette.secondary,
      },
      fg: {
        DEFAULT: palette.heading,
        muted: palette.body,
        subtle: palette.pixel,
        on_emphasis: palette.panel,
      },
      brand: {
        50: palette.heading,
        100: palette.heading,
        200: palette.heading,
        300: palette.accent,
        400: palette.accent,
        500: palette.accent,
        600: palette.accent,
        700: palette.pixel,
        800: palette.secondary,
        900: palette.panel,
        accent: palette.accent,
        emphasis: palette.heading,
        muted: palette.pixel,
      },
      teal: {
        50: palette.heading,
        300: palette.body,
        400: palette.body,
        500: palette.body,
        600: palette.body,
        700: palette.secondary,
        accent: palette.body,
      },
      danger: {
        DEFAULT: palette.heading,
        muted: palette.pixel,
        subtle: palette.secondary,
        emphasis: palette.accent,
      },
    },

    borderRadius: {
      none: "0",
      sm: "6px",
      DEFAULT: "8px",
      md: "8px",
      lg: "12px",
      xl: "16px",
      "2xl": "16px",
      "3xl": "16px",
      full: "9999px",
    },

    // Soft outer shadows plus a 1px top highlight. No bevels, no glow.
    boxShadow: {
      none: "none",
      sm: shadowSm,
      DEFAULT: shadowCard,
      md: shadowMd,
      lg: shadowLg,
      xl: shadowXl,
      "2xl": shadowXl,
      inner: "none",
      card: shadowCard,
      "card-hover": shadowCardHover,

      // Legacy names from the pixel config
      bevel: shadowCard,
      "bevel-secondary": shadowCard,
      "bevel-sunken": "none",
      "bevel-accent": shadowCard,
      "bevel-accent-pressed": "none",
      "glow-sm": "none",
      glow: "none",
      "glow-teal": "none",
      z1: shadowSm,
      z2: shadowMd,
      z3: shadowLg,
      z4: shadowXl,
    },

    extend: {
      fontFamily: {
        sans: [
          "var(--font-body)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        body: [
          "var(--font-body)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        heading: [
          "var(--font-heading)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        mono: [
          "var(--font-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
        // Legacy: `font-pixel` now resolves to the heading face
        pixel: [
          "var(--font-heading)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },

      // Default border colour (bare `border`, `divide-*`)
      borderColor: {
        DEFAULT: neutral[800],
      },

      // Focus rings: restores ring utilities so focus:ring-2 etc. work
      ringWidth: {
        DEFAULT: "3px",
      },
      ringColor: {
        DEFAULT: palette.accent,
      },
    },
  },
  plugins: [],
};

export default config;
