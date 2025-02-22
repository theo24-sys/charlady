module.exports = {
    content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
    theme: {
      extend: {
        colors: {
          softPink: "#f9e1e6",
          warmPeach: "#ffccb3",
          pastelPurple: "#d9c2f0",
        },
      },
    },
  };
  /** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          softPink: "#f9e1e6",    // Gentle pink for backgrounds
          warmPeach: "#ffccb3",   // Warm accent color
          pastelPurple: "#d9c2f0", // Soft purple for headers/buttons
        },
        fontFamily: {
          poppins: ["Poppins", "sans-serif"], // A clean, friendly font
        },
      },
    },
    plugins: [],
  };