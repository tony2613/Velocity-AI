import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const svgSource = path.join(rootDir, 'client', 'src', 'assets', 'logo.svg');

if (!fs.existsSync(svgSource)) {
  console.error(`Source SVG not found at ${svgSource}`);
  process.exit(1);
}

async function run() {
  console.log('--- Generating All Application Icons, Google Favicons, and Splash Screens ---');
  
  // 1. Prepare master trimmed logo buffer
  const trimmedMaster = await sharp(svgSource).trim().toBuffer();
  const masterMeta = await sharp(trimmedMaster).metadata();
  const masterAspect = masterMeta.width / masterMeta.height;
  console.log(`Master logo loaded: ${masterMeta.width}x${masterMeta.height} (aspect ratio: ${masterAspect.toFixed(3)})`);

  // Helper: create centered logo on canvas
  async function createIcon({ width, height, logoRatio = 0.7, bg = { r: 255, g: 255, b: 255, alpha: 0 }, isRound = false }) {
    let logoW = Math.round(width * logoRatio);
    let logoH = Math.round(logoW / masterAspect);
    if (logoH > height * logoRatio) {
      logoH = Math.round(height * logoRatio);
      logoW = Math.round(logoH * masterAspect);
    }

    const resizedLogo = await sharp(trimmedMaster).resize(logoW, logoH).toBuffer();
    
    let base = sharp({
      create: {
        width,
        height,
        channels: 4,
        background: bg
      }
    });

    let result = await base.composite([{
      input: resizedLogo,
      top: Math.round((height - logoH) / 2),
      left: Math.round((width - logoW) / 2)
    }]).png().toBuffer();

    if (isRound) {
      const circleSvg = Buffer.from(
        `<svg width="${width}" height="${height}"><circle cx="${width/2}" cy="${height/2}" r="${Math.min(width, height)/2}" fill="#ffffff"/></svg>`
      );
      result = await sharp(result).composite([{
        input: circleSvg,
        blend: 'dest-in'
      }]).png().toBuffer();
    }

    return result;
  }

  // Helper to safely write file creating dirs if needed
  function safeWrite(destPath, buffer) {
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(destPath, buffer);
    console.log(`✓ Generated: ${path.relative(rootDir, destPath)}`);
  }

  // --- 1. Google-Compliant Favicons (Multiples of 48px square) ---
  console.log('\nGenerating Google-Compliant Favicons (48px multiples)...');
  
  // favicon-48x48.png (Exact Google Search base size)
  const fav48 = await createIcon({ width: 48, height: 48, logoRatio: 0.88 });
  safeWrite(path.join(rootDir, 'client', 'public', 'favicon-48x48.png'), fav48);

  // favicon-96x96.png (48 x 2)
  const fav96 = await createIcon({ width: 96, height: 96, logoRatio: 0.88 });
  safeWrite(path.join(rootDir, 'client', 'public', 'favicon-96x96.png'), fav96);

  // favicon-144x144.png (48 x 3)
  const fav144 = await createIcon({ width: 144, height: 144, logoRatio: 0.88 });
  safeWrite(path.join(rootDir, 'client', 'public', 'favicon-144x144.png'), fav144);

  // favicon.png (192x192, 48 x 4)
  const fav192 = await createIcon({ width: 192, height: 192, logoRatio: 0.88 });
  safeWrite(path.join(rootDir, 'client', 'public', 'favicon.png'), fav192);

  // favicon.svg (tightly trimmed SVG for modern browsers)
  let svgContent = fs.readFileSync(svgSource, 'utf8');
  svgContent = svgContent.replace(/viewBox="[^"]+"/, 'viewBox="191 1861 4299 2891"');
  safeWrite(path.join(rootDir, 'client', 'public', 'favicon.svg'), Buffer.from(svgContent, 'utf8'));

  // Generate multi-size favicon.ico using python PIL helper
  try {
    const makeIcoScript = path.join(rootDir, 'scripts', 'make_ico.py');
    const fav48Path = path.join(rootDir, 'client', 'public', 'favicon-48x48.png');
    const icoPath = path.join(rootDir, 'client', 'public', 'favicon.ico');
    execSync(`python "${makeIcoScript}" "${fav48Path}" "${icoPath}"`);
    console.log(`✓ Generated: client/public/favicon.ico (multi-size: 16x16, 32x32, 48x48)`);
  } catch (err) {
    console.warn('Could not generate multi-size ICO with Python, copying 48x48 PNG as fallback:', err.message);
    safeWrite(path.join(rootDir, 'client', 'public', 'favicon.ico'), fav48);
  }

  // --- 2. PWA & Web Assets ---
  console.log('\nGenerating Web & PWA assets...');
  
  // pwa-192x192.png (transparent)
  const pwa192 = await createIcon({ width: 192, height: 192, logoRatio: 0.72 });
  safeWrite(path.join(rootDir, 'client', 'public', 'pwa-192x192.png'), pwa192);

  // pwa-512x512.png (transparent)
  const pwa512 = await createIcon({ width: 512, height: 512, logoRatio: 0.72 });
  safeWrite(path.join(rootDir, 'client', 'public', 'pwa-512x512.png'), pwa512);

  // pwa-maskable-512x512.png (white bg, 58% safe-zone)
  const pwaMaskable512 = await createIcon({ 
    width: 512, 
    height: 512, 
    logoRatio: 0.58, 
    bg: { r: 255, g: 255, b: 255, alpha: 1 } 
  });
  safeWrite(path.join(rootDir, 'client', 'public', 'pwa-maskable-512x512.png'), pwaMaskable512);

  // apple-touch-icon.png (white bg, 180x180)
  const appleTouchIcon = await createIcon({ 
    width: 180, 
    height: 180, 
    logoRatio: 0.65, 
    bg: { r: 255, g: 255, b: 255, alpha: 1 } 
  });
  safeWrite(path.join(rootDir, 'client', 'public', 'apple-touch-icon.png'), appleTouchIcon);

  // Also update dist/public if exists
  const distPublic = path.join(rootDir, 'dist', 'public');
  if (fs.existsSync(distPublic)) {
    safeWrite(path.join(distPublic, 'favicon-48x48.png'), fav48);
    safeWrite(path.join(distPublic, 'favicon-96x96.png'), fav96);
    safeWrite(path.join(distPublic, 'favicon-144x144.png'), fav144);
    safeWrite(path.join(distPublic, 'favicon.png'), fav192);
    safeWrite(path.join(distPublic, 'favicon.svg'), Buffer.from(svgContent, 'utf8'));
    if (fs.existsSync(path.join(rootDir, 'client', 'public', 'favicon.ico'))) {
      safeWrite(path.join(distPublic, 'favicon.ico'), fs.readFileSync(path.join(rootDir, 'client', 'public', 'favicon.ico')));
    }
    safeWrite(path.join(distPublic, 'pwa-192x192.png'), pwa192);
    safeWrite(path.join(distPublic, 'pwa-512x512.png'), pwa512);
    safeWrite(path.join(distPublic, 'pwa-maskable-512x512.png'), pwaMaskable512);
    safeWrite(path.join(distPublic, 'apple-touch-icon.png'), appleTouchIcon);
  }

  // --- 3. Android Splash Screens (Capacitor) ---
  console.log('\nGenerating Android Splash Screens...');
  const splashScreens = [
    { file: 'android/app/src/main/res/drawable/splash.png', width: 480, height: 320, ratio: 0.35 },
    { file: 'android/app/src/main/res/drawable-port-mdpi/splash.png', width: 320, height: 480, ratio: 0.40 },
    { file: 'android/app/src/main/res/drawable-port-hdpi/splash.png', width: 480, height: 800, ratio: 0.40 },
    { file: 'android/app/src/main/res/drawable-port-xhdpi/splash.png', width: 720, height: 1280, ratio: 0.40 },
    { file: 'android/app/src/main/res/drawable-port-xxhdpi/splash.png', width: 960, height: 1600, ratio: 0.40 },
    { file: 'android/app/src/main/res/drawable-port-xxxhdpi/splash.png', width: 1280, height: 1920, ratio: 0.40 },
    { file: 'android/app/src/main/res/drawable-land-mdpi/splash.png', width: 480, height: 320, ratio: 0.35 },
    { file: 'android/app/src/main/res/drawable-land-hdpi/splash.png', width: 800, height: 480, ratio: 0.35 },
    { file: 'android/app/src/main/res/drawable-land-xhdpi/splash.png', width: 1280, height: 720, ratio: 0.35 },
    { file: 'android/app/src/main/res/drawable-land-xxhdpi/splash.png', width: 1600, height: 960, ratio: 0.35 },
    { file: 'android/app/src/main/res/drawable-land-xxxhdpi/splash.png', width: 1920, height: 1280, ratio: 0.35 }
  ];

  for (const s of splashScreens) {
    const splashBuf = await createIcon({
      width: s.width,
      height: s.height,
      logoRatio: s.ratio,
      bg: { r: 255, g: 255, b: 255, alpha: 1 }
    });
    safeWrite(path.join(rootDir, s.file), splashBuf);
  }

  // --- 4. Android Mipmap Launcher Icons ---
  console.log('\nGenerating Android Mipmap Icons...');
  const mipmaps = [
    { dir: 'mipmap-mdpi', iconSize: 48, fgSize: 108 },
    { dir: 'mipmap-hdpi', iconSize: 72, fgSize: 162 },
    { dir: 'mipmap-xhdpi', iconSize: 96, fgSize: 216 },
    { dir: 'mipmap-xxhdpi', iconSize: 144, fgSize: 324 },
    { dir: 'mipmap-xxxhdpi', iconSize: 192, fgSize: 432 }
  ];

  for (const m of mipmaps) {
    const iconBuf = await createIcon({
      width: m.iconSize,
      height: m.iconSize,
      logoRatio: 0.65,
      bg: { r: 255, g: 255, b: 255, alpha: 1 }
    });
    safeWrite(path.join(rootDir, 'android/app/src/main/res', m.dir, 'ic_launcher.png'), iconBuf);

    const iconRoundBuf = await createIcon({
      width: m.iconSize,
      height: m.iconSize,
      logoRatio: 0.65,
      bg: { r: 255, g: 255, b: 255, alpha: 1 },
      isRound: true
    });
    safeWrite(path.join(rootDir, 'android/app/src/main/res', m.dir, 'ic_launcher_round.png'), iconRoundBuf);

    const fgBuf = await createIcon({
      width: m.fgSize,
      height: m.fgSize,
      logoRatio: 0.56,
      bg: { r: 255, g: 255, b: 255, alpha: 0 }
    });
    safeWrite(path.join(rootDir, 'android/app/src/main/res', m.dir, 'ic_launcher_foreground.png'), fgBuf);
  }

  // --- 5. Android web assets sync ---
  const androidPublicAssets = path.join(rootDir, 'android/app/src/main/assets/public/public');
  if (fs.existsSync(androidPublicAssets)) {
    console.log('\nSyncing to Android web assets directory...');
    safeWrite(path.join(androidPublicAssets, 'pwa-192x192.png'), pwa192);
    safeWrite(path.join(androidPublicAssets, 'pwa-512x512.png'), pwa512);
    safeWrite(path.join(androidPublicAssets, 'favicon.png'), fav192);
    if (fs.existsSync(path.join(rootDir, 'client', 'public', 'favicon.ico'))) {
      safeWrite(path.join(androidPublicAssets, 'favicon.ico'), fs.readFileSync(path.join(rootDir, 'client', 'public', 'favicon.ico')));
    }
  }

  console.log('\n All assets, Google-compliant favicons, and splash screens successfully generated!');
}

run().catch(err => {
  console.error('Failed to generate assets:', err);
  process.exit(1);
});
