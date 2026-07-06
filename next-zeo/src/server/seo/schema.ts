// Schema.org structured data utilities for SEO

type SchemaNode = {
  [key: string]: unknown;
  "@context"?: unknown;
  "@type"?: string | string[];
  name?: unknown;
  description?: unknown;
  image?: unknown;
  offers?: { price?: unknown };
  itemListElement?: Array<{ name?: unknown; item?: unknown }>;
};

const validateAndLogSchema = <T extends SchemaNode>(schema: T | null | undefined, schemaType: string): T | null | undefined => {
  const processEnv = typeof globalThis !== 'undefined' && 'process' in globalThis 
    ? (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process 
    : undefined;

  const isDev = processEnv 
    ? processEnv.env?.NODE_ENV !== 'production'
    : (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'));

  if (isDev && schema) {
    const warnings: string[] = [];

    if (!schema["@context"]) warnings.push("Missing '@context'");
    
    const actualType = schema["@type"];
    const typeMatches = Array.isArray(actualType) 
      ? actualType.includes(schemaType)
      : actualType === schemaType;

    if (!typeMatches) {
      warnings.push(`Expected @type '${schemaType}', got '${String(actualType)}'`);
    }

    if (schemaType === 'TouristTrip') {
      if (!schema.name) warnings.push("TouristTrip is missing a 'name'");
      if (!schema.description) warnings.push("TouristTrip is missing a 'description'");
      if (!schema.image) warnings.push("TouristTrip is missing an 'image'");
      if (schema.offers && schema.offers.price !== undefined) {
        const price = Number(schema.offers.price);
        if (isNaN(price) || price < 0) {
          warnings.push(`TouristTrip has an invalid price: '${String(schema.offers.price)}'`);
        }
      }
    }

    if (schemaType === 'TouristDestination') {
      if (!schema.name) warnings.push("TouristDestination is missing a 'name'");
      if (!schema.image) warnings.push("TouristDestination is missing an 'image'");
    }

    if (schemaType === 'TouristAttraction') {
      if (!schema.name) warnings.push("TouristAttraction is missing a 'name'");
    }

    if (schemaType === 'BreadcrumbList') {
      if (!schema.itemListElement || !schema.itemListElement.length) {
        warnings.push("BreadcrumbList has no items");
      } else {
        schema.itemListElement.forEach((item: { name?: unknown; item?: unknown }, i: number) => {
          if (!item.name) warnings.push(`Breadcrumb item at position ${i+1} is missing a name`);
          if (!item.item) warnings.push(`Breadcrumb item at position ${i+1} is missing an item/url`);
        });
      }
    }

    if (warnings.length > 0) {
      console.warn(`[JSON-LD Validator] Warnings for ${schemaType}:`, warnings, schema);
    }
  }
  return schema;
};

export const createOrganizationSchema = () => validateAndLogSchema({
  "@context": "https://schema.org",
  "@type": ["TravelAgency", "Organization"],
  "@id": `https://www.zeotourism.com/#organization`,
  name: "Zeo Tourism",
  url: `https://www.zeotourism.com`,
  logo: {
    "@type": "ImageObject",
    url: `https://www.zeotourism.com/logo/zeo-logo.png`,
    width: 280,
    height: 80
  },
  description: "Nepal's most trusted Kailash Mansarovar Yatra operator. Expert-guided sacred pilgrimages, inbound Nepal tours for Indian & NRI travelers, and outbound packages since 2000. Licensed by Nepal Tourism Board.",
  foundingDate: "2000",
  areaServed: ["Nepal", "India", "Tibet", "Bhutan", "NRI worldwide"],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Kailash Mansarovar Yatra & Nepal Tour Packages",
    itemListElement: [
      { "@type": "Offer", "itemOffered": { "@type": "Service", name: "Kailash Mansarovar Yatra" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", name: "Everest Base Camp Trek" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", name: "Annapurna Circuit Trek" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", name: "Nepal Inbound Tours for Indian Travelers" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", name: "Outbound Tours for Nepali Travelers" } }
    ]
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "Thamel, Kathmandu",
    addressLocality: "Kathmandu",
    addressRegion: "Bagmati Province",
    postalCode: "44600",
    addressCountry: "NP"
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+977-985-123-4567",
    email: "info@zeotourism.com",
    contactType: "customer service",
    availableLanguage: ["English", "Nepali", "Hindi"]
  },
  sameAs: [
    // Social
    "https://www.facebook.com/zeotourism",
    "https://www.instagram.com/zeotourism",
    "https://x.com/zeotourism",
    "https://www.youtube.com/@zeotourism",
    "https://www.linkedin.com/company/zeotourism",
    // Verified listing platforms
    "https://www.tripadvisor.com/Attraction_Review-g424934-d34077930-Reviews-Zeo_Tourism-Bhaktapur_Kathmandu_Valley_Bagmati_Zone_Central_Region.html",
    "https://www.viator.com/tours/Kathmandu/Kailash-Mansarovar-Yatra-12-Nights-13-Days/d5109-5624134P2",
    "https://www.getyourguide.com/zeo-tourism-pvt-ltd-s698713/",
    "https://www.overtheplanet.com/en-US/unique-experiences-with-kailash-mansarovar-yatra-12-nights-13-days.a966933",
    // Government / authority
    "https://trade.ntb.gov.np/nepal-the-best-heritage-destination/",
    // Google Maps (feeds Knowledge Graph directly)
    "https://maps.app.goo.gl/tkRv1ZRZ2Z5TnpRU9"
  ]
}, "TravelAgency");

export const createWebSiteSchema = () => validateAndLogSchema({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `https://www.zeotourism.com/#website`,
  name: "Zeo Tourism",
  url: `https://www.zeotourism.com`,
  description: "Discover Nepal with expert-guided adventures, cultural tours, and spiritual journeys. 25+ years of experience in travel planning.",
  publisher: {
    "@type": "Organization",
    "@id": `https://www.zeotourism.com/#organization`
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `https://www.zeotourism.com/search?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
}, "WebSite");

export const createBreadcrumbSchema = (breadcrumbs: Array<{ name: string; url: string }>) => validateAndLogSchema({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: breadcrumbs.map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.name,
    item: crumb.url
  }))
}, "BreadcrumbList");

export const createArticleSchema = (article: {
  title: string;
  description: string;
  author: string;
  publishDate: string;
  modifiedDate?: string;
  image: string;
  url: string;
  category: string;
  tags: string[];
}) => validateAndLogSchema({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "@id": `${article.url}#article`,
  headline: article.title,
  description: article.description,
  image: {
    "@type": "ImageObject",
    url: article.image
  },
  author: {
    "@type": "Organization",
    "@id": `https://www.zeotourism.com/#organization`,
    name: "Zeo Tourism"
  },
  publisher: {
    "@type": "Organization",
    "@id": `https://www.zeotourism.com/#organization`,
    name: "Zeo Tourism",
    logo: {
      "@type": "ImageObject",
      url: `https://www.zeotourism.com/logo/zeo-logo.png`
    }
  },
  datePublished: article.publishDate,
  dateModified: article.modifiedDate || article.publishDate,
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": article.url
  },
  articleSection: article.category,
  keywords: article.tags.join(", "),
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", "h2", ".article-summary", ".blog-post-content p:first-of-type"]
  }
}, "BlogPosting");

