/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        'primary': '#055fac',
        'primary-dark': '#044a8a',
        'primary-light': '#1a6bb8',
        'secondary': '#f47721',
        'secondary-dark': '#d6651c',
        'secondary-light': '#f68b42',
        // Keep legacy colors for backward compatibility
        'sky-blue': '#055fac',
        'sky-blue-dark': '#044a8a',
        'earth-green': '#228B22',
        'earth-green-light': '#32CD32',
        'sunrise-orange': '#f47721',
        'sunrise-orange-light': '#f68b42',
        'snow-white': '#FFFAFA',
        'snow-white-light': '#F8F8FF',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'serif': ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 1s ease-out',
        'zoom-in': 'zoomIn 20s ease-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        zoomIn: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.1)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        'none': '0',
        'sm': '0',
        'DEFAULT': '0',
        'md': '0',
        'lg': '0',
        'xl': '0',
        '2xl': '0',
        '3xl': '0',
        'full': '9999px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
