/**
 * =============================================================================
 * ZEO WEBSITE - MySQL DATA MIGRATION SCRIPT
 * =============================================================================
 * This script migrates data from flat JSON files to MySQL database.
 * 
 * Usage:
 *   node migrate.js
 * 
 * Environment Variables (can be passed via command line or .env file):
 *   MYSQL_HOST=localhost
 *   MYSQL_PORT=3306
 *   MYSQL_USER=root
 *   MYSQL_PASSWORD=rootpassword
 *   MYSQL_DATABASE=zeo_website
 * =============================================================================
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// =============================================================================
// CONFIGURATION
// =============================================================================

const DATA_DIR = path.join(__dirname, 'data', 'data');
const TOUR_DETAILS_DIR = path.join(__dirname, 'data', 'data', 'tour-details');

// Database configuration from environment or defaults
const dbConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'rootpassword',
    database: process.env.MYSQL_DATABASE || 'zeo_website',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// =============================================================================
// MIGRATION LOGGING
// =============================================================================

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n');
    log(`═══════════════════════════════════════════════════════════════════`, 'cyan');
    log(`  ${title}`, 'cyan');
    log(`═══════════════════════════════════════════════════════════════════`, 'cyan');
}

function logSuccess(message) {
    log(`  ✓ ${message}`, 'green');
}

function logError(message) {
    log(`  ✗ ${message}`, 'red');
}

function logInfo(message) {
    log(`  ℹ ${message}`, 'blue');
}

// =============================================================================
// FILE HELPERS
// =============================================================================

function readJSONFile(filepath) {
    try {
        const content = fs.readFileSync(filepath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        logError(`Failed to read/parse ${filepath}: ${error.message}`);
        return null;
    }
}

function getSlugFromTourTitle(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// =============================================================================
// MIGRATION FUNCTIONS
// =============================================================================

/**
 * Connect to MySQL database
 */
async function connectToDatabase() {
    logInfo('Connecting to MySQL database...');
    const connection = await mysql.createConnection(dbConfig);
    logSuccess('Connected to MySQL database');
    return connection;
}

/**
 * Log migration progress to database
 */
async function logMigration(connection, name, status, records = 0, error = null) {
    try {
        if (status === 'completed') {
            await connection.execute(
                `INSERT INTO migration_log (migration_name, status, records_migrated, completed_at) 
                 VALUES (?, ?, ?, NOW()) 
                 ON DUPLICATE KEY UPDATE status = ?, records_migrated = ?, completed_at = NOW()`,
                [name, status, records, status, records]
            );
        } else if (status === 'failed') {
            await connection.execute(
                `INSERT INTO migration_log (migration_name, status, error_message) 
                 VALUES (?, ?, ?) 
                 ON DUPLICATE KEY UPDATE status = ?, error_message = ?`,
                [name, status, error, status, error]
            );
        }
    } catch (err) {
        console.error('Failed to log migration:', err.message);
    }
}

/**
 * Migrate Destinations
 */
async function migrateDestinations(connection) {
    logSection('MIGRATING DESTINATIONS');

    const filepath = path.join(DATA_DIR, 'destinations.json');
    const data = readJSONFile(filepath);

    if (!data || !Array.isArray(data)) {
        logError('destinations.json not found or invalid format');
        return 0;
    }

    logInfo(`Found ${data.length} destinations to migrate`);

    let migrated = 0;

    for (const dest of data) {
        try {
            const slug = dest.href ? dest.href.replace('/destinations/', '') : getSlugFromTourTitle(dest.name);

            await connection.execute(
                `INSERT INTO destinations (slug, name, country, description, image_url, highlights, best_time, altitude, difficulty, tour_count, type, title, listed)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                    name = VALUES(name), 
                    country = VALUES(country), 
                    description = VALUES(description),
                    image_url = VALUES(image_url),
                    highlights = VALUES(highlights),
                    best_time = VALUES(best_time),
                    altitude = VALUES(altitude),
                    difficulty = VALUES(difficulty),
                    tour_count = VALUES(tour_count),
                    type = VALUES(type),
                    title = VALUES(title),
                    listed = VALUES(listed)`,
                [
                    slug,
                    dest.name || '',
                    dest.country || 'Nepal',
                    dest.description || '',
                    dest.image || '',
                    JSON.stringify(dest.highlights || []),
                    dest.bestTime || '',
                    dest.altitude || '',
                    dest.difficulty || '',
                    dest.tourCount || 0,
                    dest.type || '',
                    dest.title || '',
                    dest.listed !== false
                ]
            );
            migrated++;
        } catch (error) {
            logError(`Failed to migrate destination "${dest.name}": ${error.message}`);
        }
    }

    logSuccess(`Migrated ${migrated} destinations`);
    await logMigration(connection, 'destinations', 'completed', migrated);
    return migrated;
}

