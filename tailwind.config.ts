import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-rubik)", "sans-serif"],
      },
      colors: {
        edexGreen: "#27a55d",
      },
    },
  },
  plugins: [],
};
export default config;
