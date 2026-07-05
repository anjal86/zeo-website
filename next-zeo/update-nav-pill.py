import re

with open('src/components/Navigation/Navigation.tsx', 'r') as f:
    content = f.read()

# Update the navbar classes for a floating pill
nav_regex = r"className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out border-b \${isScrolled \? 'glass-nav text-gray-900' : 'bg-transparent border-transparent text-gray-800 hover:bg-white/50'}`}"
new_nav = "className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${isScrolled ? 'top-4 max-w-5xl mx-auto rounded-full glass-nav text-brand-dark' : 'bg-transparent border-transparent text-gray-800 hover:bg-white/50'}`}"
content = re.sub(nav_regex, new_nav, content)

with open('src/components/Navigation/Navigation.tsx', 'w') as f:
    f.write(content)