/**
 * Get destination ID by slug
 */
async function getDestinationIdBySlug(connection, slug) {
    const [rows] = await connection.execute(
        'SELECT id FROM destinations WHERE slug = ?',
        [slug]
    );
    return rows.length > 0 ? rows[0].id : null;
}

/**
 * Parse duration to extract days
 */
function parseDurationToDays(duration) {
    if (!duration) return null;

    // Match patterns like "10 days", "10 Nights", "10N/11D", etc.
    const match = duration.match(/(\d+)\s*(?:days?|nights?|n\/d)/i);
    if (match) {
        return parseInt(match[1], 10);
    }

    // Try to extract first number
    const numMatch = duration.match(/(\d+)/);
    return numMatch ? parseInt(numMatch[1], 10) : null;
}

/**
 * Read tour details from individual JSON file
 */
function readTourDetailsFile(slug) {
    const filepath = path.join(TOUR_DETAILS_DIR, `${slug}.json`);

    if (fs.existsSync(filepath)) {
        return readJSONFile(filepath);
    }
    return null;
}

/**
 * Extract itinerary array from tour details
 */
function extractItinerary(tourDetails) {
    if (!tourDetails) return null;

    // Try different possible keys
    const itinerary = tourDetails.itinerary || tourDetails.days || tourDetails.timeline || tourDetails.itineraryDays;

    if (Array.isArray(itinerary)) {
        return JSON.stringify(itinerary);
    }

    return null;
}

/**
 * Migrate Tours
 */
