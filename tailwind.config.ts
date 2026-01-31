import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // GhostInk dark theme
        ghost: {
          bg: "#0a0a0b",
          surface: "#141416",
          border: "#2a2a2e",
          text: "#e4e4e7",
          muted: "#71717a",
          accent: "#8b5cf6", // purple for Mask contributions
          ink: "#fafafa",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
