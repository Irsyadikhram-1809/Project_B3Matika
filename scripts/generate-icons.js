// scripts/generate-icons.js
// Jalankan: node scripts/generate-icons.js
// Membuat ikon PNG PWA dari public/images/logo.png

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');


async function generateIcons() {
  let sharp;
  try {
    const mod = await import('sharp');
    sharp = mod.default;
  } catch {
    console.error('sharp tidak tersedia. Install dulu: npm install --save-dev sharp');
    process.exit(1);
  }

  const src = path.join(projectRoot, 'public', 'images', 'logo.png');
  const outDir = path.join(projectRoot, 'public', 'images');

  if (!fs.existsSync(src)) {
    console.error('Logo tidak ditemukan di:', src);
    process.exit(1);
  }

  const sizes = [192, 512];
  const bg = { r: 5, g: 5, b: 7, alpha: 1 };

  for (const size of sizes) {
    await sharp(src)
      .resize(size, size, { fit: 'contain', background: bg })
      .png()
      .toFile(path.join(outDir, `icon-${size}.png`));
    console.log(`ok icon-${size}.png`);

    const safePad = Math.round(size * 0.1);
    const innerSize = size - safePad * 2;
    await sharp(src)
      .resize(innerSize, innerSize, { fit: 'contain', background: bg })
      .extend({ top: safePad, bottom: safePad, left: safePad, right: safePad, background: bg })
      .png()
      .toFile(path.join(outDir, `icon-maskable-${size}.png`));
    console.log(`ok icon-maskable-${size}.png`);
  }

  console.log('\nSemua ikon PWA berhasil dibuat di public/images/');
}

generateIcons().catch(console.error);
