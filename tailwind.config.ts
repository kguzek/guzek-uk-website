import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
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
    },
  },
  plugins: [],
} satisfies Config;
