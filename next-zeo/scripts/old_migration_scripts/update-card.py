import re

with open('src/components/Tours/TourCard.tsx', 'r') as f:
    content = f.read()

# Make grid variant more luxurious
grid_regex = r'className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer group w-full h-full flex flex-col border border-gray-100"'
new_grid = 'className="bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-glow transition-all duration-500 cursor-pointer group w-full h-full flex flex-col"'
content = content.replace(grid_regex, new_grid)

# Make list variant more luxurious
list_regex = r'className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group w-full border border-gray-100"'
new_list = 'className="bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-glow transition-all duration-500 cursor-pointer group w-full"'
content = content.replace(list_regex, new_list)

# Upgrade typography for titles
content = content.replace('text-2xl font-bold text-gray-900', 'font-heading text-2xl font-semibold text-brand-dark')
content = content.replace('text-xl font-bold text-gray-900', 'font-heading text-xl font-semibold text-brand-dark')
content = content.replace('text-gray-900', 'text-brand-dark')
content = content.replace('text-sky-600', 'text-primary')
content = content.replace('bg-sky-50', 'bg-primary/10')
content = content.replace('text-sky-500', 'text-primary')

with open('src/components/Tours/TourCard.tsx', 'w') as f:
    f.write(content)
