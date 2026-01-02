const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "#030303", // Softer Deep Black
        "page-gradient": "#080808",
        
        // Typography
        primary: "#FFFFFF",
        secondary: "#A1A1AA",
        tertiary: "#52525B",
        
        // Creative Lab Accents
        silver: "#E1E1E1", // Kept for generic structure
        
        // Primary & Secondary
        cyan: "#93C5FD", // Primary Accent - Glacier Blue (was Electric Cyan)
        "cyan-bold": "#3B82F6", // Darker Blue for Light Mode Text/Contrast
        graphite: "#6B7280", // Secondary - Cool Neutral Gray
        
        "neon-red": "#FF2E2E", // Errors/Urgency only
        
        // Borders
        "border-subtle": "rgba(255, 255, 255, 0.08)",
        "border-glow": "rgba(255, 255, 255, 0.15)",
      },
      fontFamily: {
        urbanist: ["var(--font-urbanist)", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "page-gradient": "linear-gradient(to bottom, #050505, #000000)",
      },
      boxShadow: {
        "glow-cyan": "0 0 20px -5px rgba(147, 197, 253, 0.25)", // Reduced glow intensity for Glacier Blue
        "card": "0 1px 3px rgba(0,0,0,0.05)",
        "card-hover": "0 10px 40px rgba(0,0,0,0.08)",
      },
      animation: {
        "shimmer": "shimmer 2.5s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "100% 0" },
          "100%": { backgroundPosition: "-100% 0" },
        }
      }
    },
  },
  plugins: [],
};
export default config;
