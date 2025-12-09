module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/frontend/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
// ...exisiting code...
      colors: {
        // Premium Black Palette
        page: "#030303",  // Deepest black
        "page-gradient": "#0A0A0B", 
        
        // Glass & Surface
        glass: "rgba(255, 255, 255, 0.03)",
        "glass-hover": "rgba(255, 255, 255, 0.08)",
        "border-subtle": "rgba(255, 255, 255, 0.15)", // Increased visibility for chrome feel
        "border-glow": "rgba(255, 255, 255, 0.3)",
        "surface-gloss": "rgba(255, 255, 255, 0.08)",
        
        // Accents
        silver: "#E1E1E1",
        "chrome-hover": "#FFFFFF",
        "neon-red": "#FF3B30", // Kept for interaction pop
        
        // Text
        primary: "#FFFFFF",
        secondary: "#A1A1AA", // Zinc 400
        tertiary: "#52525B", // Zinc 600
        
        // Utility
        ink: "#0C0C0C",
      },
      boxShadow: {
        "glow-silver": "0 0 20px rgba(225, 225, 225, 0.15)",
        "glow-red": "0 0 20px rgba(255, 59, 48, 0.6)",
        "glow-subtle": "0 0 10px rgba(255, 255, 255, 0.05)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      fontFamily: {
        urbanist: ["var(--font-urbanist)", "sans-serif"],
        sans: ["var(--font-urbanist)", "sans-serif"],
      },
      backgroundImage: {
        "spotlight": "radial-gradient(circle at 50% 0%, rgba(225, 225, 225, 0.08) 0%, transparent 50%)", // Silver spotlight
        "chrome-mesh": "conic-gradient(from 180deg at 50% 50%, #1a1a1a 0deg, #000000 180deg, #333333 360deg)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
// ...existing code...
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
