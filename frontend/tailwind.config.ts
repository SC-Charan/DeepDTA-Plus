import type { Config } from "tailwindcss";

const palette = {
  page: "#203B6F",
  panel: "#312048",
  secondary: "#384F95",
  pixel: "#8E68A9",
  accent: "#BC7EBF",
  heading: "#DBC9F9",
  body: "#A6BAEE",
} as const;

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

            // ── Compatibility aliases ──────────────────────────────────────
      // Existing pages use these class names; remap them to the palette so
      // nothing renders in a banned hue. Remove after LLM 5–8 restyle app/.
      white: palette.heading,
      black: palette.page,
      zinc: {
        100: palette.heading, 200: palette.heading, 300: palette.body,
        400: palette.body, 500: palette.pixel, 600: palette.pixel,
        700: palette.secondary, 800: palette.panel, 900: palette.panel,
      },
      slate: {
        100: palette.heading, 200: palette.heading, 300: palette.body,
        400: palette.body, 500: palette.pixel, 600: palette.pixel,
        700: palette.secondary, 800: palette.panel, 900: palette.panel,
      },
      red:     { 300: palette.accent, 400: palette.accent, 500: palette.accent },
      green:   { 300: palette.body,  400: palette.body,  500: palette.secondary },
      emerald: { 300: palette.accent, 400: palette.accent, 500: palette.accent },
      cyan:    { 300: palette.body,  400: palette.body,  500: palette.secondary },
      blue:    { 300: palette.body,  400: palette.body,  500: palette.secondary },
      purple:  { 300: palette.heading, 400: palette.accent, 500: palette.pixel },
      orange:  { 300: palette.heading, 400: palette.accent, 500: palette.pixel },
      amber:   { 300: palette.heading, 400: palette.accent, 500: palette.pixel },
      yellow:  { 400: palette.accent, 500: palette.pixel },
      // ───────────────────────────────────────────────────────────────

      // Semantic tokens
      page: palette.page, // bg-page
      panel: palette.panel, // bg-panel
      secondary: palette.secondary, // bg-secondary
      pixel: palette.pixel, // border-pixel
      "btn-accent": palette.accent, // bg-btn-accent
      accent: palette.accent,
      heading: palette.heading, // text-heading
      body: palette.body, // text-body

      // Binding-status tokens (brightness + fill pattern, never colour alone)
      "binding-veryhigh": { DEFAULT: "#DBC9F9", text: "#312048" },
      "binding-high": { DEFAULT: "#BC7EBF", text: "#312048" },
      "binding-moderate": { DEFAULT: "#A6BAEE", text: "#312048" },
      "binding-none": { DEFAULT: "#384F95", text: "#A6BAEE", border: "#8E68A9" },

      // Legacy aliases, remapped onto the palette so existing class names keep resolving
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
      neutral: {
        50: palette.heading,
        100: palette.heading,
        200: palette.heading,
        300: palette.body,
        400: palette.body,
        500: palette.pixel,
        600: palette.pixel,
        700: palette.secondary,
        800: palette.secondary,
        900: palette.panel,
        950: palette.page,
      },
    },

    // border-radius: 0 everywhere, no exceptions
    borderRadius: {
      none: "0",
      sm: "0",
      DEFAULT: "0",
      md: "0",
      lg: "0",
      xl: "0",
      "2xl": "0",
      "3xl": "0",
      full: "0",
    },

    // Inset bevels only. No outer shadows, glows, blur or spread.
    boxShadow: {
      none: "none",
      DEFAULT: "inset 2px 2px 0 0 #384F95, inset -2px -2px 0 0 #203B6F",
      bevel: "inset 2px 2px 0 0 #384F95, inset -2px -2px 0 0 #203B6F",
      "bevel-secondary": "inset 2px 2px 0 0 #A6BAEE, inset -2px -2px 0 0 #312048",
      "bevel-sunken": "inset 2px 2px 0 0 #312048, inset -2px -2px 0 0 #384F95",
      "bevel-accent": "inset 2px 2px 0 0 #DBC9F9, inset -2px -2px 0 0 #8E68A9",
      "bevel-accent-pressed": "inset 2px 2px 0 0 #8E68A9, inset -2px -2px 0 0 #DBC9F9",
      // Legacy names
      card: "inset 2px 2px 0 0 #384F95, inset -2px -2px 0 0 #203B6F",
      "card-hover": "inset 2px 2px 0 0 #384F95, inset -2px -2px 0 0 #203B6F",
      "glow-sm": "none",
      glow: "none",
      "glow-teal": "none",
      z1: "none",
      z2: "none",
      z3: "none",
      z4: "none",
    },

    // Rings are outer spread shadows, so they are disabled. Focus uses outline.
    ringWidth: { DEFAULT: "0px", 0: "0px" },
    dropShadow: {},
    backdropBlur: {},

    // No animation other than simple state transitions
    keyframes: {},
    animation: { none: "none" },

    extend: {
      fontFamily: {
        sans: ["var(--font-body)", "ui-monospace", "Menlo", "Consolas", "monospace"],
        mono: ["var(--font-body)", "ui-monospace", "Menlo", "Consolas", "monospace"],
        body: ["var(--font-body)", "ui-monospace", "Menlo", "Consolas", "monospace"],
        pixel: ["var(--font-pixel)", "ui-monospace", "Menlo", "Consolas", "monospace"],
      },
      // Scaled up so VT323 stays readable and the hierarchy stays correct
      fontSize: {
        "2xs": ["1rem", { lineHeight: "1.2" }],
        xs: ["1.0625rem", { lineHeight: "1.25" }],
        sm: ["1.1875rem", { lineHeight: "1.3" }],
        base: ["1.25rem", { lineHeight: "1.3" }],
        lg: ["1.375rem", { lineHeight: "1.3" }],
        xl: ["1.5rem", { lineHeight: "1.25" }],
        "2xl": ["1.75rem", { lineHeight: "1.2" }],
        "3xl": ["2rem", { lineHeight: "1.2" }],
        "4xl": ["2.25rem", { lineHeight: "1.15" }],
      },
      borderColor: ({ theme }) => ({
        ...(theme("colors") as Record<string, string>),
        DEFAULT: palette.pixel,
      }),
      transitionDuration: { DEFAULT: "100ms" },
      transitionTimingFunction: { DEFAULT: "linear" },
      backgroundImage: {
        "dot-grid":
          "radial-gradient(rgba(219, 201, 249, 0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "8px 8px",
      },
    },
  },
  plugins: [],
};

export default config;
