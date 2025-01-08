/** @type {import('tailwindcss').Config} */
// const { shadcnPreset } = require("@shadcn/ui");
import shadcnPreset from "@shadcn/ui";

module.exports = {
  presets: [shadcnPreset],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}

