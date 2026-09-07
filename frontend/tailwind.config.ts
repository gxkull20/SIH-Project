import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#05070d",
          900: "#0a0e18",
          800: "#0f1524",
          700: "#161d33",
        },
        cyan: {
          accent: "#22d3ee",
        },
        amber: {
          accent: "#f59e0b",
        },
        critical: {
          accent: "#ef4444",
        },
        safe: {
          accent: "#22c55e",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
