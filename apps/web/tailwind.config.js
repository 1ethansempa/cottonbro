const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "#FFFFFF", // Clean White
        "page-gradient": "#FAFAFA",

        // Typography
        primary: "#171717", // Neutral-900 Deep Black
        secondary: "#52525B", // Zinc-600 Dark Gray
        tertiary: "#A1A1AA",

        // Creative Lab Accents
        silver: "#F4F4F5", // Zinc-100 Light Gray

        // Primary & Secondary
        cyan: "#2563EB", // Cobalt Blue (Primary Brand)
        "cyan-bold": "#1D4ED8", // Darker Blue
        graphite: "#E4E4E7", // Zinc-200

        "neon-red": "#EF4444",

        // Borders
        "border-subtle": "rgba(0, 0, 0, 0.05)",
        "border-glow": "rgba(37, 99, 235, 0.1)",
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
        "glow-cyan": "0 0 25px -5px rgba(37, 99, 235, 0.15)", // Soft Blue Shadow
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