async function migrateTours(connection) {
    logSection('MIGRATING TOURS');

    const filepath = path.join(DATA_DIR, 'tours.json');
    const data = readJSONFile(filepath);

    if (!data || !data.tours || !Array.isArray(data.tours)) {
        logError('tours.json not found or invalid format');
        return 0;
    }

    logInfo(`Found ${data.tours.length} tours to migrate`);

    let migrated = 0;

    for (const tour of data.tours) {
        try {
            // Find destination by location/country
            let destinationId = null;
            if (tour.location) {
                const locationSlug = tour.location.toLowerCase().replace(/\s+/g, '-');
                destinationId = await getDestinationIdBySlug(connection, locationSlug);

                // Try alternative slug patterns
                if (!destinationId) {
                    const altSlug = tour.location.toLowerCase().includes('nepal') ? 'nepal' :
                        tour.location.toLowerCase().includes('india') ? 'india' : null;
                    if (altSlug) {
                        destinationId = await getDestinationIdBySlug(connection, altSlug);
                    }
                }
            }

            // Try to find individual tour details file for itinerary
            let itineraryJson = null;
            const tourDetails = readTourDetailsFile(tour.slug);
            if (tourDetails) {
                itineraryJson = extractItinerary(tourDetails);
            }

            // Use embedded itinerary if no file found
            if (!itineraryJson && tour.itinerary) {
                itineraryJson = JSON.stringify(tour.itinerary);
            }

            await connection.execute(
                `INSERT INTO tours (
                    slug, title, category, description, location, price, duration, duration_days,
                    group_size, difficulty, rating, reviews, best_time, featured, listed,
                    image_url, gallery, highlights, inclusions, exclusions, activities,
                    itinerary_json, destination_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    title = VALUES(title),
                    category = VALUES(category),
                    description = VALUES(description),
                    location = VALUES(location),
                    price = VALUES(price),
                    duration = VALUES(duration),
                    duration_days = VALUES(duration_days),
                    group_size = VALUES(group_size),
                    difficulty = VALUES(difficulty),
                    rating = VALUES(rating),
                    reviews = VALUES(reviews),
                    best_time = VALUES(best_time),
                    featured = VALUES(featured),
                    listed = VALUES(listed),
                    image_url = VALUES(image_url),
                    gallery = VALUES(gallery),
                    highlights = VALUES(highlights),
                    inclusions = VALUES(inclusions),
                    exclusions = VALUES(exclusions),
                    activities = VALUES(activities),
                    itinerary_json = VALUES(itinerary_json),
                    destination_id = VALUES(destination_id)`,
                [
                    tour.slug || getSlugFromTourTitle(tour.title),
                    tour.title || '',
                    tour.category || '',
                    tour.description || '',
                    tour.location || '',
                    tour.price || 0,
                    tour.duration || '',
                    parseDurationToDays(tour.duration),
                    tour.group_size || '',
                    tour.difficulty || '',
                    tour.rating || 0,
                    tour.reviews || 0,
                    tour.best_time || '',
                    tour.featured === true,
                    tour.listed !== false,
                    tour.image || '',
                    JSON.stringify(tour.gallery || []),
                    JSON.stringify(tour.highlights || []),
                    JSON.stringify(tour.inclusions || []),
                    JSON.stringify(tour.exclusions || []),
                    JSON.stringify(tour.activities || []),
                    itineraryJson,
                    destinationId
                ]
            );
            migrated++;

            if (migrated % 10 === 0) {
                logInfo(`  Progress: ${migrated}/${data.tours.length} tours migrated`);
            }
        } catch (error) {
            logError(`Failed to migrate tour "${tour.title}": ${error.message}`);
        }
    }

    logSuccess(`Migrated ${migrated} tours`);
    await logMigration(connection, 'tours', 'completed', migrated);
    return migrated;
}

/**
 * Migrate Enquiries
 */
async function migrateEnquiries(connection) {
    logSection('MIGRATING ENQUIRIES');

    const filepath = path.join(DATA_DIR, 'enquiries.json');
    const data = readJSONFile(filepath);

    if (!data || !data.enquiries || !Array.isArray(data.enquiries)) {
        logError('enquiries.json not found or invalid format');
        return 0;
    }

    logInfo(`Found ${data.enquiries.length} enquiries to migrate`);

    let migrated = 0;

    for (const enquiry of data.enquiries) {
        try {
            await connection.execute(
                `INSERT INTO enquiries (
                    name, email, phone, subject, message, tour_id, tour_name,
                    destination, number_of_people, travel_date, status, assigned_to, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    name = VALUES(name),
                    email = VALUES(email),
                    phone = VALUES(phone),
                    subject = VALUES(subject),
                    message = VALUES(message),
                    tour_name = VALUES(tour_name),
                    destination = VALUES(destination),
                    number_of_people = VALUES(number_of_people),
                    travel_date = VALUES(travel_date),
                    status = VALUES(status),
                    assigned_to = VALUES(assigned_to),
                    notes = VALUES(notes)`,
                [
                    enquiry.name || '',
                    enquiry.email || '',
                    enquiry.phone || '',
                    enquiry.subject || '',
                    enquiry.message || '',
                    enquiry.tour_id || null,
                    enquiry.tour_name || '',
                    enquiry.destination || '',
                    enquiry.number_of_people || '',
                    enquiry.travel_date || null,
                    enquiry.status || 'new',
                    enquiry.assigned_to || '',
                    enquiry.notes || ''
                ]
            );
            migrated++;
        } catch (error) {
            logError(`Failed to migrate enquiry from "${enquiry.name}": ${error.message}`);
        }
    }

    logSuccess(`Migrated ${migrated} enquiries`);
    await logMigration(connection, 'enquiries', 'completed', migrated);
    return migrated;
}

/**
 * Migrate Site Content (Sliders)
 */
