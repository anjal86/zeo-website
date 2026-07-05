import os
import re

def update_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    new_content = content.replace('rounded-none', 'rounded-2xl')
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        return True
    return False

updated_files = []
for root, _, files in os.walk('src/components'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            if update_file(os.path.join(root, file)):
                updated_files.append(os.path.join(root, file))

print(f"Updated {len(updated_files)} files.")
