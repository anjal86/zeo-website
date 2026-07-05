with open('tailwind.config.ts', 'r') as f:
    content = f.read()

# Update fonts and colors
new_tailwind = """import type { Config } from "tailwindcss";
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
        primary: "#0ea5e9", // vibrant sky blue
        "primary-dark": "#0284c7",
        "primary-light": "#38bdf8",
        secondary: "#f97316", // vibrant orange
        "secondary-dark": "#ea580c",
        "secondary-light": "#fb923c",
        "brand-dark": "#0f172a", // deep slate for luxury text
        "brand-light": "#f8fafc", // off white background
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-outfit)", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
      },
      boxShadow: {
        'soft': '0 4px 40px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 20px rgba(14, 165, 233, 0.15)',
      }
    },
  },
  plugins: [typography],
};

export default config;
"""

with open('tailwind.config.ts', 'w') as f:
    f.write(new_tailwind)