async function migrateSliders(connection) {
    logSection('MIGRATING SLIDERS');

    const filepath = path.join(DATA_DIR, 'sliders.json');
    const data = readJSONFile(filepath);

    if (!data || !Array.isArray(data)) {
        logError('sliders.json not found or invalid format');
        return 0;
    }

    logInfo(`Found ${data.length} sliders to migrate`);

    let migrated = 0;

    for (const slider of data) {
        try {
            await connection.execute(
                `INSERT INTO site_content (
                    category, name, title, subtitle, description, image_url, video_url,
                    extra_data_json, order_index, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    name = VALUES(name),
                    title = VALUES(title),
                    subtitle = VALUES(subtitle),
                    description = VALUES(description),
                    image_url = VALUES(image_url),
                    video_url = VALUES(video_url),
                    extra_data_json = VALUES(extra_data_json),
                    order_index = VALUES(order_index),
                    is_active = VALUES(is_active)`,
                [
                    'slider',
                    `slider_${slider.id}`,
                    slider.title || '',
                    slider.subtitle || '',
                    slider.location || '',
                    slider.image || '',
                    slider.video || '',
                    JSON.stringify({
                        show_button: slider.show_button,
                        button_text: slider.button_text,
                        button_url: slider.button_url,
                        button_style: slider.button_style,
                        video_start_time: slider.video_start_time
                    }),
                    slider.order_index || 0,
                    slider.is_active !== false
                ]
            );
            migrated++;
        } catch (error) {
            logError(`Failed to migrate slider "${slider.title}": ${error.message}`);
        }
    }

    logSuccess(`Migrated ${migrated} sliders`);
    await logMigration(connection, 'sliders', 'completed', migrated);
    return migrated;
}

/**
 * Migrate Testimonials
 */
async function migrateTestimonials(connection) {
    logSection('MIGRATING TESTIMONIALS');

    const filepath = path.join(DATA_DIR, 'testimonials.json');
    const data = readJSONFile(filepath);

    if (!data || !Array.isArray(data)) {
        logError('testimonials.json not found or invalid format');
        return 0;
    }

    logInfo(`Found ${data.length} testimonials to migrate`);

    let migrated = 0;

    for (const testimonial of data) {
        try {
            await connection.execute(
                `INSERT INTO testimonials (name, location, content, rating, image_url, is_active)
                 VALUES (?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                    location = VALUES(location),
                    content = VALUES(content),
                    rating = VALUES(rating),
                    image_url = VALUES(image_url),
                    is_active = VALUES(is_active)`,
                [
                    testimonial.name || '',
                    testimonial.location || '',
                    testimonial.content || testimonial.message || '',
                    testimonial.rating || 5,
                    testimonial.image || '',
                    testimonial.is_active !== false
                ]
            );
            migrated++;
        } catch (error) {
            logError(`Failed to migrate testimonial from "${testimonial.name}": ${error.message}`);
        }
    }

    logSuccess(`Migrated ${migrated} testimonials`);
    await logMigration(connection, 'testimonials', 'completed', migrated);
    return migrated;
}

/**
 * Migrate Team Members
 */
async function migrateTeam(connection) {
    logSection('MIGRATING TEAM MEMBERS');

    const filepath = path.join(DATA_DIR, 'team.json');
    const data = readJSONFile(filepath);

    if (!data || !Array.isArray(data)) {
        logError('team.json not found or invalid format');
        return 0;
    }

    logInfo(`Found ${data.length} team members to migrate`);

    let migrated = 0;

    for (const member of data) {
        try {
            await connection.execute(
                `INSERT INTO team_members (name, position, bio, image_url, email, phone, linkedin, order_index, is_active)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                    position = VALUES(position),
                    bio = VALUES(bio),
                    image_url = VALUES(image_url),
                    email = VALUES(email),
                    phone = VALUES(phone),
                    linkedin = VALUES(linkedin),
                    order_index = VALUES(order_index),
                    is_active = VALUES(is_active)`,
                [
                    member.name || '',
                    member.position || member.role || '',
                    member.bio || '',
                    member.image || '',
                    member.email || '',
                    member.phone || '',
                    member.linkedin || '',
                    member.order || member.order_index || 0,
                    member.is_active !== false
                ]
            );
            migrated++;
        } catch (error) {
            logError(`Failed to migrate team member "${member.name}": ${error.message}`);
        }
    }

    logSuccess(`Migrated ${migrated} team members`);
    await logMigration(connection, 'team', 'completed', migrated);
    return migrated;
}

