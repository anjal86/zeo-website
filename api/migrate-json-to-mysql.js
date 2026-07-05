/**
 * Migration Script: Populate MySQL database from JSON files
 * Usage: node migrate-json-to-mysql.js
 */

const fs = require('fs');
const path = require('path');

// Load database module
const db = require('./database');
const { pool } = db;

const dataDir = path.join(__dirname, 'data');

// Helper to load JSON data
const loadJson = (filename) => {
    try {
        const filePath = path.join(dataDir, filename);
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error(`Error loading ${filename}:`, e.message);
    }
    return null;
};

// Generate slug from name
const slugify = (text) => {
    if (!text) return 'untitled';
    return text.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50);
};

async function migrate() {
    console.log('🚀 Starting migration from JSON to MySQL...\n');

    try {
        // Test connection
        await db.testConnection();
        console.log('✅ Database connected\n');

        // Disable foreign key checks
        await pool.query('SET FOREIGN_KEY_CHECKS = 0');

        // 1. Migrate Destinations
        console.log('📍 Migrating destinations...');
        const destinationsData = loadJson('destinations.json');
        const destinations = destinationsData.destinations || destinationsData || [];
        let destCount = 0;

        for (const dest of destinations) {
            try {
                const slug = dest.slug || slugify(dest.name);
                await pool.query(
                    `INSERT INTO destinations (id, slug, name, title, country, region, description, image_url, highlights, best_time, altitude, difficulty, tour_count, type, listed, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
           ON DUPLICATE KEY UPDATE name=VALUES(name), title=VALUES(title), country=VALUES(country), region=VALUES(region), description=VALUES(description), image_url=VALUES(image_url), highlights=VALUES(highlights), best_time=VALUES(best_time), altitude=VALUES(altitude), difficulty=VALUES(difficulty), tour_count=VALUES(tour_count), type=VALUES(type), listed=VALUES(listed), updated_at=NOW()`,
                    [
                        dest.id || Math.floor(Math.random() * 10000),
                        slug,
                        dest.name || 'Unknown',
                        dest.title || dest.name || 'Unknown',
                        dest.country || 'Nepal',
                        dest.region || '',
                        dest.description || `Discover the beauty of ${dest.name}`,
                        dest.image || '',
                        JSON.stringify(dest.highlights || []),
                        dest.bestTime || '',
                        dest.altitude || '',
                        dest.difficulty || '',
                        dest.tourCount || 0,
                        dest.type || 'nepal',
                        dest.listed !== false ? 1 : 0
                    ]
                );
                destCount++;
            } catch (e) {
                console.error(`  ❌ Error: ${e.message}`);
            }
        }
        console.log(`  ✅ ${destCount} destinations migrated\n`);

        // 2. Migrate Tours
        console.log('🎒 Migrating tours...');
        const toursData = loadJson('tours.json');
        const tours = toursData.tours || toursData || [];

        // Also load tour-details
        const tourDetailsDir = path.join(dataDir, 'tour-details');
        let tourDetails = [];
        try {
            if (fs.existsSync(tourDetailsDir)) {
                const files = fs.readdirSync(tourDetailsDir);
                for (const file of files) {
                    if (file.endsWith('.json')) {
                        const data = JSON.parse(fs.readFileSync(path.join(tourDetailsDir, file), 'utf8'));
                        tourDetails.push(data);
                    }
                }
            }
        } catch (e) {
            console.error('  Error loading tour-details:', e.message);
        }

        // Merge tours with tour-details
        const allTours = [...tourDetails];
        tours.forEach(tour => {
            if (!tourDetails.find(t => t.id === tour.id)) {
                allTours.push(tour);
            }
        });

        let tourCount = 0;
        for (const tour of allTours) {
            try {
                const slug = tour.slug || slugify(tour.title);
                await pool.query(
                    `INSERT INTO tours (id, slug, title, category, description, location, price, duration, duration_days, group_size, difficulty, rating, reviews, best_time, featured, listed, image_url, gallery, highlights, inclusions, exclusions, activities, itinerary_json, destination_id, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
           ON DUPLICATE KEY UPDATE slug=VALUES(slug), title=VALUES(title), category=VALUES(category), description=VALUES(description), location=VALUES(location), price=VALUES(price), duration=VALUES(duration), duration_days=VALUES(duration_days), group_size=VALUES(group_size), difficulty=VALUES(difficulty), rating=VALUES(rating), reviews=VALUES(reviews), best_time=VALUES(best_time), featured=VALUES(featured), listed=VALUES(listed), image_url=VALUES(image_url), gallery=VALUES(gallery), highlights=VALUES(highlights), inclusions=VALUES(inclusions), exclusions=VALUES(exclusions), activities=VALUES(activities), itinerary_json=VALUES(itinerary_json), destination_id=VALUES(destination_id), updated_at=NOW()`,
                    [
                        tour.id || Math.floor(Math.random() * 100000),
                        slug,
                        tour.title || 'Untitled Tour',
                        tour.category || '',
                        tour.description || '',
                        tour.location || '',
                        tour.price || 0,
                        tour.duration || '',
                        tour.duration_days || null,
                        tour.group_size || '',
                        tour.difficulty || '',
                        tour.rating || 0,
                        tour.reviews || 0,
                        tour.bestTime || '',
                        tour.featured ? 1 : 0,
                        tour.listed !== false ? 1 : 0,
                        tour.image || '',
                        JSON.stringify(tour.gallery || []),
                        JSON.stringify(tour.highlights || []),
                        JSON.stringify(tour.inclusions || []),
                        JSON.stringify(tour.exclusions || []),
                        JSON.stringify(tour.activities || []),
                        JSON.stringify(tour.itinerary || []),
                        tour.primary_destination_id || tour.destination_id || null
                    ]
                );
                tourCount++;
            } catch (e) {
                console.error(`  ❌ Error: ${e.message}`);
            }
        }
        console.log(`  ✅ ${tourCount} tours migrated\n`);

        // 3. Migrate Enquiries
        console.log('📧 Migrating enquiries...');
        const enquiriesData = loadJson('enquiries.json');
        const enquiries = enquiriesData.enquiries || [];
        let eqCount = 0;

        for (const eq of enquiries) {
            try {
                await pool.query(
                    `INSERT INTO enquiries (id, name, email, phone, subject, message, tour_id, tour_name, destination, number_of_people, travel_date, status, notes, assigned_to, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
           ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), phone=VALUES(phone), subject=VALUES(subject), message=VALUES(message), status=VALUES(status), updated_at=NOW()`,
                    [
                        eq.id || Math.floor(Math.random() * 10000),
                        eq.name || 'Unknown',
                        eq.email || 'unknown@email.com',
                        eq.phone || '',
                        eq.subject || '',
                        eq.message || '',
                        eq.tour_id || null,
                        eq.tour_name || '',
                        eq.destination || '',
                        eq.number_of_people || '',
                        eq.travel_date || '',
                        eq.status || 'new',
                        eq.notes || '',
                        eq.assigned_to || ''
                    ]
                );
                eqCount++;
            } catch (e) {
                console.error(`  ❌ Error: ${e.message}`);
            }
        }
        console.log(`  ✅ ${eqCount} enquiries migrated\n`);

        // 4. Migrate Testimonials
        console.log('⭐ Migrating testimonials...');
        const testimonialsData = loadJson('testimonials.json');
        const testimonials = testimonialsData.testimonials || testimonialsData || [];
        let testCount = 0;

        for (const t of testimonials) {
            try {
                await pool.query(
                    `INSERT INTO testimonials (id, name, country, tour, rating, title, message, image, date, is_featured, is_approved, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
           ON DUPLICATE KEY UPDATE name=VALUES(name), country=VALUES(country), tour=VALUES(tour), rating=VALUES(rating), title=VALUES(title), message=VALUES(message), is_featured=VALUES(is_featured), is_approved=VALUES(is_approved), updated_at=NOW()`,
                    [
                        t.id || Math.floor(Math.random() * 10000),
                        t.name || 'Anonymous',
                        t.country || '',
                        t.tour || '',
                        t.rating || 5,
                        t.title || '',
                        t.message || '',
                        t.image || '',
                        t.date || '',
                        t.is_featured ? 1 : 0,
                        t.is_approved ? 1 : 0
                    ]
                );
                testCount++;
            } catch (e) {
                console.error(`  ❌ Error: ${e.message}`);
            }
        }
        console.log(`  ✅ ${testCount} testimonials migrated\n`);

        // 5. Migrate Activities
        console.log('🎯 Migrating activities...');
        const activitiesData = loadJson('activities.json');
        const activities = activitiesData.activities || activitiesData || [];
        let actCount = 0;

        for (const a of activities) {
            try {
                await pool.query(
                    `INSERT INTO activities (id, name, type, description, image, highlights, difficulty, best_time, duration, is_active, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
           ON DUPLICATE KEY UPDATE name=VALUES(name), type=VALUES(type), description=VALUES(description), image=VALUES(image), highlights=VALUES(highlights), difficulty=VALUES(difficulty), best_time=VALUES(best_time), duration=VALUES(duration), is_active=VALUES(is_active), updated_at=NOW()`,
                    [
                        a.id || Math.floor(Math.random() * 10000),
                        a.name || 'Unknown Activity',
                        a.type || 'adventure',
                        a.description || '',
                        a.image || '',
                        JSON.stringify(a.highlights || []),
                        a.difficulty || '',
                        a.bestTime || '',
                        a.duration || '',
                        a.is_active !== false ? 1 : 0
                    ]
                );
                actCount++;
            } catch (e) {
                console.error(`  ❌ Error: ${e.message}`);
            }
        }
        console.log(`  ✅ ${actCount} activities migrated\n`);

        // 6. Migrate Sliders
        console.log('🖼️ Migrating sliders...');
        const slidersData = loadJson('sliders.json');
        const sliders = slidersData.sliders || slidersData || [];
        let sliderCount = 0;

        for (const s of sliders) {
            try {
                await pool.query(
                    `INSERT INTO site_content (id, category, title, subtitle, location, image, video, button_text, button_url, button_style, show_button, order_index, is_active, created_at, updated_at)
           VALUES (?, 'slider', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
           ON DUPLICATE KEY UPDATE title=VALUES(title), subtitle=VALUES(subtitle), location=VALUES(location), image=VALUES(image), video=VALUES(video), button_text=VALUES(button_text), button_url=VALUES(button_url), button_style=VALUES(button_style), show_button=VALUES(show_button), order_index=VALUES(order_index), is_active=VALUES(is_active), updated_at=NOW()`,
                    [
                        s.id || Math.floor(Math.random() * 10000),
                        s.title || '',
                        s.subtitle || '',
                        s.location || '',
                        s.image || '',
                        s.video || '',
                        s.button_text || '',
                        s.button_url || '',
                        s.button_style || 'primary',
                        s.show_button ? 1 : 0,
                        s.order_index || 0,
                        s.is_active !== false ? 1 : 0
                    ]
                );
                sliderCount++;
            } catch (e) {
                console.error(`  ❌ Error: ${e.message}`);
            }
        }
        console.log(`  ✅ ${sliderCount} sliders migrated\n`);

        // 7. Migrate Team
        console.log('👥 Migrating team...');
        const teamData = loadJson('team.json');
        const team = teamData.team || teamData || [];
        let teamCount = 0;

        for (const m of team) {
            try {
                await pool.query(
                    `INSERT INTO team_members (id, name, position, bio, image, order_index, is_active, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
           ON DUPLICATE KEY UPDATE name=VALUES(name), position=VALUES(position), bio=VALUES(bio), image=VALUES(image), order_index=VALUES(order_index), is_active=VALUES(is_active), updated_at=NOW()`,
                    [
                        m.id || Math.floor(Math.random() * 10000),
                        m.name || 'Team Member',
                        m.position || '',
                        m.bio || '',
                        m.image || '',
                        m.order_index || 0,
                        m.is_active !== false ? 1 : 0
                    ]
                );
                teamCount++;
            } catch (e) {
                console.error(`  ❌ Error: ${e.message}`);
            }
        }
        console.log(`  ✅ ${teamCount} team members migrated\n`);

        // Re-enable foreign key checks
        await pool.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('🎉 Migration completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Destinations: ${destCount}`);
        console.log(`   - Tours: ${tourCount}`);
        console.log(`   - Enquiries: ${eqCount}`);
        console.log(`   - Testimonials: ${testCount}`);
        console.log(`   - Activities: ${actCount}`);
        console.log(`   - Sliders: ${sliderCount}`);
        console.log(`   - Team: ${teamCount}`);

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        await pool.query('SET FOREIGN_KEY_CHECKS = 1');
        process.exit(1);
    }

    process.exit(0);
}

migrate();
