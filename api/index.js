import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { resolve, dirname } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dns from 'dns';
import { ensureSuperAdmin } from './_lib/seed.js';

dns.setDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Pastikan superadmin ter-seed
ensureSuperAdmin().catch(console.error);

const app = express();
app.use(cors());
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Terlalu banyak permintaan, coba lagi nanti.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth', authLimiter);

let loadedRoutesCount = 0;
const routesDir = resolve(__dirname, '../routes');

async function loadRoutes() {
  function getFiles(dir, prefix = '') {
    if (!fs.existsSync(dir)) return [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let files = [];
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (entry.name === '_lib') continue;
        files = files.concat(getFiles(resolve(dir, entry.name), `${prefix}/${entry.name}`));
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        files.push({ path: resolve(dir, entry.name), route: `${prefix}/${entry.name.replace('.js', '')}` });
      }
    }
    return files;
  }

  const files = getFiles(routesDir);

  for (const file of files) {
    let routePath = `/api${file.route}`.replace(/\/index$/, '');
    routePath = routePath.replace(/\[(.*?)\]/g, ':$1');

    try {
      const module = await import(`file://${file.path}`);
      const handler = module.default;

      if (handler) {
        loadedRoutesCount++;
        app.all(routePath, async (req, res) => {
          Object.defineProperty(req, 'query', {
            value: { ...req.query, ...req.params },
            writable: true,
            configurable: true,
            enumerable: true
          });
          
          try {
            await handler(req, res);
          } catch (err) {
            console.error(`Error di route ${routePath}:`, err);
            if (!res.headersSent) res.status(500).json({ error: err.message || 'Internal Server Error' });
          }
        });
        console.log(`Terhubung: ${routePath}`);
      }
    } catch (e) {
      console.error(`Gagal memuat route ${routePath}:`, e);
    }
  }
}

await loadRoutes();

app.use((req, res) => {
  console.warn(`[404] API Route Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Rute API tidak ditemukan.' });
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`\nBackend lokal berjalan di http://localhost:${PORT}`);
    console.log(`API URL yang bisa diakses: http://localhost:${PORT}/api/home\n`);
  });
}

export default app;
