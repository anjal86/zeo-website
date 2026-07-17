/**
 * =============================================================================
 * ZEO WEBSITE - PRODUCTION DATABASE CONFIGURATION
 * =============================================================================
 * MySQL Connection Pool using mysql2/promise
 * Replace this file's usage in server.js to switch from JSON to MySQL
 * =============================================================================
 */

const mysql = require('mysql2/promise');

// =============================================================================
// CONFIGURATION
// =============================================================================

// Load environment variables
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'zeo_user',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'zeo_website',
    waitForConnections: true,
    connectionLimit: process.env.DB_POOL_SIZE || 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// =============================================================================
// CONNECTION TEST
// =============================================================================

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connection established successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

// =============================================================================
// QUERY HELPERS
// =============================================================================

/**
 * Execute a query with parameters
 */
async function executeQuery(sql, params = []) {
    const [rows] = await pool.execute(sql, params);
    return rows;
}

/**
 * Get a single row
 */
async function getOne(sql, params = []) {
    const rows = await executeQuery(sql, params);
    return rows[0] || null;
}

/**
 * Get multiple rows
 */
async function getAll(sql, params = []) {
    return await executeQuery(sql, params);
}

/**
 * Insert a record and return the insertId
 */
async function insert(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;

    const result = await executeQuery(sql, values);
    return result.insertId;
}

/**
 * Update records
 */
async function update(table, data, where, whereParams = []) {
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');

    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    const params = [...Object.values(data), ...Object.values(where), ...whereParams];

    const result = await executeQuery(sql, params);
    return result.affectedRows;
}

/**
 * Delete records
 */
async function remove(table, where, params = []) {
    const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
    const sql = `DELETE FROM ${table} WHERE ${whereClause}`;

    const result = await executeQuery(sql, [...Object.values(where), ...params]);
    return result.affectedRows;
}

// =============================================================================
// DATA ACCESS METHODS
// =============================================================================

// Destinations
const Destinations = {
    async getAll() {
        return await getAll('SELECT * FROM destinations WHERE listed = TRUE ORDER BY name');
    },

    async getBySlug(slug) {
        return await getOne('SELECT * FROM destinations WHERE slug = ?', [slug]);
    },

    async getById(id) {
        return await getOne('SELECT * FROM destinations WHERE id = ?', [id]);
    }
};

// Tours
const Tours = {
    async getAll(filters = {}) {
        let sql = 'SELECT t.*, d.name as destination_name FROM tours t LEFT JOIN destinations d ON t.destination_id = d.id WHERE t.listed = TRUE';
        const params = [];

        if (filters.category) {
            sql += ' AND t.category = ?';
            params.push(filters.category);
        }
        if (filters.destination_id) {
            sql += ' AND t.destination_id = ?';
            params.push(filters.destination_id);
        }
        if (filters.featured) {
            sql += ' AND t.featured = TRUE';
        }

        sql += ' ORDER BY t.created_at DESC';

        return await getAll(sql, params);
    },

    async getBySlug(slug) {
        return await getOne(`
            SELECT t.*, d.name as destination_name, d.country as destination_country 
            FROM tours t 
            LEFT JOIN destinations d ON t.destination_id = d.id 
            WHERE t.slug = ? AND t.listed = TRUE
        `, [slug]);
    },

    async getById(id) {
        return await getOne('SELECT * FROM tours WHERE id = ?', [id]);
    },

    async getFeatured() {
        return await getAll('SELECT t.*, d.name as destination_name FROM tours t LEFT JOIN destinations d ON t.destination_id = d.id WHERE t.featured = TRUE AND t.listed = TRUE LIMIT 10');
    },

    async search(query) {
        return await getAll(`
            SELECT t.*, d.name as destination_name 
            FROM tours t 
            LEFT JOIN destinations d ON t.destination_id = d.id 
            WHERE t.listed = TRUE AND (t.title LIKE ? OR t.description LIKE ? OR t.location LIKE ?)
            LIMIT 20
        `, [`%${query}%`, `%${query}%`, `%${query}%`]);
    }
};

// Enquiries
const Enquiries = {
    async create(data) {
        return await insert('enquiries', {
            name: data.name,
            email: data.email,
            phone: data.phone || '',
            subject: data.subject || '',
            message: data.message,
            tour_id: data.tour_id || null,
            tour_name: data.tour_name || '',
            destination: data.destination || '',
            number_of_people: data.number_of_people || '',
            travel_date: data.travel_date || null,
            status: 'new',
            created_at: new Date()
        });
    },

    async getAll(filters = {}) {
        let sql = 'SELECT * FROM enquiries';
        const params = [];

        if (filters.status) {
            sql += ' WHERE status = ?';
            params.push(filters.status);
        }

        sql += ' ORDER BY created_at DESC';

        return await getAll(sql, params);
    },

    async updateStatus(id, status) {
        return await update('enquiries', { status, updated_at: new Date() }, { id });
    }
};

// Site Content (Sliders, Testimonials, etc.)
const SiteContent = {
    async getByCategory(category, activeOnly = true) {
        let sql = 'SELECT * FROM site_content WHERE category = ?';
        const params = [category];

        if (activeOnly) {
            sql += ' AND is_active = TRUE';
        }

        sql += ' ORDER BY order_index ASC';

        return await getAll(sql, params);
    },

    async getSliders() {
        return await this.getByCategory('slider');
    },

    async getTestimonials() {
        return await getAll('SELECT * FROM testimonials WHERE is_active = TRUE ORDER BY id DESC');
    },

    async getTeam() {
        return await getAll('SELECT * FROM team_members WHERE is_active = TRUE ORDER BY order_index ASC');
    },

    async getActivities() {
        return await getAll('SELECT * FROM activities WHERE is_active = TRUE ORDER BY name');
    },

    async getLogos(category = 'partner') {
        return await getAll('SELECT * FROM logos WHERE category = ? AND is_active = TRUE ORDER BY order_index ASC', [category]);
    }
};

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
    pool,
    query: executeQuery,
    testConnection,
    executeQuery,
    getOne,
    getAll,
    insert,
    update,
    remove,
    Destinations,
    Tours,
    Enquiries,
    SiteContent
};
