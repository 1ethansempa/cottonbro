const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "#FFFFFF",
        "page-gradient": "#FAFAFA",

        // Brutalist / Swiss Theme Colors
        brand: {
          black: "#111111",
          red: "#e60000",
          gray: "#e5e5e5",
          offwhite: "#f5f5f5",
        },

        primary: "#111111",
        secondary: "#52525B",
        tertiary: "#A1A1AA",
        accent: "#e60000",

        // Borders
        "border-subtle": "rgba(0, 0, 0, 0.05)",
        "border-glow": "rgba(230, 0, 0, 0.1)",
      },
      fontFamily: {
        urbanist: ["var(--font-urbanist)", "sans-serif"],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "page-gradient": "linear-gradient(to bottom, #FFFFFF, #FAFAFA)",
      },
      boxShadow: {
        "glow-accent": "0 0 25px -5px rgba(230, 0, 0, 0.15)", // Soft Red Shadow
        card: "0 2px 8px rgba(0,0,0,0.04)",
        "card-hover": "0 12px 24px rgba(0,0,0,0.06)",
      },
      animation: {
        shimmer: "shimmer 2.5s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "100% 0" },
          "100%": { backgroundPosition: "-100% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
