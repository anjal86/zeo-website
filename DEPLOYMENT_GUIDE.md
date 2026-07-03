# ZEO WEBSITE - MySQL MIGRATION & DEPLOYMENT GUIDE

This guide provides step-by-step instructions for migrating your Zeo Tourism website from flat-file JSON databases to MySQL and deploying to cPanel.

---

## PHASE 1: LOCAL DEVELOPMENT SETUP (DOCKER)

### Prerequisites
- Docker Desktop installed
- Node.js 18+ installed

### Step 1: Start Local MySQL with Docker

```bash
cd /Users/shrestha/Brandspire\ Work/zeo\ new\ project/zeopwebsite-new
docker-compose up -d
```

This will start:
- **MySQL 8.0** on port `3306`
- **phpMyAdmin** on port `8080`

### Step 2: Verify Containers Running

```bash
docker ps
```

You should see:
- `zeo-mysql` running on port 3306
- `zeo-phpmyadmin` running on port 8080

### Step 3: Access phpMyAdmin

Open browser: http://localhost:8080

**Login Credentials:**
- Server: `mysql`
- Username: `root`
- Password: `rootpassword`

### Step 4: Database is Auto-Created

The `schema.sql` file is automatically mounted and will create all tables when the container first starts.

---

## PHASE 2: RUN DATA MIGRATION

### Step 1: Install Dependencies

```bash
cd /Users/shrestha/Brandspire\ Work/zeo\ new\ project/zeopwebsite-new/api
npm install mysql2 dotenv
```

### Step 2: Run Migration Script

```bash
# Option 1: Using default values (localhost, root/rootpassword)
node migrate.js

# Option 2: Using environment variables
MYSQL_HOST=localhost \
MYSQL_PORT=3306 \
MYSQL_USER=root \
MYSQL_PASSWORD=rootpassword \
MYSQL_DATABASE=zeo_website \
node migrate.js
```

### Step 3: Verify Migration

1. Open phpMyAdmin at http://localhost:8080
2. Select `zeo_website` database
3. Check tables have data:
   - `destinations` - should have destination records
   - `tours` - should have tour records with itineraries
   - `enquiries` - should have enquiry records
   - `site_content` - should have slider records
   - `testimonials` - should have testimonial records

---

## PHASE 3: CPANEL DEPLOYMENT

### Step 1: Export Database from Local MySQL

**Using phpMyAdmin (GUI):**
1. Open http://localhost:8080
2. Select `zeo_website` database
3. Click **Export** tab
4. Choose **Quick** export method
5. Format: **SQL**
6. Click **Go** to download

**Using Command Line:**
```bash
mysqldump -u root -prootpassword zeo_website > zeo_website_backup.sql
```

**Compress for upload:**
```bash
gzip zeo_website_backup.sql
```

### Step 2: Create Database in cPanel

