import express from 'express';
import cors from 'cors';
import { resolve } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Auto-load semua file di dalam folder api/ sebagai route Express
async function loadRoutes() {
  const apiDir = resolve(__dirname, 'api');
  
  // Fungsi rekursif untuk membaca semua file
  function getFiles(dir, prefix = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let files = [];
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (entry.name === '_lib') continue; // abaikan folder _lib
        files = files.concat(getFiles(resolve(dir, entry.name), `${prefix}/${entry.name}`));
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        files.push({ path: resolve(dir, entry.name), route: `${prefix}/${entry.name.replace('.js', '')}` });
      }
    }
    return files;
  }

  const files = getFiles(apiDir);

  for (const file of files) {
    let routePath = `/api${file.route}`.replace(/\/index$/, '');
    
    // Ganti /[param] menjadi /:param untuk Express
    routePath = routePath.replace(/\[(.*?)\]/g, ':$1');

    try {
      // Import handler Vercel
      const module = await import(`file://${file.path}`);
      const handler = module.default;

      if (handler) {
        // Daftarkan route ke Express
        app.all(routePath, async (req, res) => {
          // Vercel menggabungkan params ke dalam req.query
          req.query = { ...req.query, ...req.params };
          
          try {
            await handler(req, res);
          } catch (err) {
            console.error(`Error di route ${routePath}:`, err);
            if (!res.headersSent) res.status(500).json({ error: 'Internal Server Error' });
          }
        });
        console.log(`✓ Terhubung: ${routePath}`);
      }
    } catch (e) {
      console.error(`Gagal memuat route ${routePath}:`, e);
    }
  }
}

loadRoutes().then(() => {
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`\n🚀 Backend lokal berjalan di http://localhost:${PORT}`);
    console.log(`API URL yang bisa diakses: http://localhost:${PORT}/api/home`);
    console.log(`\nPastikan di vite.config.js proxy mengarah ke http://localhost:${PORT}\n`);
  });
});
