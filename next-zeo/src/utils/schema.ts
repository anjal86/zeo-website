// utils/schema.ts - re-exports from server/seo/schema for use in client components
// NOTE: these are plain data functions (no DB access), safe for client use
export {
  createOrganizationSchema,
  createBreadcrumbSchema,
  createTouristTripSchema,
  createTravelAgencySchema,
  createWebSiteSchema,
  createArticleSchema,
  createFAQSchema,
  createTouristDestinationSchema,
  createTouristAttractionSchema,
  createProductSchema,
  createBlogListSchema,
  createAggregateRatingSchema,
} from '../server/seo/schema';
