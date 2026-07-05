# ZEO WEBSITE API REFACTORING GUIDE
## Converting from JSON to MySQL Database

This guide provides templates and best practices for refactoring your Express API to use MySQL instead of flat JSON files.

---

## 1. REQUIRED CHANGES TO server.js

### Add Database Import at the Top

Add this after your existing requires (around line 35):

```javascript
// =============================================================================
// DATABASE CONNECTION (MySQL)
// =============================================================================
// Import the database module - uses mysql2/promise connection pool
const db = require('./database');
```

### Add Error Handling Middleware

Add this before your routes (around line 114, after `app.use(express.json())`):

```javascript
// =============================================================================
// DATABASE ERROR HANDLING MIDDLEWARE
// =============================================================================

// Async handler wrapper to catch errors from async route handlers
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Middleware to handle database connection errors
app.use((err, req, res, next) => {
    // Handle MySQL connection errors
    if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('❌ Database connection error:', err.message);
        return res.status(503).json({
            error: 'Database temporarily unavailable. Please try again later.',
            code: 'DB_CONNECTION_ERROR'
        });
    }
    
    // Handle query errors
    if (err.code === 'ER_PARSE_ERROR' || err.code === 'ER_BAD_FIELD_ERROR') {
        console.error('❌ Database query error:', err.message);
        return res.status(500).json({
            error: 'Database query failed.',
            code: 'DB_QUERY_ERROR'
        });
    }
    
    // Pass to other error handlers
    next(err);
});
```

---

## 2. PUBLIC GET ENDPOINTS (READ-ONLY)

### GET /api/destinations - Fetch All Destinations

Replace your existing destinations endpoint with:

```javascript
// =============================================================================
// GET /api/destinations - Public endpoint
// =============================================================================
app.get('/api/destinations', asyncHandler(async (req, res) => {
    try {
        // Fetch all listed destinations from MySQL
        const destinations = await db.Destinations.getAll();
        
        // Set cache headers for performance
        res.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
        
        res.json(destinations);
    } catch (error) {
        console.error('Error fetching destinations:', error);
        res.status(500).json({ error: 'Failed to fetch destinations' });
    }
}));
```

### GET /api/destinations/:slug - Single Destination

```javascript
// =============================================================================
// GET /api/destinations/:slug - Public endpoint
// =============================================================================
app.get('/api/destinations/:slug', asyncHandler(async (req, res) => {
    const { slug } = req.params;
    
    try {
        const destination = await db.Destinations.getBySlug(slug);
        
        if (!destination) {
            return res.status(404).json({ error: 'Destination not found' });
        }
        
        res.json(destination);
    } catch (error) {
        console.error('Error fetching destination:', error);
        res.status(500).json({ error: 'Failed to fetch destination' });
    }
}));
```

### GET /api/tours - Fetch All Tours with JOIN

```javascript
// =============================================================================
// GET /api/tours - Public endpoint with destination join
// =============================================================================
app.get('/api/tours', asyncHandler(async (req, res) => {
    try {
        // Extract optional query filters
        const { category, destination, featured } = req.query;
        
        // Build filters object
        const filters = {};
        if (category) filters.category = category;
        if (destination) filters.destination_id = destination;
        if (featured === 'true') filters.featured = true;
        
        // Fetch tours with destination info (uses JOIN in the getAll method)
        const tours = await db.Tours.getAll(filters);
        
        // CRITICAL: Parse itinerary_json string back to JSON array
        // This ensures frontend receives proper array format
        const processedTours = tours.map(tour => ({
            ...tour,
            itinerary: tour.itinerary_json ? JSON.parse(tour.itinerary_json) : []
        }));
        
        res.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
        res.json(processedTours);
    } catch (error) {
        console.error('Error fetching tours:', error);
        res.status(500).json({ error: 'Failed to fetch tours' });
    }
}));
```

### GET /api/tours/:slug - Single Tour with Itinerary

