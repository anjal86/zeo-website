-- =============================================================================
-- ZEO WEBSITE DATABASE SCHEMA
-- MySQL 8.0 | Engine: InnoDB | Charset: utf8mb4 | Collate: utf8mb4_unicode_ci
-- =============================================================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS zeo_website 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE zeo_website;

-- =============================================================================
-- DESTINATIONS TABLE
-- =============================================================================
DROP TABLE IF EXISTS destinations;
CREATE TABLE destinations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) DEFAULT 'Nepal',
    description TEXT,
    image_url VARCHAR(500),
    highlights JSON,
    best_time VARCHAR(255),
    altitude VARCHAR(50),
    difficulty VARCHAR(50),
    tour_count INT DEFAULT 0,
    type VARCHAR(50),
    title VARCHAR(255),
    listed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_country (country),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TOURS TABLE
-- =============================================================================
DROP TABLE IF EXISTS tours;
CREATE TABLE tours (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    category VARCHAR(100),
    description LONGTEXT,
    location VARCHAR(100),
    price DECIMAL(10, 2) DEFAULT 0,
    duration VARCHAR(50),
    duration_days INT,
    group_size VARCHAR(50),
    difficulty VARCHAR(50),
    rating DECIMAL(3, 2) DEFAULT 0,
    reviews INT DEFAULT 0,
    best_time VARCHAR(255),
    featured BOOLEAN DEFAULT FALSE,
    listed BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(500),
    gallery JSON,
    highlights JSON,
    inclusions JSON,
    exclusions JSON,
    activities JSON,
    itinerary_json LONGTEXT,
    destination_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_category (category),
    INDEX idx_destination (destination_id),
    INDEX idx_featured (featured),
    INDEX idx_listed (listed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- ENQUIRIES TABLE
-- =============================================================================
DROP TABLE IF EXISTS enquiries;
CREATE TABLE enquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255),
    message TEXT,
    tour_id INT,
    tour_name VARCHAR(500),
    destination VARCHAR(100),
    number_of_people VARCHAR(20),
    travel_date DATE,
    status VARCHAR(50) DEFAULT 'new',
    assigned_to VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_tour (tour_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- SITE CONTENT TABLE (Flexible storage for sliders, testimonials, team, etc.)
-- =============================================================================
DROP TABLE IF EXISTS site_content;
CREATE TABLE site_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    name VARCHAR(255),
    title VARCHAR(255),
    subtitle VARCHAR(500),
    description TEXT,
    image_url VARCHAR(500),
    video_url VARCHAR(500),
    extra_data_json JSON,
    order_index INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_is_active (is_active),
    INDEX idx_order (order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- ADDITIONAL TABLES (Optional extensions)
-- =============================================================================

-- Blog Posts Table
DROP TABLE IF EXISTS blog_posts;
CREATE TABLE blog_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    content LONGTEXT,
    excerpt TEXT,
    image_url VARCHAR(500),
    author VARCHAR(255),
    category VARCHAR(100),
    tags JSON,
    published BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_category (category),
    INDEX idx_published (published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Team Members Table
DROP TABLE IF EXISTS team_members;
CREATE TABLE team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    bio TEXT,
    image_url VARCHAR(500),
    email VARCHAR(255),
    phone VARCHAR(50),
    linkedin VARCHAR(500),
    order_index INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_is_active (is_active),
    INDEX idx_order (order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Testimonials Table
DROP TABLE IF EXISTS testimonials;
CREATE TABLE testimonials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    content TEXT,
    rating INT DEFAULT 5,
    image_url VARCHAR(500),
    tour_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE SET NULL,
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activities Table
DROP TABLE IF EXISTS activities;
CREATE TABLE activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Logos/Partners Table
DROP TABLE IF EXISTS logos;
CREATE TABLE logos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    image_url VARCHAR(500),
    website_url VARCHAR(500),
    category VARCHAR(100),
    order_index INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- MIGRATION TRACKING TABLE
-- =============================================================================
DROP TABLE IF EXISTS migration_log;
CREATE TABLE migration_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    records_migrated INT DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- VIEW: Tours with Destination Info
-- =============================================================================
DROP VIEW IF EXISTS tours_with_destinations;
CREATE VIEW tours_with_destinations AS
SELECT 
    t.*,
    d.name AS destination_name,
    d.country AS destination_country
FROM tours t
LEFT JOIN destinations d ON t.destination_id = d.id;

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