// Full TouristTrip schema — AI search engines recognise this far better than Product/Trip
export const createTouristTripSchema = (tour: {
  name: string;
  description: string;
  image: string;
  url: string;
  price: number;
  currency: string;
  category: string;
  duration?: string;
  location?: string;
  difficulty?: string;
  ratingValue?: number;
  reviewCount?: number;
  highlights?: string[];
}) => validateAndLogSchema({
  "@context": "https://schema.org",
  "@type": "TouristTrip",
  "@id": `${tour.url}#trip`,
  name: tour.name,
  description: tour.description,
  image: tour.image,
  url: tour.url,
  touristType: ["Adventure Traveler", "Cultural Traveler"],
  ...(tour.location && {
    locationCreated: {
      "@type": "Place",
      name: tour.location,
      containedInPlace: { 
        "@type": "Country", 
        name: tour.location.includes("Tibet") || tour.location.includes("China") ? "China" : 
              tour.location.includes("Dubai") || tour.location.includes("UAE") ? "UAE" :
              tour.location.includes("Vietnam") ? "Vietnam" :
              tour.location.includes("Thailand") ? "Thailand" :
              tour.location.includes("Bali") ? "Indonesia" :
              "Nepal" 
      }
    }
  }),
  ...(tour.duration && { duration: tour.duration }),
  ...(tour.price > 0 && {
    offers: {
      "@type": "Offer",
      price: tour.price,
      priceCurrency: tour.currency,
      availability: "https://schema.org/InStock",
      url: tour.url,
      seller: {
        "@type": "TravelAgency",
        "@id": `https://www.zeotourism.com/#organization`,
        name: "Zeo Tourism"
      }
    }
  }),
  provider: {
    "@type": "TravelAgency",
    "@id": `https://www.zeotourism.com/#organization`,
    name: "Zeo Tourism"
  },
  ...(tour.highlights && tour.highlights.length > 0 && {
    itinerary: {
      "@type": "ItemList",
      name: `${tour.name} Highlights`,
      itemListElement: tour.highlights.map((h, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: h
      }))
    }
  }),
  ...(tour.ratingValue && {
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: tour.ratingValue,
      reviewCount: tour.reviewCount || 10,
      bestRating: 5,
      worstRating: 1
    }
  }),
  keywords: [tour.category, "Nepal", "guided tour", tour.location || "", tour.difficulty || ""].filter(Boolean).join(", ")
}, "TouristTrip");

// Legacy alias — keeps existing callers working while using the richer TouristTrip schema
export const createProductSchema = (tour: {
  name: string;
  description: string;
  image: string;
  url: string;
  price: number;
  currency: string;
  category: string;
  ratingValue?: number;
  reviewCount?: number;
}) => createTouristTripSchema(tour);