1. **Login to cPanel** (https://yourdomain.com/cpanel)
2. Navigate to **Databases** section
3. Click **MySQL Database Wizard**

**Create Database:**
- Step 1: Enter database name → Click "Next Step"
  ```
  Database Name: yourusername_zeo_website
  ```

**Create Database User:**
- Step 2: Create database user
  ```
  Username: yourusername_zeo_user
  Password: Use password generator (save this!)
  ```
- Step 3: Assign privileges → Check **ALL PRIVILEGES** → Click "Next Step"

**Save these credentials:**
```
DB_HOST: localhost
DB_NAME: yourusername_zeo_website
DB_USER: yourusername_zeo_user
DB_PASSWORD: [generated password]
```

### Step 3: Import Data via phpMyAdmin

1. In cPanel, go to **Databases** → **phpMyAdmin**
2. Select your new database from left sidebar
3. Click **Import** tab
4. Click **Choose File** and select your `zeo_website_backup.sql`
5. Scroll down and click **Go**

### Step 4: Upload API to cPanel

**Option A: Using File Manager**

1. In cPanel, go to **Files** → **File Manager**
2. Navigate to your API directory (e.g., `/public_html/api`)
3. Upload the following files:
   - `database.js` (new MySQL configuration)
   - `server.js` (modified to use database.js)
   - `.env` file with production credentials

**Option B: Using FTP/SFTP**

Upload the `api/` folder to your server.

### Step 5: Configure Environment Variables

Create `.env` file in your API directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=yourusername_zeo_website
DB_USER=yourusername_zeo_user
DB_PASSWORD=your_secure_password
DB_POOL_SIZE=10

# App Configuration
NODE_ENV=production
PORT=3000
```

### Step 6: Update server.js

Replace the JSON file reading with database calls. Here's an example:

**BEFORE (JSON):**
```javascript
const tours = JSON.parse(fs.readFileSync('./data/tours.json', 'utf8'));
app.get('/api/tours', (req, res) => {
    res.json(tours.tours);
});
```

**AFTER (MySQL):**
```javascript
const db = require('./database');

app.get('/api/tours', async (req, res) => {
    try {
        const tours = await db.Tours.getAll();
        res.json(tours);
    } catch (error) {
        console.error('Error fetching tours:', error);
        res.status(500).json({ error: 'Failed to fetch tours' });
    }
});
```

### Step 7: Test API Endpoint

```bash
curl https://yourdomain.com/api/tours
```

Should return JSON data from MySQL.

---

## EXAMPLE: Updating a Route Handler

Here's how to convert any route from JSON to MySQL:

### Example: Get All Tours

```javascript
// OLD - JSON based
app.get('/api/tours', (req, res) => {
    const data = JSON.parse(fs.readFileSync('./data/data/tours.json', 'utf8'));
    res.json(data.tours);
});

// NEW - MySQL based
const db = require('./database');

app.get('/api/tours', async (req, res) => {
    try {
        const tours = await db.Tours.getAll();
        res.json(tours);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});
```

### Example: Get Single Tour by Slug

```javascript
// OLD - JSON based
app.get('/api/tours/:slug', (req, res) => {
    const data = JSON.parse(fs.readFileSync('./data/data/tours.json', 'utf8'));
    const tour = data.tours.find(t => t.slug === req.params.slug);
    if (!tour) return res.status(404).json({ error: 'Not found' });
    res.json(tour);
});

// NEW - MySQL based
app.get('/api/tours/:slug', async (req, res) => {
    try {
        const tour = await db.Tours.getBySlug(req.params.slug);
        if (!tour) return res.status(404).json({ error: 'Not found' });
        res.json(tour);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});
```

### Example: Submit Enquiry

```javascript
// OLD - JSON based
app.post('/api/enquiries', (req, res) => {
    const data = JSON.parse(fs.readFileSync('./data/enquiries.json', 'utf8'));
    const newEnquiry = { id: Date.now(), ...req.body };
    data.enquiries.push(newEnquiry);
    fs.writeFileSync('./data/enquiries.json', JSON.stringify(data, null, 2));
    res.json({ success: true, id: newEnquiry.id });
});

// NEW - MySQL based
app.post('/api/enquiries', async (req, res) => {
    try {
        const id = await db.Enquiries.create(req.body);
        res.json({ success: true, id });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to submit enquiry' });
    }
});
```

---

## TROUBLESHOOTING

### Connection Issues

**Error: `ECONNREFUSED`**
- Check MySQL is running: `docker ps`
- Verify port 3306 is not blocked
- Check firewall settings

**Error: `Access denied`**
- Verify username/password in `.env`
- Ensure user has privileges to database

### Data Issues

**Missing data after migration**
- Check phpMyAdmin for table data
- Re-run migration: `node migrate.js`

**Itinerary not showing**
- Check individual tour detail files exist in `api/data/data/tour-details/`
- The migration script looks for matching slug files

### cPanel Issues

**500 Internal Server Error**
- Check error logs in cPanel: `Logs` → `Error Log`
- Verify `.env` file exists and has correct permissions
- Ensure Node.js version is correct (18+)

**Database connection failed**
- Verify credentials in `.env`
- Check database user has privileges
- Ensure `DB_HOST` is `localhost` (not 127.0.0.1)

---

## QUICK REFERENCE

### Docker Commands
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f mysql

# Access MySQL CLI
docker exec -it zeo-mysql mysql -u root -prootpassword
```

### Migration Script Options
```bash
# Run with custom database
node migrate.js

# View help
node migrate.js --help
```

### Useful SQL Queries
```sql
-- Check record counts
SELECT COUNT(*) FROM tours;
SELECT COUNT(*) FROM destinations;
SELECT COUNT(*) FROM enquiries;

-- View tours with destinations
SELECT t.title, d.name as destination 
FROM tours t 
LEFT JOIN destinations d ON t.destination_id = d.id
LIMIT 10;

-- Check migration status
SELECT * FROM migration_log;
```

---

## FILES CREATED

| File | Description |
|------|-------------|
| `docker-compose.yml` | Local MySQL + phpMyAdmin setup |
| `schema.sql` | Database schema with all tables |
| `api/migrate.js` | Data migration script |
| `api/database.js` | Production database module |
| `.env.example` | Environment variables template |

---

**End of Migration Guide**
