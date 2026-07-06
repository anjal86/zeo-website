import re

with open('src/components/Navigation/Navigation.tsx', 'r') as f:
    content = f.read()

# Replace the nav background classes
nav_regex = r"className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out border-b \${isScrolled\s*\?\s*'[^']+'\s*:\s*'[^']+'\s*}`}"
new_nav_classes = "className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out border-b ${isScrolled ? 'glass-nav text-gray-900' : 'bg-transparent border-transparent text-gray-800 hover:bg-white/50'}`}"

content = re.sub(nav_regex, new_nav_classes, content)

with open('src/components/Navigation/Navigation.tsx', 'w') as f:
    f.write(content)
