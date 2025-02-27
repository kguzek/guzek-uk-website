import type { Config } from "tailwindcss";
import tailwindGlow from "@codaworks/react-glow/tailwind";
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
        primary: "var(--color-primary)",
        "primary-strong": "var(--color-primary-strong)",
        background: "var(--color-background)",
        "background-strong": "var(--color-background-strong)",
        "background-soft": "var(--color-background-soft)",
        accent: "var(--color-accent)",
        "accent-soft": "var(--color-accent-soft)",
        accent2: "var(--color-accent2)",
        success: "var(--color-success)",
        error: "var(--color-error)",
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
      backgroundImage: {
        "gradient-main":
          "radial-gradient(circle at bottom, hsl(195 2 13) 0%, hsl(195 2 9) 20%, transparent 100%)",
      },
    },
  },
  plugins: [typography, tailwindAnimate, tailwindGlow],
};

export default config;
