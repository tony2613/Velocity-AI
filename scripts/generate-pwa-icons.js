
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const inputFile = path.join(rootDir, 'client', 'public', 'favicon.png');
const outputDir = path.join(rootDir, 'client', 'public');

async function generateIcons() {
    console.log(`Generating icons from ${inputFile}...`);

    if (!fs.existsSync(inputFile)) {
        console.error('favicon.png not found');
        process.exit(1);
    }

    await sharp(inputFile)
        .resize(192, 192)
        .toFile(path.join(outputDir, 'pwa-192x192.png'));
    console.log('Generated pwa-192x192.png');

    await sharp(inputFile)
        .resize(512, 512)
        .toFile(path.join(outputDir, 'pwa-512x512.png'));
    console.log('Generated pwa-512x512.png');

    console.log('PWA icons generation complete.');
}

generateIcons().catch(err => console.error(err));