```javascript
// =============================================================================
// GET /api/tours/:slug - Public endpoint
// CRITICAL: Must parse itinerary_json back to JSON array
// =============================================================================
app.get('/api/tours/:slug', asyncHandler(async (req, res) => {
    const { slug } = req.params;
    
    try {
        const tour = await db.Tours.getBySlug(slug);
        
        if (!tour) {
            return res.status(404).json({ error: 'Tour not found' });
        }
        
        // CRITICAL: Parse the itinerary_json string back to JSON array
        // The frontend expects an array, not a string!
        const processedTour = {
            ...tour,
            // Parse itinerary_json if it exists, otherwise use empty array
            itinerary: tour.itinerary_json ? JSON.parse(tour.itinerary_json) : [],
            // Also handle other JSON columns
            gallery: typeof tour.gallery === 'string' ? JSON.parse(tour.gallery) : tour.gallery,
            highlights: typeof tour.highlights === 'string' ? JSON.parse(tour.highlights) : tour.highlights,
            inclusions: typeof tour.inclusions === 'string' ? JSON.parse(tour.inclusions) : tour.inclusions,
            exclusions: typeof tour.exclusions === 'string' ? JSON.parse(tour.exclusions) : tour.exclusions,
            activities: typeof tour.activities === 'string' ? JSON.parse(tour.activities) : tour.activities
        };
        
        res.json(processedTour);
    } catch (error) {
        console.error('Error fetching tour:', error);
        res.status(500).json({ error: 'Failed to fetch tour' });
    }
}));
```

### GET /api/tours/featured - Featured Tours

```javascript
// =============================================================================
// GET /api/tours/featured - Featured tours only
// =============================================================================
app.get('/api/tours/featured', asyncHandler(async (req, res) => {
    try {
        const tours = await db.Tours.getFeatured();
        
        // Process tours same as above
        const processedTours = tours.map(tour => ({
            ...tour,
            itinerary: tour.itinerary_json ? JSON.parse(tour.itinerary_json) : []
        }));
        
        res.json(processedTours);
    } catch (error) {
        console.error('Error fetching featured tours:', error);
        res.status(500).json({ error: 'Failed to fetch featured tours' });
    }
}));
```

---

## 3. PUBLIC POST ENDPOINTS (SUBMISSIONS)

### POST /api/enquiries - Submit Enquiry Form

```javascript
// =============================================================================
// POST /api/enquiries - Public endpoint
// Uses parameterized queries to prevent SQL injection
// =============================================================================
app.post('/api/enquiries', asyncHandler(async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            subject,
            message,
            tour_id,
            tour_name,
            destination,
            number_of_people,
            travel_date
        } = req.body;
        
        // Server-side validation
        if (!name || !email || !message) {
            return res.status(400).json({
                error: 'Name, email, and message are required fields'
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Invalid email format'
            });
        }
        
        // Insert enquiry into database using parameterized queries
        // This prevents SQL injection attacks
        const enquiryId = await db.Enquiries.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone?.trim() || '',
            subject: subject?.trim() || '',
            message: message.trim(),
            tour_id: tour_id || null,
            tour_name: tour_name?.trim() || '',
            destination: destination?.trim() || '',
            number_of_people: number_of_people?.trim() || '',
            travel_date: travel_date || null
        });
        
        console.log(`✅ New enquiry submitted: ID ${enquiryId} from ${email}`);
        
        res.status(201).json({
            success: true,
            message: 'Thank you for your enquiry! We will get back to you soon.',
            id: enquiryId
        });
    } catch (error) {
        console.error('Error submitting enquiry:', error);
        res.status(500).json({
            error: 'Failed to submit enquiry. Please try again.'
        });
    }
}));
```

### POST /api/contact - Alternative Contact Form

```javascript
// =============================================================================
// POST /api/contact - Public endpoint (alternative)
// =============================================================================
app.post('/api/contact', asyncHandler(async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        
        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({
                error: 'Name, email, and message are required'
            });
        }
        
        // Insert as general enquiry (no tour associated)
        const enquiryId = await db.Enquiries.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone?.trim() || '',
            subject: subject?.trim() || 'General Inquiry',
            message: message.trim(),
            tour_id: null,
            tour_name: '',
            destination: '',
            number_of_people: '',
            travel_date: null
        });
        
        res.status(201).json({
            success: true,
            message: 'Message sent successfully!',
            id: enquiryId
        });
    } catch (error) {
        console.error('Error submitting contact form:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
}));
```

