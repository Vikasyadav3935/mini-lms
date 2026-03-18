/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./contexts/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Nunito-Regular"],
        "nunito-light": ["Nunito-Light"],
        "nunito-extralight": ["Nunito-ExtraLight"],
        "nunito-regular": ["Nunito-Regular"],
        "nunito-medium": ["Nunito-Medium"],
        "nunito-semibold": ["Nunito-SemiBold"],
        "nunito-bold": ["Nunito-Bold"],
        "nunito-extrabold": ["Nunito-ExtraBold"],
        "nunito-black": ["Nunito-Black"],
      },
      colors: {
        primary: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
        },
        surface: {
          DEFAULT: "#1E293B",
          secondary: "#0F172A",
          card: "#273549",
        },
      },
    },
  },
  plugins: [],
};
