module.exports = {
  presets: [require("foundation-design-system/tailwind.config")],
  content: [
    "./node_modules/foundation-design-system/**/*.js",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
};
