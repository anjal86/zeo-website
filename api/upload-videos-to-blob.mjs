/**
 * Upload local slider videos to Vercel Blob Storage
 * 
 * Usage:
 *   1. Set BLOB_READ_WRITE_TOKEN env var from Vercel dashboard
 *   2. Run: node upload-videos-to-blob.mjs
 * 
 * This will:
 *   - Upload all MP4s from api/uploads/sliders/videos/ to Vercel Blob
 *   - Update api/data/sliders.json with the new Blob URLs
 *   - Save a backup of the original sliders.json
 */

import { put } from '@vercel/blob';
import { readFileSync, writeFileSync, readdirSync, existsSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VIDEOS_DIR = join(__dirname, 'uploads', 'sliders', 'videos');
const SLIDERS_DATA = join(__dirname, 'data', 'sliders.json');

async function uploadVideos() {
    // Check for BLOB_READ_WRITE_TOKEN
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.error('❌ BLOB_READ_WRITE_TOKEN environment variable is not set.');
        console.error('   Set it in your terminal: export BLOB_READ_WRITE_TOKEN="your_token_here"');
        console.error('   Get it from: Vercel Dashboard → Storage → Blob → Copy token');
        process.exit(1);
    }

    // Check if videos directory exists
    if (!existsSync(VIDEOS_DIR)) {
        console.error(`❌ Videos directory not found: ${VIDEOS_DIR}`);
        process.exit(1);
    }

    // Get all MP4 files
    const videoFiles = readdirSync(VIDEOS_DIR).filter(f => f.endsWith('.mp4'));

    if (videoFiles.length === 0) {
        console.log('No video files found to upload.');
        process.exit(0);
    }

    console.log(`Found ${videoFiles.length} video files to upload:\n`);
    videoFiles.forEach(f => {
        const stats = readFileSync(join(VIDEOS_DIR, f));
        const mb = (stats.length / 1024 / 1024).toFixed(1);
        console.log(`  📹 ${f} (${mb} MB)`);
    });

    // Backup original sliders.json
    if (existsSync(SLIDERS_DATA)) {
        const backupPath = join(__dirname, 'data', 'sliders.json.blob-backup');
        copyFileSync(SLIDERS_DATA, backupPath);
        console.log(`\n📦 Backup saved: data/sliders.json.blob-backup`);
    }

    // Read current sliders
    const sliders = JSON.parse(readFileSync(SLIDERS_DATA, 'utf-8'));
    let updatedCount = 0;

    // Upload each video and update sliders
    for (const videoFile of videoFiles) {
        const filePath = join(VIDEOS_DIR, videoFile);
        const fileBuffer = readFileSync(filePath);

        console.log(`\n⬆️  Uploading ${videoFile}...`);

        try {
            const blob = await put(`videos/${videoFile}`, fileBuffer, {
                access: 'private',
                addRandomSuffix: false,
                token: process.env.BLOB_READ_WRITE_TOKEN,
            });

            console.log(`   ✅ Uploaded: ${blob.url}`);

            // Update slider entries that reference this video
            const localPath = `/uploads/sliders/videos/${videoFile}`;
            let matched = false;

            for (const slider of sliders) {
                if (slider.video === localPath) {
                    slider.video = blob.url;
                    matched = true;
                    updatedCount++;
                    console.log(`   🔄 Updated slider "${slider.title}" → Blob URL`);
                }
            }

            if (!matched) {
                console.log(`   ⚠️  No slider references "${localPath}" — uploaded but not linked`);
            }
        } catch (error) {
            console.error(`   ❌ Failed to upload ${videoFile}:`, error.message);
        }
    }

    // Save updated sliders.json
    writeFileSync(SLIDERS_DATA, JSON.stringify(sliders, null, 2), 'utf-8');
    console.log(`\n✅ Done! ${updatedCount} slider video references updated.`);
    console.log('   Updated sliders.json saved.');
    console.log('\n➡️  Now commit and push this change, then redeploy on Vercel.');
}

uploadVideos().catch(console.error);