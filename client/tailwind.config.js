/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        paper: "#f8fbff",
        primary: "#2563eb"
      },
      boxShadow: {
        panel: "0 22px 70px rgba(37, 99, 235, 0.18)"
      }
    }
  },
  plugins: []
};