/**
 * Migrate Activities
 */
async function migrateActivities(connection) {
    logSection('MIGRATING ACTIVITIES');

    const filepath = path.join(DATA_DIR, 'activities.json');
    const data = readJSONFile(filepath);

    if (!data || !Array.isArray(data)) {
        logError('activities.json not found or invalid format');
        return 0;
    }

    logInfo(`Found ${data.length} activities to migrate`);

    let migrated = 0;

    for (const activity of data) {
        try {
            await connection.execute(
                `INSERT INTO activities (slug, name, description, image_url, is_active)
                 VALUES (?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                    name = VALUES(name),
                    description = VALUES(description),
                    image_url = VALUES(image_url),
                    is_active = VALUES(is_active)`,
                [
                    activity.slug || getSlugFromTourTitle(activity.name),
                    activity.name || '',
                    activity.description || '',
                    activity.image || '',
                    activity.is_active !== false
                ]
            );
            migrated++;
        } catch (error) {
            logError(`Failed to migrate activity "${activity.name}": ${error.message}`);
        }
    }

    logSuccess(`Migrated ${migrated} activities`);
    await logMigration(connection, 'activities', 'completed', migrated);
    return migrated;
}

/**
 * Migrate Logos
 */
async function migrateLogos(connection) {
    logSection('MIGRATING LOGOS');

    const filepath = path.join(DATA_DIR, 'logos.json');
    const data = readJSONFile(filepath);

    if (!data || !Array.isArray(data)) {
        logError('logos.json not found or invalid format');
        return 0;
    }

    logInfo(`Found ${data.length} logos to migrate`);

    let migrated = 0;

    for (const logo of data) {
        try {
            await connection.execute(
                `INSERT INTO logos (name, image_url, website_url, category, order_index, is_active)
                 VALUES (?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                    website_url = VALUES(website_url),
                    category = VALUES(category),
                    order_index = VALUES(order_index),
                    is_active = VALUES(is_active)`,
                [
                    logo.name || '',
                    logo.image || '',
                    logo.website || '',
                    logo.category || 'partner',
                    logo.order || logo.order_index || 0,
                    logo.is_active !== false
                ]
            );
            migrated++;
        } catch (error) {
            logError(`Failed to migrate logo "${logo.name}": ${error.message}`);
        }
    }

    logSuccess(`Migrated ${migrated} logos`);
    await logMigration(connection, 'logos', 'completed', migrated);
    return migrated;
}

// =============================================================================
// MAIN MIGRATION
// =============================================================================

async function runMigration() {
    logSection('ZEO WEBSITE - MySQL DATA MIGRATION');

    logInfo('Starting migration process...');
    logInfo(`Data directory: ${DATA_DIR}`);
    logInfo(`Database: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`);

    let connection;

    try {
        // Connect to database
        connection = await connectToDatabase();

        // Run migrations in order
        await migrateDestinations(connection);
        await migrateTours(connection);
        await migrateEnquiries(connection);
        await migrateSliders(connection);
        await migrateTestimonials(connection);
        await migrateTeam(connection);
        await migrateActivities(connection);
        await migrateLogos(connection);

        logSection('MIGRATION COMPLETED SUCCESSFULLY');
        logSuccess('All data has been migrated to MySQL!');

    } catch (error) {
        logSection('MIGRATION FAILED');
        logError(`Migration error: ${error.message}`);

        if (connection) {
            await logMigration(connection, 'full_migration', 'failed', 0, error.message);
        }

        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            logInfo('Database connection closed');
        }
    }
}

// Run migration
runMigration();
