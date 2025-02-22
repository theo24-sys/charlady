module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}", // Add this if using `app` directory
  ],
  theme: {
    extend: {
      colors: {
        softPink: "#f9e1e6",
        warmPeach: "#ffccb3",
        pastelPurple: "#d9c2f0",
      },
    },
  },
  plugins: [],
};
