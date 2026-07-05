import re

with open('../zeopwebsite/src/pages/Home.tsx', 'r') as f:
    content = f.read()

# Replace React Router Link with Next.js Link
content = content.replace("import { Link } from 'react-router-dom';", "import Link from 'next/link';")
content = content.replace("to=\"", "href=\"")

# Remove SEO import and usage
content = re.sub(r'import SEO from [^\n]+\n', '', content)
content = re.sub(r'<SEO\s+title=[^>]+>\s*</SEO>', '', content)
content = re.sub(r'<SEO\s+title=[^/>]+/>', '', content)

# Adjust path imports from '../' to '@/src/' or './src/'
# Wait, if we put it in app/page.tsx, components are in src/
content = content.replace("from '../components/", "from '@/src/components/")
content = content.replace("from '../hooks/", "from '@/src/hooks/")
content = content.replace("from '../utils/", "from '@/src/utils/")

# Add "use client" at the top
content = '"use client";\n\n' + content

with open('app/page.tsx', 'w') as f:
    f.write(content)
