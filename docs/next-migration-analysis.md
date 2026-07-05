# Zeo Website Next.js + MySQL VPS Migration Analysis

Status: analysis-first, no application code migrated yet.

Source repo: `anjal86/zeo-website`
Local path: `/Users/shrestha/Brandspire Work/zeo new project/zeopwebsite-new`
Remote HEAD observed: `37c1bddbc4c57a52272d0ecf23e9366b987f3d3b`

## Executive Summary

Current app is a Vite React SPA in `zeopwebsite/` backed by an Express JSON API in `api/server.js`. It is deployed with Vercel-oriented rewrites, custom sitemap/static prerender scripts, JSON data files, local/Vercel Blob media workarounds, and JWT stored in browser `localStorage` for admin auth.

Target migration should create `next-zeo/` beside existing app. Do not destroy current app until feature parity is verified. New target: Next.js App Router, TypeScript, Tailwind, MySQL 8, repository layer, HTTP-only admin sessions, durable uploads, native metadata/sitemap/robots, PM2 + Nginx + MySQL deployment.

Biggest risks:
- SEO-critical pages currently rely on SPA + custom prerender. Next migration must server-render public money pages.
- Auth has production fallbacks: default JWT secret/admin email/password possible.
- Admin trust starts from `localStorage`, no `/api/admin/me` verification.
- Uploads mix local `/tmp`, local `api/uploads`, private Vercel Blob URLs, and blob proxy redirects.
- Existing MySQL schema/migration is incomplete and inconsistent with app fields.
- `api/data` has duplicate nested `api/data/data`, backups, generated deploy bundles, and live JSON.

## Current Architecture

### Root

- `package.json`: only `@vercel/speed-insights`.
- `vercel.json`: builds `zeopwebsite`, copies `dist` to root `dist`, installs `zeopwebsite` and `api`, rewrites `/api/*` and `/uploads/*` to `/api/server`, rewrites all other paths to `/index.html`.
- `schema.sql`: partial MySQL schema, not production-ready for current CMS.
- `docker-compose.yml`: local MySQL/phpMyAdmin support.
- `DEPLOYMENT_GUIDE.md`: old cPanel/MySQL guide, not VPS/Next-oriented.
- `HOSTING_CONFIGURATION_FIX.md`: explains root domain serving API by mistake.

### Frontend

- `zeopwebsite/`: Vite + React 19 + React Router 7 + Tailwind.
- Entry: `zeopwebsite/src/main.tsx` wraps `App` in `HelmetProvider`.
- Router/layout: `zeopwebsite/src/App.tsx`.
- SEO: `react-helmet-async` in `components/SEO/SEO.tsx`, schema helpers in `utils/schema.ts`, plus `scripts/prerenderStatic.cjs`.
- API client: `src/services/api.ts` computes `/api` base from browser `window.location`.
- Hooks: `src/hooks/useApi.ts` and `useAdminApi` fetch in client components.

### Backend

- `api/server.js`: single Express app, JSON file persistence, partial DB routes, upload handling, auth, sitemap regeneration side effects.
- `api/database.js`: mysql2 pool helper, but table helpers are partial.
- `api/data/*.json`: current CMS data source.
- `api/data/tour-details/*.json`: separate detailed tour files.
- `api/blob-map.json`, `upload-all-to-blob.mjs`, `upload-videos-to-blob.mjs`: Vercel Blob migration artifacts.

## Public Routes

From `zeopwebsite/src/App.tsx`:

| Current route | Page | Next route |
|---|---|---|
| `/` | `Home` | `next-zeo/app/page.tsx` |
| `/destinations` | `Destinations` | `app/destinations/page.tsx` |
| `/destinations/:destinationName` | `DestinationDetail` | `app/destinations/[slug]/page.tsx` |
| `/tours` | `Tours` | `app/tours/page.tsx` |
| `/tours/:tourSlug` | `TourDetail` | `app/tours/[slug]/page.tsx` |
| `/activities` | `Activities` | `app/activities/page.tsx` |
| `/activities/:activityName` | `ActivityDetail` | `app/activities/[slug]/page.tsx` |
| `/kailash-mansarovar` | `KailashMansarovar` | `app/kailash-mansarovar/page.tsx` |
| `/kailash-mansarovar-yatra-guide` | `KailashGuide` | same path |
| `/kailash-mansarovar-yatra-cost` | `KailashCostGuide` | same path |
| `/kailash-mansarovar-yatra-documents-permits` | `KailashDocumentsGuide` | same path |
| `/kailash-yatra-nri-guide` | `NRIGuide` | same path |
| `/kailash-packing-list` | `KailashPackingList` | same path |
| `/kailash-fitness-medical-guide` | `KailashMedicalGuide` | same path |
| `/kailash-inner-kora-guide` | `KailashInnerKora` | same path |
| `/everest-base-camp-guide` | `EverestGuide` | same path |
| `/nepal-visa-guide` | `NepalVisaGuide` | same path |
| `/best-time-to-visit-nepal` | `BestTimeToVisitNepal` | same path |
| `/about` | `About` | same path |
| `/contact` | `Contact` | same path |
| `/privacy-policy` | `PrivacyPolicy` | same path |
| `/blog` | `Blog` | `app/blog/page.tsx` |
| `/blog/:slug` | `BlogPost` | `app/blog/[slug]/page.tsx` |
| `*` | `NotFound` | `app/not-found.tsx` |

