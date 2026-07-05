import re

with open('src/components/Tours/TourDetail.tsx', 'r') as f:
    content = f.read()

# Replace bg-gray-50 with a gentle gradient for section backgrounds
content = content.replace('bg-gray-50', 'bg-gradient-to-b from-slate-50 to-white')

# Replace rounded-none with rounded-2xl
content = content.replace('rounded-none', 'rounded-2xl')

# Add subtle borders to the accordion boxes
content = content.replace('bg-white rounded-2xl shadow-sm overflow-hidden', 'bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden')

# Update mobile floating bar
floating_bar_regex = r"className=\"bg-white border-t border-gray-200 shadow-lg\""
new_floating_bar = 'className="glass-floating-bar"'
content = re.sub(floating_bar_regex, new_floating_bar, content)

with open('src/components/Tours/TourDetail.tsx', 'w') as f:
    f.write(content)
