import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Image Optimization Script for Oasis Application
 * 
 * This script analyzes images and provides optimization recommendations.
 * For actual compression, use external tools like:
 * - Squoosh.app (https://squoosh.app/)
 * - TinyPNG (https://tinypng.com/)
 * - Sharp library (npm install sharp)
 */

const assetsDir = path.join(__dirname, '../src/assets');
const publicImagesDir = path.join(__dirname, '../public/images');

// Size thresholds in KB
const THRESHOLDS = {
    CRITICAL: 500,  // > 500KB needs immediate optimization
    WARNING: 200,   // 200-500KB should be optimized
    OK: 100         // < 100KB is acceptable
};

function getFileSizeInKB(filePath) {
    const stats = fs.statSync(filePath);
    return Math.round(stats.size / 1024 * 100) / 100;
}

function analyzeDirectory(dir, results = []) {
    if (!fs.existsSync(dir)) {
        console.log(`⚠️  Directory not found: ${dir}`);
        return results;
    }

    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            analyzeDirectory(filePath, results);
        } else if (/\.(jpg|jpeg|png|webp)$/i.test(file)) {
            const sizeKB = getFileSizeInKB(filePath);
            let status = 'OK';
            let priority = 3;

            if (sizeKB > THRESHOLDS.CRITICAL) {
                status = 'CRITICAL';
                priority = 1;
            } else if (sizeKB > THRESHOLDS.WARNING) {
                status = 'WARNING';
                priority = 2;
            }

            results.push({
                file,
                path: filePath,
                sizeKB,
                status,
                priority
            });
        }
    });

    return results;
}

function generateReport(results) {
    console.log('\n' + '='.repeat(80));
    console.log('📊 IMAGE OPTIMIZATION ANALYSIS REPORT');
    console.log('='.repeat(80) + '\n');

    const sorted = results.sort((a, b) => a.priority - b.priority || b.sizeKB - a.sizeKB);

    const critical = sorted.filter(r => r.status === 'CRITICAL');
    const warning = sorted.filter(r => r.status === 'WARNING');
    const ok = sorted.filter(r => r.status === 'OK');

    const totalSize = results.reduce((sum, r) => sum + r.sizeKB, 0);
    const potentialSavings = critical.reduce((sum, r) => sum + (r.sizeKB * 0.7), 0) +
        warning.reduce((sum, r) => sum + (r.sizeKB * 0.4), 0);

    console.log(`📈 SUMMARY:`);
    console.log(`   Total Images: ${results.length}`);
    console.log(`   Total Size: ${Math.round(totalSize)} KB (${(totalSize / 1024).toFixed(2)} MB)`);
    console.log(`   Potential Savings: ~${Math.round(potentialSavings)} KB (${(potentialSavings / 1024).toFixed(2)} MB)\n`);

    if (critical.length > 0) {
        console.log(`🔴 CRITICAL (${critical.length} files - OPTIMIZE IMMEDIATELY):`);
        critical.forEach(r => {
            console.log(`   ${r.sizeKB.toString().padStart(8)} KB  ${r.file}`);
        });
        console.log('');
    }

    if (warning.length > 0) {
        console.log(`🟡 WARNING (${warning.length} files - SHOULD OPTIMIZE):`);
        warning.forEach(r => {
            console.log(`   ${r.sizeKB.toString().padStart(8)} KB  ${r.file}`);
        });
        console.log('');
    }

    if (ok.length > 0) {
        console.log(`🟢 OK (${ok.length} files - Acceptable size):`);
        ok.slice(0, 5).forEach(r => {
            console.log(`   ${r.sizeKB.toString().padStart(8)} KB  ${r.file}`);
        });
        if (ok.length > 5) {
            console.log(`   ... and ${ok.length - 5} more files`);
        }
        console.log('');
    }

    console.log('💡 RECOMMENDATIONS:');
    console.log('   1. Use https://squoosh.app/ for quick manual optimization');
    console.log('   2. Convert JPG/PNG to WebP format (25-35% smaller)');
    console.log('   3. Resize images to max 1920x1080 for hero images');
    console.log('   4. Target: Keep all images under 200KB');
    console.log('   5. Use lazy loading (already implemented in code)\n');

    console.log('🔧 NEXT STEPS:');
    if (critical.length > 0) {
        console.log(`   → Optimize ${critical.length} critical files first`);
    }
    if (warning.length > 0) {
        console.log(`   → Then optimize ${warning.length} warning files`);
    }
    console.log('   → Run this script again after optimization to verify\n');

    console.log('='.repeat(80) + '\n');
}

// Run analysis
console.log('🔍 Scanning for images...\n');

const results = [
    ...analyzeDirectory(assetsDir),
    ...analyzeDirectory(publicImagesDir)
];

if (results.length === 0) {
    console.log('❌ No images found in the specified directories.');
    console.log(`   Checked: ${assetsDir}`);
    console.log(`   Checked: ${publicImagesDir}`);
} else {
    generateReport(results);
}