SEO-critical pages: home, tours, tour detail, destinations, destination detail, activities, activity detail, blog, blog detail, all Kailash guide pages, Everest guide, Nepal visa guide, best time guide, about, contact.

Server Component priority:
- Public list/detail pages should fetch MySQL directly in server code.
- `generateMetadata` needed per static/dynamic page.
- Client Components only for motion, sliders, modals, forms, search, rich editor, admin UI, browser APIs.

## Admin Routes

From `App.tsx`:

| Current route | Current page | Next route |
|---|---|---|
| `/admin/login` | `AdminLogin` | `app/admin/login/page.tsx` |
| `/admin/dashboard` | `AdminDashboard` | `app/admin/dashboard/page.tsx` |
| `/admin/tours/new` | `TourEditor` | `app/admin/tours/new/page.tsx` |
| `/admin/tours/:tourSlug` | `TourEditor` | `app/admin/tours/[slug]/page.tsx` |
| `/admin/blog/new` | `BlogEditor` | `app/admin/blog/new/page.tsx` |
| `/admin/blog/edit/:id` | `BlogEditor` | `app/admin/blog/edit/[id]/page.tsx` |

Dashboard tabs map to CMS managers:
- overview
- destinations
- tours
- activities
- sliders
- kailash-gallery
- enquiries
- testimonials
- blog
- director
- team
- leads
- settings/contact/logos

Admin must become protected layout with server session check. Add `/api/admin/me` and middleware/layout redirect. Avoid localStorage auth as final state.

## API Routes

Extracted from `api/server.js`:

### Public

- `GET /api/health`
- `GET /api/server`
- `GET /`
- `GET /api/sliders`
- `GET /api/posts`
- `GET /api/posts/:slug`
- `GET /api/director-message`
- `GET /api/team`
- `GET /api/tours`
- `GET /api/tours/:id`
- `GET /api/tours/slug/:slug`
- `GET /api/destinations`
- `GET /api/destinations/:slug`
- `GET /api/activities`
- `GET /api/activities/:id`
- `POST /api/leads`
- `POST /api/contact/enquiry`
- `GET /api/contact`
- `GET /api/testimonials`
- `GET /api/testimonials/:id`
- `POST /api/testimonials`
- `GET /api/logos`
- `GET /api/kailash-gallery`
- `GET /api/blob`
- `POST /api/newsletter/subscribe`

### Auth/Admin

