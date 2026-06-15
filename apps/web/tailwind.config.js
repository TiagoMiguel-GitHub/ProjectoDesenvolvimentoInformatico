/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#f0faf4",
          100: "#dcf5e7",
          200: "#bbead0",
          300: "#86d5af",
          400: "#4db88a",
          500: "#2d6a4f",
          600: "#255c44",
          700: "#1e4d39",
          800: "#183d2d",
          900: "#122e22",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
