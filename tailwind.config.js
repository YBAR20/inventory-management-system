/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#34495e",
        secondary: "#2c3e50",
        accent: "#1abc9c",
        danger: "#e74c3c",
        warning: "#f39c12",
        success: "#27ae60",
      }
    },
  },
  plugins: [],
}