- `POST /api/auth/login`
- `GET /api/admin/sliders`
- `POST /api/admin/sliders`
- `PUT /api/admin/sliders/:id`
- `DELETE /api/admin/sliders/:id`
- `GET /api/admin/posts/:id`
- `POST /api/admin/posts`
- `PUT /api/admin/posts/:id`
- `DELETE /api/admin/posts/:id`
- `PUT /api/admin/director-message`
- `POST /api/admin/team`
- `PUT /api/admin/team/:id`
- `DELETE /api/admin/team/:id`
- `PUT /api/admin/team/order`
- `GET /api/admin/tours/export`
- `GET /api/admin/tours/:id/export`
- `GET /api/admin/tours`
- `POST /api/admin/tours`
- `PUT /api/admin/tours/:id`
- `DELETE /api/admin/tours/:id`
- `PATCH /api/admin/tours/:id/listing`
- `GET /api/admin/tours/slug/:slug`
- `GET /api/admin/activities`
- `POST /api/admin/activities`
- `PUT /api/admin/activities/:id`
- `DELETE /api/admin/activities/:id`
- `GET /api/admin/destinations`
- `GET /api/admin/destinations/:identifier`
- `POST /api/admin/destinations`
- `PUT /api/admin/destinations/:identifier`
- `DELETE /api/admin/destinations/:identifier`
- `GET /api/admin/leads`
- `PUT /api/admin/leads/:id`
- `DELETE /api/admin/leads/:id`
- `GET /api/admin/enquiries`
- `GET /api/admin/enquiries/:id`
- `PUT /api/admin/enquiries/:id`
- `DELETE /api/admin/enquiries/:id`
- `POST /api/admin/upload`
- `POST /api/admin/uploads/destinations`
- `POST /api/admin/uploads/tours`
- `PUT /api/admin/contact`
- `GET /api/admin/testimonials`
- `PUT /api/admin/testimonials/:id`
- `DELETE /api/admin/testimonials/:id`
- `PATCH /api/admin/testimonials/:id/approve`
- `PATCH /api/admin/testimonials/:id/featured`
- `GET /api/admin/logos`
- `POST /api/admin/logos/upload`
- `PUT /api/admin/logos`
- `DELETE /api/admin/logos/:type`
- `GET /api/admin/kailash-gallery`
- `POST /api/admin/kailash-gallery`
- `DELETE /api/admin/kailash-gallery/:id`
- `DELETE /api/admin/tours/:tourId/gallery/:filename`
- `GET /api/admin/newsletter`

### Partial DB Routes To Remove/Consolidate

- `GET /api/db/tours`
- `GET /api/db/tours/:slug`
- `GET /api/db/destinations`
- `GET /api/db/destinations/:slug`
- `POST /api/db/enquiries`
- `GET /api/db/admin/tours`
- `POST /api/db/admin/tours`
- `PUT /api/db/admin/tours/:id`
- `DELETE /api/db/admin/tours/:id`
- `GET /api/db/admin/enquiries`
- `PUT /api/db/admin/enquiries/:id`

Next route handlers should preserve public/admin compatibility where practical, but remove `/api/db/*` as internal migration-only unless backward compatibility is required.

## Current Data Sources

Live JSON files:

| File | Shape |
|---|---|
| `api/data/tours.json` | array, 28 tours |
| `api/data/tour-details/*.json` | 13 detailed tour files |
| `api/data/destinations.json` | array, 18 destinations |
| `api/data/activities.json` | array, 11 activities |
| `api/data/posts.json` | object with `posts` |
| `api/data/sliders.json` | array, 4 sliders |
| `api/data/testimonials.json` | array, 10 testimonials |
| `api/data/contact.json` | company/contact/business/social/legal |
| `api/data/enquiries.json` | object with `enquiries` |
| `api/data/leads.json` | object with `leads` |
| `api/data/team.json` | array, currently 0 |
| `api/data/logos.json` | header/footer/lastUpdated |
| `api/data/director-message.json` | name/title/message/image |
| `api/data/kailash-gallery.json` | gallery + metadata |
| `api/data/trip-plans.json` | object with `tripPlans` |
| `api/data/users.json` | object with `users` |

Duplicate/stale data:
- `api/data/data/*` mirrors many files and should not be treated as canonical without comparison.
- `deployment-code-only/` and `serverfiles/` are deploy artifacts and should not drive Next source.
- Backup files under `api/data/backups` should not import into MySQL except explicit restore.

## CMS Entities To Preserve

- tours
- tour details
- destinations
- activities
- sliders
- blog posts
- testimonials
- contact settings
- enquiries
- leads
- team members
- logos
- director message
- Kailash gallery
- newsletter subscribers
- users/admin users
- trip planner submissions

## MySQL Schema Target

Create under `next-zeo/src/server/db/`:

- `schema.sql`
- `migrations/001_initial_schema.sql`
- `migrations/002_indexes_fulltext.sql` if separated
- migration runner table: `schema_migrations`

Tables:

- `admin_users`
- `destinations`
- `activities`
- `tours`
- `tour_destinations`
- `tour_activities`
- `sliders`
- `posts`
- `testimonials`
- `contact_settings`
- `enquiries`
- `leads`
- `team_members`
- `logos`
- `director_message`
- `kailash_gallery`
- `newsletter_subscribers`
- `uploaded_files`

Important patterns:

