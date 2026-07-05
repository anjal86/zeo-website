import re

with open('zeopwebsite/src/pages/TourDetail.tsx', 'r') as f:
    content = f.read()

# Replace imports
content = content.replace("import { useParams, Link, useNavigate } from 'react-router-dom';", 
                          "import { useRouter } from 'next/navigation';\nimport Link from 'next/link';")
content = content.replace("import SEO from '../components/SEO/SEO';", "")
content = content.replace("import Breadcrumb from '../components/UI/Breadcrumb';", "import Breadcrumb from '@/components/UI/Breadcrumb';")
content = content.replace("import { createTouristTripSchema, createBreadcrumbSchema, createFAQSchema } from '../utils/schema';", "")

# Fix components path aliases
content = content.replace("../components/", "@/components/")
content = content.replace("../hooks/", "@/hooks/")
content = content.replace("../services/", "@/services/")
content = content.replace("../utils/", "@/utils/")

# Replace component signature and hooks
content = content.replace("const TourDetail: React.FC = () => {", 
                          "const TourDetail: React.FC<{ tour: TourDetails }> = ({ tour }) => {")

# Remove tourSlug and useNavigate
content = re.sub(r'const \{ tourSlug \} = useParams<\{ tourSlug: string \}>\(\);\s*const navigate = useNavigate\(\);', 
                 'const router = useRouter();', content)

# Remove tour fetching logic (tourDetails state and fetchTourDetails)
fetch_regex = r'const \[tourDetails, setTourDetails\].*?useEffect\(\(\) => \{.*?\}, \[tour\]\);'
content = re.sub(fetch_regex, 'const tourDetails = tour;\n  const detailsLoading = false;', content, flags=re.DOTALL)

# Remove 'const tour = allTours?.find(t => t.slug === tourSlug);'
content = re.sub(r'const tour = allTours\?\.find\(t => t\.slug === tourSlug\);', '', content)

# Update `navigate` to `router.push`
content = content.replace("navigate(`/tours/${tour.slug}`)", "router.push(`/tours/${tour.slug}`)")

# Remove SEO block and structuredData logic
content = re.sub(r'const structuredData = useMemo\(\(\) => \{.*?\}, \[tourDetails, primaryDestination\]\);', '', content, flags=re.DOTALL)

# Remove SEO component rendering
seo_render_regex = r'<SEO\s+title=[^>]+structuredData=\{structuredData\}\s+/>'
content = re.sub(seo_render_regex, '', content, flags=re.DOTALL)

# Ensure <SEO ... /> is fully gone if regex missed some formatting
content = re.sub(r'<SEO[^>]*/>', '', content, flags=re.DOTALL | re.IGNORECASE)

# Fix API base URL helper function to just use /api since Next.js proxy/API routes are on same domain
content = re.sub(r'// API base URL helper function.*?};\n', '', content, flags=re.DOTALL)

with open('next-zeo/src/components/Tours/TourDetail.tsx', 'w') as f:
    f.write(content)
