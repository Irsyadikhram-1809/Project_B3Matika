import 'dotenv/config';

console.log("Memeriksa Environment Variables...");

// Helper untuk mencoba membaca modul env
try {
  // Ini akan melempar error dan langsung keluar (karena process.exit(1) di env.js)
  // jika ada env wajib yang kurang atau invalid.
  await import('../routes/_lib/env.js');
  console.log("✅ Semua Environment Variables wajib telah terisi dan valid!");
} catch (err) {
  // Catch block ini mungkin tidak terpanggil jika env.js melakukan process.exit(1)
  console.error("❌ Gagal memeriksa environment variables:");
  console.error(err.message);
  process.exit(1);
}
