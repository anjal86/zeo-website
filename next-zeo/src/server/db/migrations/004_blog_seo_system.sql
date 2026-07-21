CREATE TABLE IF NOT EXISTS post_redirects (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  post_id BIGINT UNSIGNED NULL,
  old_slug VARCHAR(255) NOT NULL,
  new_slug VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_post_redirects_old_slug (old_slug),
  KEY idx_post_redirects_new_slug (new_slug),
  KEY idx_post_redirects_post_id (post_id),
  CONSTRAINT fk_post_redirects_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
