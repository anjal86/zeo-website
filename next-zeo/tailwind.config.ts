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
        primary: "#055fac",
        "primary-dark": "#044a8a",
        "primary-light": "#1a6bb8",
        secondary: "#f47721",
        "secondary-dark": "#d6651c",
        "secondary-light": "#f68b42",
        "sky-blue": "#055fac",
        "sky-blue-dark": "#044a8a",
        "earth-green": "#228B22",
        "earth-green-light": "#32CD32",
        "sunrise-orange": "#f47721",
        "sunrise-orange-light": "#f68b42",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
      },
    },
  },
  plugins: [typography],
};

export default config;