- Preserve current response shape with JSON columns: `gallery`, `highlights`, `inclusions`, `exclusions`, `itinerary`, `tags`, `seo`, `metadata`, `social`, `weather`, `accommodation`, `transportation`, `permits_required`, `meta`.
- Use relational tables for tour-destination and tour-activity relations.
- Unique indexes: slugs, admin email, newsletter email, post slug.
- Status indexes: `listed`, `featured`, `is_active`, `status`, `is_approved`, `is_featured`.
- Date indexes: `created_at`, `updated_at`, `published_at`.
- Fulltext indexes: tour `title/description/location`, post `title/excerpt/content`, destination/activity `name/description`.
- All writes parameterized, multi-table tour writes inside transactions.

Existing `schema.sql` is not enough: it lacks required tables, has mismatched columns used by `migrate-json-to-mysql.js`, and uses a generic `site_content` table where the requested target needs first-class tables.

## Repository Layer Target

Under `next-zeo/src/server/repositories`:

- `admin-users.repository.ts`
- `tours.repository.ts`
- `destinations.repository.ts`
- `activities.repository.ts`
- `posts.repository.ts`
- `sliders.repository.ts`
- `testimonials.repository.ts`
- `contact-settings.repository.ts`
- `enquiries.repository.ts`
- `leads.repository.ts`
- `team.repository.ts`
- `logos.repository.ts`
- `kailash-gallery.repository.ts`
- `newsletter.repository.ts`
- `uploaded-files.repository.ts`

Shared utilities:

- `src/server/db/mysql.ts`: `pool`, `query`, `getOne`, `getAll`, `execute`, `transaction`, `testConnection`.
- `src/server/db/json.ts`: safe parse/stringify for JSON columns.
- `src/server/http/api-response.ts`: typed JSON success/error.
- `src/server/http/pagination.ts`.
- `src/server/auth/session.ts`.
- `src/server/auth/rate-limit.ts`.
- `src/server/storage/storage-service.ts`.

## Auth Migration

Current:
- `POST /api/auth/login` checks env admin email/password or defaults.
- JWT secret can fall back to `zeo-tourism-admin-secret-key-2024`.
- Admin dashboard only checks `localStorage.adminToken` and `localStorage.adminUser`.
- No `/api/admin/me`.

Target:
- `admin_users` table with bcrypt password hash.
- Script: `npm run admin:create` from `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- Login validates MySQL user and returns HTTP-only secure cookie.
- Add `/api/admin/me`.
- Use server-side admin layout protection.
- Rate limit login by IP/email. In-memory acceptable for single-node MVP, but DB/Redis better.
- Production fail-fast if required envs missing.
- No default admin credentials in production.

## Upload/Storage Migration

Current:
- Local mode uses `api/uploads`.
- Vercel mode uses `/tmp/zeop-uploads`.
- Vercel Blob scripts and private blob URLs exist.
- Express proxies `/uploads` and `/api/uploads`.
- Sharp compresses images to WebP. ffmpeg compresses videos.

Target:
- `STORAGE_DRIVER=local|s3`.
- Local VPS upload root: `/var/www/zeo/uploads`.
- Nginx serves `/uploads/` directly.
- Folder layout:
  - `/uploads/tours/[slug]/`
  - `/uploads/destinations/[slug]/`
  - `/uploads/blog/`
  - `/uploads/sliders/`
  - `/uploads/gallery/`
  - `/uploads/logos/`
- S3-compatible config: `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_BASE_URL`.
- Store only URL/path/metadata/alt text in MySQL.
- Validate MIME + extension, sanitize filename, prevent path traversal, enforce per-entity size limits.
- Convert large images to WebP with Sharp. Keep original only if needed.
- Decide whether videos remain local/S3; do not rely on Vercel Blob.

## SEO Migration

Current:
- React Helmet metadata.
- `scripts/generateSitemap.cjs` reads JSON and writes `public/sitemap.xml`.
- `scripts/prerenderStatic.cjs` mutates built `dist/index.html` for SEO.
- `robots.txt` disallows admin/api and allows AI crawlers.
- `llms.txt` and `llms-full.txt` generated.

Target:
- `generateMetadata` for every public page.
- `app/sitemap.ts` reads MySQL.
- `app/robots.ts`.
- Server-rendered HTML for tours, destinations, activities, blogs, Kailash pages.
- JSON-LD helpers for `TravelAgency`, `Organization`, `WebSite`, `BreadcrumbList`, `TouristTrip`, `BlogPosting`, `FAQPage`.
- `notFound()` for missing dynamic records.
- `noindex` for admin and API.
- Canonical URLs from `APP_URL`.
- Preserve `/llms.txt` and `/llms-full.txt` if still desired, generated from DB or static script.

## Next.js App Structure

Recommended:

```text
next-zeo/
  app/
    (public)/
    admin/
    api/
    sitemap.ts
    robots.ts
    not-found.tsx
  src/
    components/
    features/
    server/
      db/
      repositories/
      auth/
      storage/
      seo/
      validation/
    scripts/
  deploy/
    nginx.conf.example
    env.example
    README.md
  ecosystem.config.js
  Dockerfile
  docker-compose.yml
