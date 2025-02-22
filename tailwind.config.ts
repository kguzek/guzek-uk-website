import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import tailwindAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            color: "inherit",
            a: {
              color: theme("colors.primary-strong"),
              textDecoration: "none",
              "@apply hover-underline": {},
            },
            p: { fontSize: "1.2rem", lineHeight: "1.8rem" },
            h1: { color: "inherit" },
            h2: { color: "inherit" },
            h3: { color: "inherit" },
            h4: { color: "inherit" },
            strong: { color: "inherit" },
            code: { color: "inherit" },
            blockquote: { color: "inherit" },
          },
        },
      }),
      colors: {
        primary: "#bbb",
        "primary-strong": "#fff",
        background: "#262322",
        "background-strong": "#0b0a09",
        "background-soft": "#5e5954",
        accent: "#2596be",
        "accent-soft": "#c9dae0",
        accent2: "#c9b86e",
        success: "#3dc983",
        error: "#b64949",
      },
      fontFamily: {
        sans: ["var(--font-raleway)"],
        serif: ["var(--font-roboto-slab)"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        jump: "jump 1s infinite",
      },
    },
  },
  plugins: [typography, tailwindAnimate],
};

export default config;
