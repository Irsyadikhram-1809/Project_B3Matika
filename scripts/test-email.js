/**
 * scripts/test-email.js
 * Script uji pengiriman email via SMTP.
 * Jalankan: node scripts/test-email.js
 * Tidak mencetak password ke konsol.
 */
import 'dotenv/config';
import nodemailer from 'nodemailer';

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const TEST_TO    = process.env.TEST_EMAIL_TO || EMAIL_USER; // kirim ke diri sendiri jika tidak di-set

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error('❌ ERROR: EMAIL_USER atau EMAIL_PASS tidak di-set di .env / .env.local');
  process.exit(1);
}

console.log(`📧 Mencoba kirim email dari: ${EMAIL_USER}`);
console.log(`📬 Tujuan email: ${TEST_TO}`);
console.log('🔐 App Password: [TERSEMBUNYI]');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

try {
  // Verifikasi koneksi SMTP sebelum kirim
  console.log('\n⏳ Memverifikasi koneksi SMTP...');
  await transporter.verify();
  console.log('✅ Koneksi SMTP berhasil!');

  console.log('\n⏳ Mengirim email uji...');
  const info = await transporter.sendMail({
    from: `"B3Matika Test" <${EMAIL_USER}>`,
    to: TEST_TO,
    subject: `[TEST] Email B3Matika — ${new Date().toLocaleString('id-ID')}`,
    text: `Halo!\n\nIni adalah email uji dari B3Matika.\nWaktu pengiriman: ${new Date().toISOString()}\n\nJika email ini sampai, konfigurasi SMTP sudah benar.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #2563eb; margin-top: 0;">B3Matika — Email Uji ✅</h2>
        <p>Halo!</p>
        <p>Ini adalah email uji dari B3Matika. Jika email ini sampai, konfigurasi SMTP sudah benar.</p>
        <p style="color: #64748b; font-size: 0.85rem;">Waktu: ${new Date().toLocaleString('id-ID')}</p>
      </div>
    `,
  });

  console.log('\n✅ Email berhasil dikirim!');
  console.log('   Message ID:', info.messageId);
  console.log('   Accepted  :', info.accepted);
  console.log('   Rejected  :', info.rejected);
} catch (err) {
  console.error('\n❌ GAGAL mengirim email!');
  console.error('   Kode error :', err.code || '-');
  console.error('   Pesan error:', err.message);
  if (err.responseCode) console.error('   SMTP code  :', err.responseCode);
  if (err.response)     console.error('   SMTP resp  :', err.response);
  console.error('\n💡 Kemungkinan penyebab:');
  console.error('   1. EMAIL_PASS bukan App Password Gmail (perlu 2FA aktif di akun Google)');
  console.error('   2. Akses "App dengan keamanan lebih rendah" dinonaktifkan (gunakan App Password)');
  console.error('   3. EMAIL_USER salah atau tidak ada');
  process.exit(1);
}
