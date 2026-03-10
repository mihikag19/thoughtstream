import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-lora)", "Georgia", "serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
      colors: {
        bg: {
          DEFAULT: "#0a0a0a",
          raised: "#111110",
          sidebar: "#0e0e0d",
        },
        text: {
          DEFAULT: "#e2e2e2",
          muted: "#555550",
          mid: "#8a8478",
          dim: "#2e2c28",
        },
        accent: {
          DEFAULT: "#c9a96e",
          dim: "rgba(201,169,110,0.08)",
          border: "rgba(201,169,110,0.18)",
          budding: "rgba(201,169,110,0.20)",
        },
        blue: {
          DEFAULT: "#7ba7c4",
          dim: "rgba(123,167,196,0.07)",
        },
        border: {
          DEFAULT: "#1c1c1a",
          mid: "#242420",
        },
      },
      spacing: {
        "8": "8px",
        "16": "16px",
        "24": "24px",
        "32": "32px",
        "40": "40px",
        "48": "48px",
        "64": "64px",
        "80": "80px",
        "96": "96px",
        "128": "128px",
      },
    },
  },
  plugins: [],
};
export default config;
