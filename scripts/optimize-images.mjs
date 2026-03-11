#!/usr/bin/env node
/**
 * Script to optimize images in public/picture/
 * Converts images to WebP and reduces resolution to max 1920px width
 *
 * Usage: node scripts/optimize-images.mjs
 *
 * Requires: npm install sharp --save-dev
 */

import { readdir, mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PICTURE_DIR = path.join(__dirname, "..", "public", "picture");
const BACKUP_DIR = path.join(__dirname, "..", "public", "picture-backup");
const MAX_WIDTH = 1920;
const QUALITY = 80;
const VALID_EXTENSIONS = new Set([".png", ".jpg", ".jpeg"]);

async function optimizeImages() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.error("Error: sharp is not installed.");
    console.error("Run: npm install sharp --save-dev");
    process.exit(1);
  }

  console.log("Starting image optimization...\n");

  const files = await readdir(PICTURE_DIR, { withFileTypes: true });
  const imageFiles = files
    .filter((file) => file.isFile())
    .map((file) => file.name)
    .filter((fileName) => VALID_EXTENSIONS.has(path.extname(fileName).toLowerCase()));

  if (imageFiles.length === 0) {
    console.log("No images found to optimize.");
    return;
  }

  // Create backup directory
  await mkdir(BACKUP_DIR, { recursive: true });
  console.log(`Created backup directory: ${BACKUP_DIR}\n`);

  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;

  for (const fileName of imageFiles) {
    const inputPath = path.join(PICTURE_DIR, fileName);
    const baseName = path.parse(fileName).name;
    const outputPath = path.join(PICTURE_DIR, `${baseName}.webp`);
    const backupPath = path.join(BACKUP_DIR, fileName);

    try {
      const image = sharp(inputPath);
      const metadata = await image.metadata();
      const originalSize = metadata.size || 0;
      totalOriginalSize += originalSize;

      // Move original to backup
      await sharp(inputPath).toFile(backupPath);

      // Resize and convert to WebP
      let pipeline = image;
      if (metadata.width && metadata.width > MAX_WIDTH) {
        pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
      }

      await pipeline.webp({ quality: QUALITY }).toFile(outputPath);

      // Get new file size
      const optimizedMetadata = await sharp(outputPath).metadata();
      const optimizedSize = optimizedMetadata.size || 0;
      totalOptimizedSize += optimizedSize;

      // Remove original file (if different from output)
      if (inputPath !== outputPath) {
        await unlink(inputPath);
      }

      const reduction = ((1 - optimizedSize / originalSize) * 100).toFixed(1);
      console.log(
        `${fileName} -> ${baseName}.webp | ${(originalSize / 1024 / 1024).toFixed(2)}MB -> ${(optimizedSize / 1024 / 1024).toFixed(2)}MB (${reduction}% reduction)`
      );
    } catch (error) {
      console.error(`Error processing ${fileName}:`, error.message);
    }
  }

  console.log("\n--- Summary ---");
  console.log(`Total original size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total optimized size: ${(totalOptimizedSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total reduction: ${((1 - totalOptimizedSize / totalOriginalSize) * 100).toFixed(1)}%`);
  console.log(`\nBackups saved to: ${BACKUP_DIR}`);
}

optimizeImages().catch(console.error);
