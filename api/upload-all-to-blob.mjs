/**
 * Upload ALL media (images + videos) to Vercel Blob Storage
 * and update ALL JSON data files with new Blob URLs
 *
 * Usage:
 *   BLOB_READ_WRITE_TOKEN="your_token_here" node upload-all-to-blob.mjs
 *
 * STEP 1: This script uploads every media file from api/uploads/ to Blob
 * STEP 2: Updates all data JSON files with new Blob URLs
 * STEP 3: Saves backups of original JSON files
 */

import { put } from '@vercel/blob';
import { readFileSync, writeFileSync, readdirSync, existsSync, copyFileSync, mkdirSync, statSync } from 'fs';
import { join, dirname, extname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = join(__dirname, 'uploads');
const DATA_DIR = join(__dirname, 'data');
const BACKUP_DIR = join(__dirname, 'data', 'blob-migration-backups');

// Media file extensions to upload
const MEDIA_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.mov', '.avi', '.webm']);

// Track upload results
const uploaded = new Map(); // key: local path -> Blob URL

async function getAllMediaFiles(dir) {
    const files = [];

    function walk(currentDir) {
        const entries = readdirSync(currentDir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = join(currentDir, entry.name);
            if (entry.isDirectory()) {
                walk(fullPath);
            } else if (MEDIA_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
                files.push(fullPath);
            }
        }
    }

    walk(dir);
    return files;
}

function getLocalPath(filePath) {
    // Convert absolute path to relative upload path
    return '/' + relative(__dirname, filePath);
}

async function uploadAllMedia() {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.error('❌ BLOB_READ_WRITE_TOKEN environment variable is not set.');
        process.exit(1);
    }

    console.log('📁 Scanning for media files...\n');
    const mediaFiles = await getAllMediaFiles(UPLOADS_DIR);

    console.log(`Found ${mediaFiles.length} media files:\n`);

    // Group by directory
    const byDir = {};
    for (const f of mediaFiles) {
        const dir = dirname(f);
        if (!byDir[dir]) byDir[dir] = [];
        byDir[dir].push(f);
    }

    for (const [dir, files] of Object.entries(byDir)) {
        const shortDir = relative(__dirname, dir);
        console.log(`  📂 ${shortDir}/ (${files.length} files)`);
        for (const f of files) {
            const stats = statSync(f);
            const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
            console.log(`     📄 ${basename(f)} (${sizeMB} MB)`);
        }
    }

    // Create backup directory
    if (!existsSync(BACKUP_DIR)) {
        mkdirSync(BACKUP_DIR, { recursive: true });
    }

    console.log('\n⬆️  Starting uploads...\n');

    let successCount = 0;
    let failCount = 0;

    for (const filePath of mediaFiles) {
        const localPath = getLocalPath(filePath);
        const blobPath = localPath.replace(/^\/uploads\//, 'media/'); // store under media/
        const fileName = basename(filePath);
        const fileBuffer = readFileSync(filePath);
        const sizeMB = (fileBuffer.length / 1024 / 1024).toFixed(1);

        process.stdout.write(`  ⬆️  ${fileName} (${sizeMB} MB)... `);

        try {
            const blob = await put(blobPath, fileBuffer, {
                access: 'private',
                addRandomSuffix: false,
                token: process.env.BLOB_READ_WRITE_TOKEN,
            });

            uploaded.set(localPath, blob.url);
            process.stdout.write(`✅\n`);
            successCount++;
        } catch (error) {
            process.stdout.write(`❌ ${error.message}\n`);
            failCount++;
        }
    }

    console.log(`\n✅ Upload complete: ${successCount} succeeded, ${failCount} failed\n`);

    if (uploaded.size === 0) {
        console.log('No files uploaded. Exiting.');
        return;
    }

    // === STEP 2: Update ALL JSON data files ===
    console.log('📝 Updating data files with Blob URLs...\n');

    const jsonFiles = readdirSync(DATA_DIR).filter(f => f.endsWith('.json') && !f.includes('backup') && !f.includes('.blob-backup'));

    // Also check nested directories
    const allJsonFiles = [...jsonFiles.map(f => join(DATA_DIR, f))];
    for (const entry of readdirSync(DATA_DIR, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            const subFiles = readdirSync(join(DATA_DIR, entry.name)).filter(f => f.endsWith('.json'));
            for (const f of subFiles) {
                allJsonFiles.push(join(DATA_DIR, entry.name, f));
            }
        }
    }

    let totalUpdates = 0;

    for (const jsonFile of allJsonFiles) {
        const relativeName = relative(__dirname, jsonFile);
        const backupFile = join(BACKUP_DIR, basename(jsonFile) + '.backup');

        // Backup
        copyFileSync(jsonFile, backupFile);

        // Read and update
        let content = readFileSync(jsonFile, 'utf-8');
        let fileChanged = false;

        // Replace all local media paths with Blob URLs
        for (const [localPath, blobUrl] of uploaded) {
            // Match the local path in JSON (with and without leading /)
            const patterns = [
                localPath,
                localPath.replace(/^\//, ''),
            ];

            for (const pattern of patterns) {
                if (pattern.length < 10) continue; // skip very short matches
                const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const re = new RegExp(escaped, 'g');
                const matches = content.match(re);
                if (matches) {
                    content = content.replace(re, blobUrl);
                    fileChanged = true;
                    totalUpdates += matches.length;
                }
            }
        }

        if (fileChanged) {
            writeFileSync(jsonFile, content, 'utf-8');
            console.log(`  ✅ Updated ${relativeName}`);
        }
    }

    console.log(`\n✅ All done! ${totalUpdates} media references updated across ${allJsonFiles.length} data files.`);
    console.log(`   Backups saved in: data/blob-migration-backups/`);
    console.log(`\n▶️  Now run: git add -A && git commit -m "feat(media): migrate all media to Vercel Blob" && git push`);
}

function basename(p) {
    const parts = p.replace(/\\/g, '/').split('/');
    return parts[parts.length - 1];
}

uploadAllMedia().catch(console.error);