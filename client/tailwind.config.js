/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {
      colors: {
        darkBack: "#37393F",
        darkBox: "#2E3036",
        selectBox: "#202225",
        navbar: "#4B4D52",
      },
    },
  },
  plugins: [],
};
