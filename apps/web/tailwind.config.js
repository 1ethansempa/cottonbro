/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "#050505", // Deep Black
        "page-gradient": "#0A0A0A",
        glass: "rgba(255, 255, 255, 0.03)", // Dark Glass
        "glass-hover": "rgba(255, 255, 255, 0.08)",
        
        // Typography
        primary: "#FFFFFF", // White
        secondary: "#A1A1AA", // Zinc 400
        tertiary: "#52525B", // Zinc 600
        
        // Accents
        silver: "#E1E1E1", // Chrome Silver
        "chrome-hover": "#E4E4E7", // Zinc 200
        "neon-red": "#FF0000", // High Fashion Red (Warning/Tag)
        "neon-purple": "#A855F7",
        
        // Borders
        "border-subtle": "rgba(255, 255, 255, 0.1)",
        "border-glow": "rgba(255, 255, 255, 0.2)",
      },
      fontFamily: {
        urbanist: ["var(--font-urbanist)", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-glow": "conic-gradient(from 180deg at 50% 50%, #E4E4E7 0deg, #FFFFFF 180deg, #E4E4E7 360deg)",
        "spotlight": "radial-gradient(circle at 50% 0%, rgba(225, 225, 225, 0.08) 0%, transparent 50%)", // Silver spotlight on dark
        "chrome-mesh": "conic-gradient(at center top, #111, #333, #111)",
      },
      boxShadow: {
        "glow-silver": "0 0 40px -10px rgba(225,225,225,0.1)",
        "glow-red": "0 0 40px -10px rgba(255,59,48,0.3)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.05)",
        card: "0 1px 3px rgba(0,0,0,0.05)",
        "card-hover": "0 10px 40px rgba(0,0,0,0.08)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        }
      }
    },
  },
  plugins: [],
};
export default config;
