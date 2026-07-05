import re

with open('app/globals.css', 'r') as f:
    content = f.read()

theme_block = """
@import "tailwindcss";

@theme {
  --breakpoint-xs: 475px;
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
  
  --color-primary: #055fac;
  --color-primary-dark: #044a8a;
  --color-primary-light: #1a6bb8;
  --color-secondary: #f47721;
  --color-secondary-dark: #d6651c;
  --color-secondary-light: #f68b42;
  --color-sky-blue: #055fac;
  --color-sky-blue-dark: #044a8a;
  --color-earth-green: #228B22;
  --color-earth-green-light: #32CD32;
  --color-sunrise-orange: #f47721;
  --color-sunrise-orange-light: #f68b42;
  --color-snow-white: #FFFAFA;
  --color-snow-white-light: #F8F8FF;
  
  --font-sans: "Inter", system-ui, sans-serif;
  --font-serif: "Playfair Display", "Georgia", serif;
  
  --animate-float: float 6s ease-in-out infinite;
  --animate-slide-up: slideUp 0.5s ease-out;
  --animate-fade-in: fadeIn 1s ease-out;
  --animate-zoom-in: zoomIn 20s ease-out infinite alternate;
  
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }
  @keyframes slideUp {
    0% { transform: translateY(100px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes zoomIn {
    0% { transform: scale(1); }
    100% { transform: scale(1.1); }
  }
  
  --blur-xs: 2px;
  
  --radius-none: 0;
  --radius-sm: 0;
  --radius: 0;
  --radius-md: 0;
  --radius-lg: 0;
  --radius-xl: 0;
  --radius-2xl: 0;
  --radius-3xl: 0;
  --radius-full: 9999px;
}
"""

content = re.sub(r'@tailwind base;\n@tailwind components;\n@tailwind utilities;', '', content)
# We also need to copy styles/layout-utilities.css or remove its import since it's probably missing or we can copy it later.
# Let's keep the import for now if it exists, or just remove it if we copy the content.

with open('app/globals.css', 'w') as f:
    f.write(theme_block + '\n' + content)
