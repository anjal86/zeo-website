ALTER TABLE uploaded_files
  ADD COLUMN field_name VARCHAR(120) NULL AFTER entity_id,
  ADD COLUMN stored_name VARCHAR(255) NULL AFTER original_name,
  ADD COLUMN width INT NULL AFTER size_bytes,
  ADD COLUMN height INT NULL AFTER width,
  ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

UPDATE uploaded_files
SET stored_name = file_name
WHERE stored_name IS NULL;
