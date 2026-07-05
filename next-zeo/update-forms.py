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

replace_in_file('src/components/Tours/TourEnquiryButton.tsx', {
    'bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden': 'bg-white rounded-3xl shadow-soft overflow-hidden border border-slate-100',
    'text-gray-900': 'text-brand-dark',
    'bg-gray-50': 'bg-slate-50'
})

replace_in_file('src/components/Tours/TourEnquiryForm.tsx', {
    'bg-white rounded-2xl shadow-lg border border-gray-200': 'bg-white rounded-3xl shadow-soft border border-slate-100',
    'text-gray-900': 'text-brand-dark'
})
