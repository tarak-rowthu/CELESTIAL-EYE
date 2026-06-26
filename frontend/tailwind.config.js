// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#7B61FF",
        secondary: "#00BFFF",
        background: "#050816",
        surface: "#0B1026",
        accent: "#FFFFFF"
      },
      backdropBlur: {
        xs: "2px"
      },
      glass: {
        DEFAULT: "rgba(255, 255, 255, 0.12)"
      }
    }
  },
  plugins: []
};
