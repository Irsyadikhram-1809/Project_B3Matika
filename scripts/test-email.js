/**
 * scripts/test-email.js
 * Uji pengiriman semua jenis email transaksional B3Matika.
 *
 * Jalankan: node --env-file=.env.local scripts/test-email.js
 * atau    : node scripts/test-email.js   (membaca dari .env / .env.local otomatis)
 *
 * Variabel yang dibutuhkan (lihat .env.example):
 *   EMAIL_PROVIDER  — gmail | smtp | resend (default: gmail)
 *   EMAIL_USER      — alamat pengirim
 *   EMAIL_PASS      — App Password Gmail / kata sandi SMTP
 *   TEST_EMAIL_TO   — penerima uji (default: EMAIL_USER)
 *   APP_BASE_URL    — URL aplikasi (default: http://localhost:5173)
 *
 * Script tidak mencetak password ke konsol.
 */
import 'dotenv/config';

// Impor fungsi email langsung dari otp.js agar menguji path produksi sebenarnya
// (bukan mock) — termasuk template HTML yang sama dengan yang dikirim ke pengguna.
import {
  kirimOTP,
  kirimEmailPermintaanAdmin,
  kirimTokenAdmin,
  kirimEmailPenolakan,
} from '../routes/_lib/otp.js';

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const TO         = process.env.TEST_EMAIL_TO || EMAIL_USER;
const BASE_URL   = process.env.APP_BASE_URL  || 'http://localhost:5173';

// ─── Validasi awal ─────────────────────────────────────────────────────────────
if (!EMAIL_USER || !EMAIL_PASS) {
  console.error('❌ ERROR: EMAIL_USER atau EMAIL_PASS tidak di-set di .env / .env.local');
  process.exit(1);
}
if (!TO) {
  console.error('❌ ERROR: TEST_EMAIL_TO tidak di-set dan EMAIL_USER kosong.');
  process.exit(1);
}

console.log('='.repeat(60));
console.log(' B3Matika — Uji Pengiriman Email');
console.log('='.repeat(60));
console.log(`  Penyedia : ${process.env.EMAIL_PROVIDER || 'gmail'}`);
console.log(`  Pengirim : ${EMAIL_USER}`);
console.log(`  Penerima : ${TO}`);
console.log(`  Base URL : ${BASE_URL}`);
console.log('');

// ─── Daftar pengujian ──────────────────────────────────────────────────────────
const tests = [
  {
    nama: '1. OTP Pendaftaran (dengan link verifikasi)',
    fn  : () => kirimOTP(TO, '382749', 'Pendaftaran', 'tok_contoh_link_abc123'),
  },
  {
    nama: '2. OTP Reset Sandi (tanpa link verifikasi)',
    fn  : () => kirimOTP(TO, '591204', 'Reset Sandi', null),
  },
  {
    nama: '3. Permintaan Token Admin ke Superadmin',
    fn  : () => kirimEmailPermintaanAdmin({
      nama       : 'Budi Santoso',
      username   : 'budi.santoso',
      email      : TO,
      waktu      : new Date().toISOString(),
      approveUrl : `${BASE_URL}/konfirmasi-admin?action=approve&token=tok_approve_contoh&id=1`,
      rejectUrl  : `${BASE_URL}/konfirmasi-admin?action=reject&token=tok_reject_contoh&id=1`,
    }),
  },
  {
    nama: '4. Token Admin Disetujui (ke pendaftar)',
    fn  : () => kirimTokenAdmin(TO, 'budi.santoso', 'TOKN_CONTOH_ABCD_1234_EFGH_5678'),
  },
  {
    nama: '5. Pemberitahuan Penolakan (ke pendaftar)',
    fn  : () => kirimEmailPenolakan(TO, 'budi.santoso'),
  },
];

// ─── Jalankan pengujian satu per satu ─────────────────────────────────────────
let gagal = 0;
for (const { nama, fn } of tests) {
  process.stdout.write(`\n  Mengirim: ${nama}\n  Status  : `);
  try {
    const info = await fn();
    const msgId = info?.messageId || info?.id || '(tidak tersedia)';
    console.log(`BERHASIL`);
    console.log(`  Message-ID: ${msgId}`);
  } catch (err) {
    console.log(`GAGAL`);
    console.error(`  Error: ${err.message}`);
    gagal++;
  }
}

// ─── Ringkasan ─────────────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(60));
const berhasil = tests.length - gagal;
console.log(`  Hasil: ${berhasil}/${tests.length} berhasil${gagal > 0 ? ` | ${gagal} GAGAL` : ''}`);

if (gagal === 0) {
  console.log('\n  Semua email berhasil dikirim.');
  console.log('  Langkah selanjutnya:');
  console.log('  1. Buka kotak masuk Gmail penerima.');
  console.log('  2. Jika masuk Spam: buka email, klik "Ini bukan spam".');
  console.log('  3. Klik "Tampilkan asli" (Show original) dan salin header');
  console.log('     Authentication-Results — periksa nilai SPF, DKIM, DMARC.');
  console.log('  4. Baca docs/EMAIL_DELIVERABILITY.md untuk langkah DNS jika');
  console.log('     masih masuk Spam setelah pakai penyedia transaksional.');
} else {
  console.log('\n  Ada email yang gagal dikirim.');
  console.log('  Cek konfigurasi EMAIL_PROVIDER, EMAIL_USER, EMAIL_PASS, SMTP_HOST.');
}
console.log('='.repeat(60) + '\n');

process.exit(gagal > 0 ? 1 : 0);
