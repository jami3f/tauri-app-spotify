/** @type {import('tailwindcss').Config} */
module.exports = {
  content: {
    files: ["./index.html", "./src/**/*.{ts,tsx}"],
  },
  theme: {
    extend: {
      width: {
        120: "calc(100%+40px)",
      },
    },
  },
  plugins: [],
};