---

## 4. ADMIN CRUD OPERATIONS (PROTECTED)

### Middleware: Verify Admin Token

```javascript
// =============================================================================
// ADMIN AUTHENTICATION MIDDLEWARE
// =============================================================================
const requireAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err || !user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        req.user = user;
        next();
    });
};
```

### POST /api/admin/tours - Create New Tour

```javascript
// =============================================================================
// POST /api/admin/tours - Admin protected
// CRITICAL: Stringify itinerary array before inserting
// =============================================================================
app.post('/api/admin/tours', requireAdmin, asyncHandler(async (req, res) => {
    try {
        const {
            slug,
            title,
            category,
            description,
            location,
            price,
            duration,
            duration_days,
            group_size,
            difficulty,
            rating,
            reviews,
            best_time,
            featured,
            listed,
            image_url,
            gallery,
            highlights,
            inclusions,
            exclusions,
            activities,
            itinerary, // This comes as an array from the frontend
            destination_id
        } = req.body;
        
        // Validation
        if (!title || !slug) {
            return res.status(400).json({ error: 'Title and slug are required' });
        }
        
        // CRITICAL: Convert itinerary array to JSON string for storage
        // The database stores this as LONGTEXT, not JSON type
        const itineraryJson = itinerary ? JSON.stringify(itinerary) : null;
        
        // Also stringify other JSON columns
        const galleryJson = gallery ? JSON.stringify(gallery) : '[]';
        const highlightsJson = highlights ? JSON.stringify(highlights) : '[]';
        const inclusionsJson = inclusions ? JSON.stringify(inclusions) : '[]';
        const exclusionsJson = exclusions ? JSON.stringify(exclusions) : '[]';
        const activitiesJson = activities ? JSON.stringify(activities) : '[]';
        
        // Build insert data object
        const tourData = {
            slug: slug.trim().toLowerCase(),
            title: title.trim(),
            category: category?.trim() || '',
            description: description || '',
            location: location?.trim() || '',
            price: parseFloat(price) || 0,
            duration: duration?.trim() || '',
            duration_days: parseInt(duration_days) || null,
            group_size: group_size?.trim() || '',
            difficulty: difficulty?.trim() || '',
            rating: parseFloat(rating) || 0,
            reviews: parseInt(reviews) || 0,
            best_time: best_time?.trim() || '',
            featured: featured === true || featured === 'true',
            listed: listed !== false && listed !== 'false',
            image_url: image_url?.trim() || '',
            gallery: galleryJson,
            highlights: highlightsJson,
            inclusions: inclusionsJson,
            exclusions: exclusionsJson,
            activities: activitiesJson,
            itinerary_json: itineraryJson, // Stringified!
            destination_id: parseInt(destination_id) || null
        };
        
        // Insert using the database module
        const insertId = await db.executeQuery(
            `INSERT INTO tours (
                slug, title, category, description, location, price, duration, duration_days,
                group_size, difficulty, rating, reviews, best_time, featured, listed,
                image_url, gallery, highlights, inclusions, exclusions, activities,
                itinerary_json, destination_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            Object.values(tourData)
        );
        
        console.log(`✅ New tour created: ID ${insertId}`);
        
        res.status(201).json({
            success: true,
            message: 'Tour created successfully',
            id: insertId
        });
    } catch (error) {
        // Handle duplicate slug error
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'A tour with this slug already exists' });
        }
        console.error('Error creating tour:', error);
        res.status(500).json({ error: 'Failed to create tour' });
    }
}));
```

### PUT /api/admin/tours/:id - Update Tour

```javascript
// =============================================================================
// PUT /api/admin/tours/:id - Admin protected
// =============================================================================
app.put('/api/admin/tours/:id', requireAdmin, asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    try {
        // First check if tour exists
        const existingTour = await db.Tours.getById(parseInt(id));
        
        if (!existingTour) {
            return res.status(404).json({ error: 'Tour not found' });
        }
        
        const {
            slug,
            title,
            category,
            description,
            location,
            price,
            duration,
            duration_days,
            group_size,
            difficulty,
            rating,
            reviews,
            best_time,
            featured,
            listed,
            image_url,
            gallery,
            highlights,
            inclusions,
            exclusions,
            activities,
            itinerary,
            destination_id
        } = req.body;
        
        // CRITICAL: Stringify arrays for storage
        const itineraryJson = itinerary ? JSON.stringify(itinerary) : null;
        
        // Build update data - only include fields that were provided
        const updateData = {};
        if (slug !== undefined) updateData.slug = slug.trim().toLowerCase();
        if (title !== undefined) updateData.title = title.trim();
        if (category !== undefined) updateData.category = category?.trim() || '';
        if (description !== undefined) updateData.description = description;
        if (location !== undefined) updateData.location = location?.trim() || '';
        if (price !== undefined) updateData.price = parseFloat(price) || 0;
        if (duration !== undefined) updateData.duration = duration?.trim() || '';
        if (duration_days !== undefined) updateData.duration_days = parseInt(duration_days) || null;
        if (group_size !== undefined) updateData.group_size = group_size?.trim() || '';
        if (difficulty !== undefined) updateData.difficulty = difficulty?.trim() || '';
        if (rating !== undefined) updateData.rating = parseFloat(rating) || 0;
        if (reviews !== undefined) updateData.reviews = parseInt(reviews) || 0;
        if (best_time !== undefined) updateData.best_time = best_time?.trim() || '';
        if (featured !== undefined) updateData.featured = featured === true;
        if (listed !== undefined) updateData.listed = listed !== false;
        if (image_url !== undefined) updateData.image_url = image_url?.trim() || '';
        if (gallery !== undefined) updateData.gallery = JSON.stringify(gallery);
        if (highlights !== undefined) updateData.highlights = JSON.stringify(highlights);
        if (inclusions !== undefined) updateData.inclusions = JSON.stringify(inclusions);
        if (exclusions !== undefined) updateData.exclusions = JSON.stringify(exclusions);
        if (activities !== undefined) updateData.activities = JSON.stringify(activities);
        if (itinerary !== undefined) updateData.itinerary_json = itineraryJson;
        if (destination_id !== undefined) updateData.destination_id = parseInt(destination_id) || null;
        
        // Add updated timestamp
        updateData.updated_at = new Date();
        
        // Perform update
        const affectedRows = await db.update('tours', updateData, { id: parseInt(id) });
        
        console.log(`✅ Tour updated: ID ${id}`);
        
        res.json({
            success: true,
            message: 'Tour updated successfully',
            affectedRows
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'A tour with this slug already exists' });
        }
        console.error('Error updating tour:', error);
        res.status(500).json({ error: 'Failed to update tour' });
    }
}));
```

### DELETE /api/admin/tours/:id - Delete Tour

```javascript
// =============================================================================
// DELETE /api/admin/tours/:id - Admin protected
// =============================================================================
app.delete('/api/admin/tours/:id', requireAdmin, asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    try {
        // Check if tour exists
        const existingTour = await db.Tours.getById(parseInt(id));
        
        if (!existingTour) {
            return res.status(404).json({ error: 'Tour not found' });
        }
        
        // Delete the tour
        const affectedRows = await db.remove('tours', { id: parseInt(id) });
        
        console.log(`✅ Tour deleted: ID ${id}`);
        
        res.json({
            success: true,
            message: 'Tour deleted successfully',
            affectedRows
        });
    } catch (error) {
        console.error('Error deleting tour:', error);
        res.status(500).json({ error: 'Failed to delete tour' });
    }
}));
```

---

## 5. ADDITIONAL ADMIN ENDPOINTS

### GET /api/admin/enquiries - List All Enquiries

```javascript
// =============================================================================
// GET /api/admin/enquiries - Admin protected
// =============================================================================
app.get('/api/admin/enquiries', requireAdmin, asyncHandler(async (req, res) => {
    try {
        const { status } = req.query;
        
        const filters = {};
        if (status) filters.status = status;
        
        const enquiries = await db.Enquiries.getAll(filters);
        
        res.json(enquiries);
    } catch (error) {
        console.error('Error fetching enquiries:', error);
        res.status(500).json({ error: 'Failed to fetch enquiries' });
    }
}));
```

### PUT /api/admin/enquiries/:id - Update Enquiry Status

```javascript
// =============================================================================
// PUT /api/admin/enquiries/:id - Admin protected
// =============================================================================
app.put('/api/admin/enquiries/:id', requireAdmin, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    try {
        const validStatuses = ['new', 'contacted', 'converted', 'lost'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }
        
        const affectedRows = await db.Enquiries.updateStatus(parseInt(id), status);
        
        if (affectedRows === 0) {
            return res.status(404).json({ error: 'Enquiry not found' });
        }
        
        res.json({ success: true, message: 'Enquiry status updated' });
    } catch (error) {
        console.error('Error updating enquiry:', error);
        res.status(500).json({ error: 'Failed to update enquiry' });
    }
}));
```

### GET /api/admin/sliders - Admin Sliders

```javascript
// =============================================================================
// GET /api/admin/sliders - Admin protected
// =============================================================================
app.get('/api/admin/sliders', requireAdmin, asyncHandler(async (req, res) => {
    try {
        // Fetch all sliders (including inactive)
        const sliders = await db.SiteContent.getByCategory('slider', false);
        res.json(sliders);
    } catch (error) {
        console.error('Error fetching sliders:', error);
        res.status(500).json({ error: 'Failed to fetch sliders' });
    }
}));
```

---

## 6. SLIDER DATA MIGRATION NOTE

Since your sliders are stored in the `site_content` table with category='slider', you can fetch them like this:

```javascript
// For public sliders (active only)
const sliders = await db.SiteContent.getSliders();

