/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0C0C0C", // page background
        onyx: "#121212", // dark panels
        graphite: "#1B1B1B", // cards on dark
        cream: "#F6F0E6", // paper surfaces
        bone: "#EDE6DA", // lines on cream
        slatey: "#A6A6A6", // muted copy on dark
      },
      boxShadow: {
        subtle:
          "0 0.5px 0.5px rgba(0,0,0,0.08), 0 6px 18px -8px rgba(0,0,0,0.35)",
        insetSoft:
          "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.06)",
      },
      borderColor: {
        hair: "#2A2A2A", // hairline on dark
        paperhair: "#E6DECF", // hairline on cream
      },
      letterSpacing: {
        tightish: "-0.01em",
        label: "0.14em",
      },
    },
  },
  plugins: [],
};
