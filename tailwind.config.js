/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // fontFamily: {
      //   main: ["New Amsterdam"],
      //   title: ["Oswald", "sans-serif"], // Define the font family directly
      // },
      fontSize: {
        responsive: "clamp(0.5rem, 1rem, 0.7rem)",
      },
      screens: {
        smX: "840px",
        lgx: "1140px", // Custom breakpoint for screens >= 1440px
      },
      // No need to define fontWeight here for the title specifically
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".font-title": {
          fontFamily: "Bebas Neue, sans-serif",
          fontWeight: "400",
          // textTransform: "uppercase",
          color: "white",
        },
        ".font-banner": {
          fontFamily: "Bebas Neue, sans-serif",
          fontWeight: "400", // Default weight to 400
          // textTransform: "uppercase",
          color: "#D4DE95",
        },
        ".bg-primary": {
          backgroundColor: "#BAC095",
        },
        ".bg-secondary": {
          backgroundColor: "#636B2F",
        },
      };

      addUtilities(newUtilities);
    },
  ],
};
