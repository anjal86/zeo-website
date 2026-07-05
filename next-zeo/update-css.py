import re

with open('app/styles/layout-utilities.css', 'r') as f:
    content = f.read()

# Replace rounded-none with modern rounded corners
content = content.replace('rounded-none', 'rounded-2xl')
content = content.replace('.btn-primary {', '.btn-primary {\n  @apply shadow-md hover:shadow-xl hover:scale-[1.02];')
content = content.replace('.btn-accent {', '.btn-accent {\n  @apply shadow-md hover:shadow-xl hover:scale-[1.02];')

# Add glassmorphism utilities
glass_utils = """
/* Glassmorphism Utilities */
.glass-panel {
  @apply bg-white/80 backdrop-blur-md border border-white/40 shadow-lg rounded-2xl;
}

.glass-nav {
  @apply bg-white/90 backdrop-blur-lg border-b border-white/20 shadow-sm transition-all duration-300;
}

.glass-floating-bar {
  @apply bg-white/90 backdrop-blur-xl border-t border-white/40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)];
}
"""
content = content + glass_utils

with open('app/styles/layout-utilities.css', 'w') as f:
    f.write(content)
