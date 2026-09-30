/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        garden: {
          bg: "#0f1f16",
          soil: "#3b2a1f",
          leaf: "#4ade80",
          leafDark: "#16a34a",
          sky: "#dcfce7",
          gold: "#facc15",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "sans-serif"],
      },
      keyframes: {
        sway: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        floatUp: {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(-40px)", opacity: "0" },
        },
        pop: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "60%": { transform: "scale(1.05)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        sway: "sway 4s ease-in-out infinite",
        floatUp: "floatUp 1.2s ease-out forwards",
        pop: "pop 0.5s ease-out",
      },
    },
  },
  plugins: [],
};