// For admin (all sliders)
const allSliders = await db.SiteContent.getByCategory('slider', false);
```

The slider data format will need a small transformation:

```javascript
// Transform site_content to slider format
const transformSlider = (slider) => ({
    id: slider.id,
    title: slider.title,
    subtitle: slider.subtitle,
    location: slider.description,
    image: slider.image_url,
    video: slider.video_url,
    order_index: slider.order_index,
    is_active: slider.is_active,
    // Extra data from JSON column
    ...(slider.extra_data_json || {})
});
```

---

## 7. COMPLETE MIGRATION CHECKLIST

- [ ] Import `db` module in server.js
- [ ] Add `asyncHandler` wrapper
- [ ] Add database error middleware
- [ ] Update `/api/destinations` endpoints
- [ ] Update `/api/tours` endpoints (remember to parse `itinerary_json`)
- [ ] Update `/api/enquiries` POST endpoint
- [ ] Update `/api/contact` POST endpoint
- [ ] Add Admin CRUD for tours
- [ ] Add Admin CRUD for enquiries
- [ ] Test all endpoints with curl or Postman
- [ ] Verify error handling works (disconnect MySQL temporarily)

---

## 8. TESTING COMMANDS

```bash
# Test destinations
curl http://localhost:3000/api/destinations

# Test tours
curl http://localhost:3000/api/tours

# Test single tour
curl http://localhost:3000/api/tours/everest-base-camp-trek-13n-14d

# Test enquiry submission
curl -X POST http://localhost:3000/api/enquiries \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"Test message"}'

# Test with admin token (after login)
curl -X POST http://localhost:3000/api/admin/tours \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"New Tour","slug":"new-tour","price":999}'
```

---

## 9. ENVIRONMENT VARIABLES

Make sure your `.env` file (or environment) has these configured:

```env
# Database (MySQL)
DB_HOST=localhost
DB_PORT=3308
DB_NAME=zeo_website
DB_USER=zeo_user
DB_PASSWORD=zeopassword

# JWT for admin auth
JWT_SECRET=your-secure-secret-key

# Admin credentials
ADMIN_EMAIL=admin@zeotourism.com
ADMIN_PASSWORD=admin123
```

---

**End of Refactoring Guide**
