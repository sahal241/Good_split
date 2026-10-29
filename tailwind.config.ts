import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#FAF7F2",
        surface: "#FFFFFF",
        accent: {
          DEFAULT: "#2D7D6F",
          light: "#E6F3F1",
          dark: "#1F5C52",
        },
        ink: "#1A1A1A",
        muted: "#6B7280",
        border: "#E5DDD4",
        danger: "#C0392B",
        "danger-light": "#FDECEA",
        positive: "#1A7F4E",
        "positive-light": "#E6F4EE",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.05)",
        modal: "0 20px 60px -10px rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
