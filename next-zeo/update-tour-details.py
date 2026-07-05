import re
import os

def replace_in_file(filepath, replacements):
    if not os.path.exists(filepath): return
    with open(filepath, 'r') as f:
        content = f.read()
    
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    with open(filepath, 'w') as f:
        f.write(content)

# Update TourHeader
replace_in_file('src/components/Tours/TourHeader.tsx', {
    'bg-gray-50 p-4 rounded-2xl text-center': 'bg-primary/5 p-4 rounded-2xl text-center shadow-sm',
    'text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6': 'font-heading text-4xl md:text-5xl lg:text-6xl font-semibold text-brand-dark mb-6',
    'text-gray-900': 'text-brand-dark',
    'text-sky-600': 'text-primary'
})

# Update TourTabs
replace_in_file('src/components/Tours/TourTabs.tsx', {
    'bg-white rounded-2xl shadow-sm p-6 sm:p-8 space-y-12': 'bg-white rounded-3xl shadow-soft p-6 sm:p-8 space-y-12',
    'text-2xl sm:text-3xl font-bold text-gray-900': 'font-heading text-2xl sm:text-3xl font-semibold text-brand-dark',
    'bg-white rounded-2xl border border-gray-200': 'bg-white rounded-2xl shadow-sm border border-slate-100',
    'text-sky-600': 'text-primary',
    'text-gray-900': 'text-brand-dark',
    'bg-gray-50': 'bg-slate-50'
})

# Update TourDetail
replace_in_file('src/components/Tours/TourDetail.tsx', {
    'bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden': 'bg-white rounded-3xl shadow-soft overflow-hidden',
    'text-2xl sm:text-3xl font-bold text-gray-900': 'font-heading text-3xl font-semibold text-brand-dark',
    'text-3xl font-bold text-gray-900': 'font-heading text-4xl font-semibold text-brand-dark',
    'text-gray-900': 'text-brand-dark',
    'text-lg font-bold': 'font-heading text-lg font-semibold'
})

# Update TourImageSlider
replace_in_file('src/components/Tours/TourImageSlider.tsx', {
    'bg-white rounded-2xl shadow-sm overflow-hidden': 'bg-white rounded-3xl shadow-soft overflow-hidden'
})