export const createBlogListSchema = (posts: Array<{ title: string; url: string; date: string }>) => validateAndLogSchema({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Zeo Tourism Blog",
  itemListElement: posts.map((post, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: post.url,
    name: post.title
  }))
}, "ItemList");

export const createFAQSchema = (faqs: Array<{ question: string; answer: string }>) => validateAndLogSchema({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(faq => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer
    }
  }))
}, "FAQPage");

export const createAggregateRatingSchema = (ratings: number[]) => validateAndLogSchema({
  "@context": "https://schema.org",
  "@type": "AggregateRating",
  ratingValue: ratings.length ? Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10 : 0,
  reviewCount: ratings.length,
  bestRating: 5,
  worstRating: 1
}, "AggregateRating");

export const createTravelAgencySchema = (liveRating?: { ratingValue: number; reviewCount: number }) => validateAndLogSchema({
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  "@id": `https://www.zeotourism.com/#organization`,
  name: "Zeo Tourism",
  image: [
    `https://www.zeotourism.com/images/office-exterior.jpg`,
    `https://www.zeotourism.com/logo/zeo-logo.png`
  ],
  url: `https://www.zeotourism.com`,
  telephone: "+977-985-123-4567",
  email: "info@zeotourism.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Thamel, Kathmandu",
    addressLocality: "Kathmandu",
    addressRegion: "Bagmati Province",
    postalCode: "44600",
    addressCountry: "NP"
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 27.7172,
    longitude: 85.3240
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "18:00"
    }
  ],
  sameAs: [
    // Social
    "https://www.facebook.com/zeotourism",
    "https://www.instagram.com/zeotourism",
    "https://x.com/zeotourism",
    "https://www.youtube.com/@zeotourism",
    "https://www.linkedin.com/company/zeotourism",
    // Verified listing platforms
    "https://www.tripadvisor.com/Attraction_Review-g424934-d34077930-Reviews-Zeo_Tourism-Bhaktapur_Kathmandu_Valley_Bagmati_Zone_Central_Region.html",
    "https://www.viator.com/tours/Kathmandu/Kailash-Mansarovar-Yatra-12-Nights-13-Days/d5109-5624134P2",
    "https://www.getyourguide.com/zeo-tourism-pvt-ltd-s698713/",
    "https://www.overtheplanet.com/en-US/unique-experiences-with-kailash-mansarovar-yatra-12-nights-13-days.a966933",
    // Government / authority
    "https://trade.ntb.gov.np/nepal-the-best-heritage-destination/",
    // Google Maps (feeds Knowledge Graph directly)
    "https://maps.app.goo.gl/tkRv1ZRZ2Z5TnpRU9"
  ],
  priceRange: "$$",
  ...(liveRating && {
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: liveRating.ratingValue,
      reviewCount: liveRating.reviewCount,
      bestRating: 5,
      worstRating: 1
    }
  }),
  knowsAbout: [
    "Kailash Mansarovar Yatra",
    "Mount Kailash Pilgrimage",
    "Kailash Yatra from India",
    "Kailash Mansarovar Tour for NRI",
    "Nepal Inbound Tours for Indian Travelers",
    "Outbound Tours for Nepali Travelers",
    "Nepal Trekking",
    "Everest Base Camp Trek",
    "Annapurna Circuit Trek",
    "Nepal Cultural Tours",
    "Himalayan Pilgrimages",
    "Tibet Tours from Nepal"
  ]
}, "TravelAgency");

export const createTouristDestinationSchema = (destination: {
  name: string;
  description: string;
  country?: string;
  image: string;
  url: string;
  toursCount: number;
}) => validateAndLogSchema({
  "@context": "https://schema.org",
  "@type": "TouristDestination",
  "@id": `${destination.url}#destination`,
  name: destination.name,
  description: destination.description,
  image: destination.image,
  url: destination.url,
  containedInPlace: {
    "@type": "Country",
    name: destination.country || "Nepal"
  },
  touristType: ["Adventure Traveler", "Cultural Traveler", "Pilgrim"],
  ...(destination.toursCount > 0 && {
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `Tours in ${destination.name}`,
      itemListElement: [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            name: `${destination.name} Guided Travel Packages`
          }
        }
      ]
    }
  })
}, "TouristDestination");

export const createTouristAttractionSchema = (activity: {
  name: string;
  description: string;
  image: string;
  url: string;
  toursCount: number;
}) => validateAndLogSchema({
  "@context": "https://schema.org",
  "@type": "TouristAttraction",
  "@id": `${activity.url}#attraction`,
  name: activity.name,
  description: activity.description,
  image: activity.image,
  url: activity.url,
  touristType: ["Adventure Traveler", "Cultural Traveler", "Pilgrim"],
  ...(activity.toursCount > 0 && {
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${activity.name} Tours and Packages`,
      itemListElement: [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            name: `${activity.name} Organized Activities`
          }
        }
      ]
    }
  })
}, "TouristAttraction");
