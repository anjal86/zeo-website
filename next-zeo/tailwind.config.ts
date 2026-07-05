import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    screens: {
      xs: "475px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        // Warm saffron/orange owns action, pilgrimage energy, active states and conversion moments.
        primary: "#c2410c",
        "primary-dark": "#9a3412",
        "primary-light": "#fbbf24",

        // Deep blue is reserved for trust, structure, navigation context and calm informational accents.
        secondary: "#0b6fb3",
        "secondary-dark": "#075985",
        "secondary-light": "#38bdf8",

        // Neutral foundation for premium travel calm and readable long-form sections.
        "brand-dark": "#0b1120",
        "brand-light": "#f8fafc",
        "brand-sand": "#fff7ed",
        "brand-gold": "#f59e0b",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-outfit)", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
      },
      boxShadow: {
        'soft': '0 4px 40px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 22px rgba(194, 65, 12, 0.18)',
      }
    },
  },
  plugins: [typography],
};

export default config;