```

Route groups are optional, but keep public/admin layouts separate.

## Implementation Phases

### Phase 0 - Freeze/Inventory

- Keep existing Vite/Express app untouched.
- Add `docs/next-migration-analysis.md`.
- Decide canonical source among `api/data` vs `api/data/data`.
- Decide storage driver for production: local VPS first, S3-compatible optional.

### Phase 1 - Scaffold `next-zeo`

- Create Next.js App Router app with TS/Tailwind.
- Port Tailwind theme colors from `zeopwebsite/tailwind.config.js`.
- Add env validation.
- Add MySQL utility and migration runner.
- Add route/layout skeletons.

### Phase 2 - Database + Import

- Build full schema and indexes.
- Implement idempotent JSON import script:
  - `--dry-run`
  - `--apply`
  - `--reset-and-apply` blocked in production
- Import tours, tour details, relations, posts, destinations, activities, sliders, testimonials, contact, enquiries, leads, team, logos, director message, gallery, newsletter.
- Preserve IDs where practical. Upsert by slug/email/type/id.

### Phase 3 - Server Repositories + API Compatibility

- Implement repositories.
- Implement route handlers under `app/api`.
- Preserve public response shapes expected by frontend.
- Add `/api/admin/me`.
- Add API helpers for errors, validation, pagination.

### Phase 4 - Public UI Migration

- Port static public pages first as Server Components.
- Port shared visual components.
- Port dynamic list/detail pages with direct server fetch.
- Convert browser/motion/swiper/search/form parts to Client Components.
- Replace React Router with `next/link`, `next/navigation`, server params.

### Phase 5 - Admin UI Migration

- Port login/dashboard/admin managers.
- Use cookie session.
- Preserve tabs and current admin workflow.
- Move rich editor, uploads, drag/sort, modals to Client Components.

### Phase 6 - SEO Native

- Implement metadata, sitemap, robots, JSON-LD.
- Verify raw HTML contains meaningful content for money pages.
- Verify old URLs work or redirect cleanly.

### Phase 7 - VPS Deployment

- Add `ecosystem.config.js`.
- Add Nginx config with:
  - reverse proxy to app
  - `/uploads/` alias
  - upload size limits
  - static cache headers
  - HTTPS redirect
  - canonical domain redirect
- Add deploy README.
- Add MySQL/uploads backup scripts/guidance.

### Phase 8 - Verification

Mandatory commands/checks after implementation:

- install
- lint
- typecheck
- build
- DB connection test
- migration dry-run
- migration apply on local/test DB
- admin user creation
- public page rendering checks
- admin login
- tour/destination/blog CRUD
- upload
- sitemap/robots
- metadata/canonical checks
- API compatibility checks
- protected admin/noindex checks

## Required Environment Variables

Minimum production env:

```env
NODE_ENV=production
APP_URL=https://www.zeotourism.com
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=zeo_user
MYSQL_PASSWORD=change-me
MYSQL_DATABASE=zeo_website
JWT_SECRET=change-me-long-random
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me-on-first-create
UPLOAD_DIR=/var/www/zeo/uploads
STORAGE_DRIVER=local
```

Optional S3:

```env
S3_ENDPOINT=
S3_REGION=
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_PUBLIC_BASE_URL=
```

## Grill-Me Questions / Decisions

Answer before code migration if possible:

1. Production storage: local VPS uploads only, or Cloudflare R2/S3 from day one?
2. Canonical domain: `https://zeotourism.com` or `https://www.zeotourism.com`?
3. Should `api/data/data/*` be ignored as stale duplicate, or compared and merged?
4. Should old `/api/tours/:id` remain supported, or can slug become canonical?
5. Admin auth final: HTTP-only JWT cookie enough, or DB-backed sessions with revocation?
6. Should videos be uploaded/served, or only preserved as existing slider media?

## Immediate Next Step

Start implementation with Phase 1 + Phase 2 only:

1. Scaffold `next-zeo`.
2. Add schema/migrations/import scripts.
3. Do not port all UI yet.
4. Verify import against local MySQL.
5. Then port public pages by SEO priority.

