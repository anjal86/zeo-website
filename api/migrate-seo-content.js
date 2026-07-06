const fs = require('fs');
const path = require('path');
const db = require('./database');

// Hardcoded SEO content from frontend
const seoContent = {
  nepal: {
    seo_intro: 'Explore Nepal pilgrimage, cultural tours, Himalayan routes, helicopter options, family trips and private itineraries planned from Kathmandu with route clarity and local support.',
    seo_best_time: 'Spring and autumn are popular for Himalayan routes; cultural and pilgrimage tours can be planned across more months depending on destination.',
    seo_planning_note: 'Nepal routes depend heavily on season, road condition, altitude, permits and local support planning. The right route changes with age group, travel purpose, walking ability and available days.',
    seo_guide_blocks: [
      { title: 'Match the route to the traveller', body: 'A Nepal tour should not be chosen only by destination name. Pilgrimage groups, families, senior travellers, trekkers and private groups need different pacing, hotel standards, transport choices and support levels.', icon: 'Users' },
      { title: 'Check timing and access first', body: 'Road condition, flight reliability, altitude, weather and festival demand can change the best route. We help compare what is realistic before the itinerary is finalized.', icon: 'Calendar' },
      { title: 'Plan permits and ground support', body: 'Some Nepal routes need permits, local coordination, vehicle planning, guide support or altitude preparation. These details are easier to solve before booking than during the journey.', icon: 'Shield' },
    ],
    seo_faqs: [
      { question: 'Which Nepal tour is best for first-time visitors?', answer: 'Kathmandu, Pokhara, Nagarkot, Chitwan, Lumbini and Muktinath are common choices, but the best route depends on travel days, group age, budget and whether the purpose is culture, pilgrimage or nature.' },
      { question: 'Can Nepal tours be customized for families or senior travellers?', answer: 'Yes. Nepal tours can be customized with slower pacing, easier road sectors, private vehicles, selected hotels and support based on the traveller profile.' },
    ],
  },
  thailand: {
    seo_intro: 'Plan Thailand with clarity around Bangkok city stays, island holidays, family trips, honeymoon-style travel and Thailand–Malaysia–Singapore combinations from Nepal.',
    seo_best_time: 'November to March is the most popular period; beach routes can vary by coast and season.',
    seo_planning_note: 'Thailand works well for short holidays, honeymoon-style travel and add-on routes with Malaysia or Singapore. The biggest planning mistake is choosing hotels and transfers before understanding the travel pace.',
    seo_guide_blocks: [
      { title: 'Choose the right base', body: 'Bangkok, Pattaya, Phuket, Krabi and island routes offer different travel experiences. The best choice depends on budget, group type, transfer tolerance and whether the trip is for leisure, family or celebration.', icon: 'MapPin' },
      { title: 'Balance pace and transfers', body: 'A short Thailand tour should avoid too many hotel changes. We help structure days so sightseeing, airport transfers, beach time and optional activities feel smooth instead of rushed.', icon: 'Route' },
      { title: 'Plan support before booking', body: 'Travellers from Nepal often need clarity on documents, hotel area, pickup timing, local support and how to combine Thailand with nearby destinations. These details should be solved before payment.', icon: 'Shield' },
    ],
    seo_faqs: [
      { question: 'How many days are enough for Thailand from Nepal?', answer: 'A short Bangkok or Pattaya trip can work in 4–5 days, while beach routes or multi-country combinations usually need 7–10 days for a better pace.' },
      { question: 'Can Thailand be combined with Malaysia or Singapore?', answer: 'Yes. Thailand, Malaysia and Singapore can be combined, but the route should be planned around flight timing, transfers, hotel locations and total travel days.' },
    ],
  },
  china: {
    seo_intro: 'Plan China, Tibet and connected routes with practical timing, documentation, permit coordination and route clarity for travellers starting from Nepal.',
    seo_best_time: 'Spring and autumn are generally preferred for comfortable travel and clearer route planning.',
    seo_planning_note: 'China-related routes often need stronger document, timing and permit coordination before booking. The route should be confirmed only after checking travel requirements.',
    seo_guide_blocks: [
      { title: 'Start with documents', body: 'China and Tibet-related travel needs document clarity before hotel or flight commitment. Requirements can affect route, timing and group planning.', icon: 'Shield' },
      { title: 'Plan route feasibility', body: 'Long-distance sectors, border timing and guided-route rules should be understood early. This prevents unrealistic itinerary promises.', icon: 'Route' },
      { title: 'Choose support level', body: 'Guided support, transfers and communication matter more on cross-border routes than simple city breaks.', icon: 'Users' },
    ],
    seo_faqs: [
      { question: 'Can China routes be planned from Nepal?', answer: 'Yes, but document requirements, timing and route feasibility should be checked before confirming a package.' },
      { question: 'Is Tibet planning different from normal China travel?', answer: 'Yes. Tibet-related travel usually requires more careful permit, route and support planning.' },
    ],
  },
};

async function migrate() {
    console.log('Migrating SEO content into destinations.json and MySQL...');

    // 1. Update JSON
    const dataPath = path.join(__dirname, 'data', 'destinations.json');
    if (fs.existsSync(dataPath)) {
        const destinations = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        let updatedCount = 0;

        for (const dest of destinations) {
            const slug = dest.slug;
            if (seoContent[slug]) {
                const seo = seoContent[slug];
                dest.seo_intro = seo.seo_intro;
                dest.seo_best_time = seo.seo_best_time;
                dest.seo_planning_note = seo.seo_planning_note;
                dest.seo_guide_blocks = seo.seo_guide_blocks;
                dest.seo_faqs = seo.seo_faqs;
                updatedCount++;
            }
        }

        fs.writeFileSync(dataPath, JSON.stringify(destinations, null, 2), 'utf8');
        console.log(`Updated ${updatedCount} destinations in JSON file.`);
    } else {
        console.warn('destinations.json not found!');
    }

    // 2. Update MySQL
    try {
        const connection = await db.pool.getConnection();
        
        // Ensure columns exist (ALTER TABLE)
        try {
            await connection.query(`ALTER TABLE destinations ADD COLUMN seo_intro TEXT, ADD COLUMN seo_best_time TEXT, ADD COLUMN seo_planning_note TEXT, ADD COLUMN seo_guide_blocks JSON, ADD COLUMN seo_faqs JSON;`);
            console.log('Successfully added columns to MySQL destinations table.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('Columns already exist in MySQL destinations table, skipping ALTER.');
            } else {
                console.error('Error altering table (it might not exist):', e.message);
            }
        }

        // Run updates
        for (const [slug, seo] of Object.entries(seoContent)) {
            const guideBlocksJson = JSON.stringify(seo.seo_guide_blocks);
            const faqsJson = JSON.stringify(seo.seo_faqs);

            try {
                const [result] = await connection.query(`
                    UPDATE destinations 
                    SET seo_intro = ?, seo_best_time = ?, seo_planning_note = ?, seo_guide_blocks = ?, seo_faqs = ?
                    WHERE slug = ?
                `, [seo.seo_intro, seo.seo_best_time, seo.seo_planning_note, guideBlocksJson, faqsJson, slug]);
                
                if (result.affectedRows > 0) {
                    console.log(`Updated MySQL record for slug: ${slug}`);
                }
            } catch (err) {
                 console.error(`Error updating MySQL for ${slug}:`, err.message);
            }
        }

        connection.release();
    } catch (err) {
        console.error('Could not connect to MySQL to run migration (this is fine if using JSON only):', err.message);
    }

    console.log('Migration complete!');
    process.exit(0);
}

migrate();
