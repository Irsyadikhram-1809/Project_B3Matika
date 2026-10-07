/**
 * routes/_lib/otp.js
 * Helper: OTP, email SMTP via Nodemailer, dan link verifikasi.
 */
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import env from './env.js';

// ─── Transporter (singleton) ─────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

// ─── Primitif kriptografi ─────────────────────────────────────────────────────
export const hmac = (v) =>
  crypto.createHmac('sha256', env.OTP_SECRET).update(String(v)).digest('hex');

/** Hash dengan SHA-256 standar, dipakai untuk token random (admin invite, link verif). */
export const sha256 = (v) =>
  crypto.createHash('sha256').update(String(v)).digest('hex');

export const safeEqual = (a, b) => {
  try {
    const x = Buffer.from(String(a));
    const y = Buffer.from(String(b));
    return x.length === y.length && crypto.timingSafeEqual(x, y);
  } catch {
    return false;
  }
};

export const buatOTP = () => crypto.randomInt(100000, 1000000).toString();

/** Buat token URL-safe acak. Minimal 32 byte → 43 karakter base64url. */
export const buatToken = (bytes = 32) =>
  crypto.randomBytes(bytes).toString('base64url');

// ─── Template wrapper HTML ────────────────────────────────────────────────────
function wrapHtml(innerHtml) {
  return `<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
         style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:12px;
                overflow:hidden;box-shadow:0 4px 24px rgba(37,99,235,0.08);border:1px solid #e2e8f0;">
    <tr>
      <td style="background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);padding:28px 32px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:26px;letter-spacing:2px;font-weight:800;">B3Matika</h1>
        <p style="margin:4px 0 0;color:#bfdbfe;font-size:13px;">Belajar, Berlatih, Bermain</p>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        ${innerHtml}
      </td>
    </tr>
    <tr>
      <td style="background:#f1f5f9;padding:16px 32px;text-align:center;font-size:12px;color:#94a3b8;">
        B3 : Belajar, Berlatih, Bermain &copy; ${new Date().getFullYear()} B3Matika<br>
        Abaikan email ini jika Anda tidak merasa mendaftar.
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Kirim OTP + Link Verifikasi ─────────────────────────────────────────────
/**
 * Kirim email OTP pendaftaran, dengan tombol verifikasi lewat tautan.
 * @param {string} to - email tujuan
 * @param {string} otp - kode OTP 6 digit
 * @param {string} tujuan - label tujuan (mis. "Pendaftaran")
 * @param {string|null} linkToken - token untuk link verifikasi (null jika tidak ada)
 * @throws Error jika SMTP gagal
 */
export async function kirimOTP(to, otp, tujuan, linkToken = null) {
  const linkSection = linkToken
    ? `
      <div style="text-align:center;margin:24px 0;">
        <a href="${env.APP_BASE_URL}/verifikasi-email?token=${encodeURIComponent(linkToken)}&email=${encodeURIComponent(to)}"
           style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;
                  padding:14px 32px;border-radius:8px;font-size:15px;font-weight:700;
                  text-decoration:none;letter-spacing:0.5px;">
          ✅ Verifikasi Email
        </a>
        <p style="font-size:12px;color:#94a3b8;margin:12px 0 0;">
          Tautan berlaku 10 menit dan hanya untuk satu kali pakai.
        </p>
      </div>
      <div style="text-align:center;color:#64748b;font-size:13px;margin:16px 0;">— atau gunakan kode di bawah —</div>
    `
    : '';

  const html = wrapHtml(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;">Halo! 👋</h2>
    <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Berikut adalah kode verifikasi untuk <strong>${tujuan}</strong> akun B3Matika Anda.
    </p>
    ${linkSection}
    <div style="background:#f8fafc;border:2px dashed #cbd5e1;border-radius:10px;
                padding:24px;text-align:center;margin:20px 0;">
      <div style="font-size:13px;color:#64748b;margin-bottom:8px;">Kode OTP</div>
      <span style="font-size:36px;font-weight:800;letter-spacing:10px;color:#f97316;font-family:monospace;">
        ${otp}
      </span>
    </div>
    <p style="font-size:13px;color:#64748b;line-height:1.5;">
      Kode ini berlaku selama <strong>10 menit</strong>. Jangan bagikan kepada siapa pun, termasuk pihak yang mengaku dari B3Matika.
    </p>
  `);

  const text = `Halo!\n\nKode verifikasi untuk ${tujuan} B3Matika Anda: ${otp}\n\nBerlaku 10 menit. Jangan bagikan ke siapa pun.\n${linkToken ? `\nAtau verifikasi lewat tautan:\n${env.APP_BASE_URL}/verifikasi-email?token=${encodeURIComponent(linkToken)}&email=${encodeURIComponent(to)}\n` : ''}\nB3Matika — Belajar, Berlatih, Bermain`;

  try {
    await transporter.sendMail({
      from: `"B3Matika" <${env.EMAIL_USER}>`,
      to,
      subject: `Kode Verifikasi ${tujuan} B3Matika`,
      text,
      html,
    });
  } catch (error) {
    console.error('❌ Gagal mengirim OTP email ke', to, ':', error.code || error.message);
    // Lempar ulang agar pemanggil tahu gagal dan bisa batalkan request
    throw new Error(`Gagal mengirim email ke ${to}. Pastikan EMAIL_USER dan EMAIL_PASS (App Password Gmail) sudah benar di konfigurasi server.`);
  }
}

// ─── Kirim Email Notifikasi Umum ─────────────────────────────────────────────
/**
 * Kirim email HTML umum (notifikasi, konfirmasi, dll).
 * Berbeda dengan versi lama: ERROR DILEMPAR ULANG agar pemanggil tahu.
 * @throws Error jika SMTP gagal
 */
export async function kirimEmailNotifikasi(to, subject, htmlContent, textContent) {
  const html = wrapHtml(htmlContent);
  try {
    await transporter.sendMail({
      from: `"B3Matika" <${env.EMAIL_USER}>`,
      to,
      subject,
      text: textContent || '',
      html,
    });
  } catch (error) {
    console.error('❌ Gagal mengirim notifikasi email ke', to, ':', error.code || error.message);
    throw new Error(`Gagal mengirim email notifikasi: ${error.message}`);
  }
}

// ─── Kirim Email Permintaan Token Admin ke Superadmin ────────────────────────
/**
 * Kirim email ke superadmin berisi permintaan token admin dari pendaftar.
 * Tombol approve/reject membuka halaman konfirmasi (GET), bukan langsung aksi.
 * @throws Error jika SMTP gagal
 */
export async function kirimEmailPermintaanAdmin({ nama, username, email, waktu, approveUrl, rejectUrl }) {
  const waktuStr = new Date(waktu).toLocaleString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta'
  });

  const html = wrapHtml(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;">📨 Permintaan Token Admin Baru</h2>
    <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Seseorang meminta token khusus untuk mendaftar sebagai <strong>Admin B3Matika</strong>.
    </p>

    <table style="width:100%;border-collapse:collapse;margin:0 0 24px;font-size:14px;">
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:10px 0;color:#64748b;width:130px;">Nama Lengkap</td>
        <td style="padding:10px 0;font-weight:600;color:#1e293b;">${escEmail(nama)}</td>
      </tr>
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:10px 0;color:#64748b;">Username</td>
        <td style="padding:10px 0;font-weight:600;color:#1e293b;">@${escEmail(username)}</td>
      </tr>
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:10px 0;color:#64748b;">Email</td>
        <td style="padding:10px 0;font-weight:600;color:#1e293b;">${escEmail(email)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;color:#64748b;">Waktu Permintaan</td>
        <td style="padding:10px 0;color:#1e293b;">${waktuStr} WIB</td>
      </tr>
    </table>

    <p style="color:#475569;font-size:14px;margin:0 0 20px;">
      Klik tombol di bawah untuk meninjau dan mengambil keputusan. Anda akan diarahkan ke halaman konfirmasi.
      <strong>Tautan berlaku 24 jam.</strong>
    </p>

    <div style="text-align:center;margin:24px 0;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
      <a href="${approveUrl}"
         style="display:inline-block;background:#16a34a;color:#fff;padding:14px 28px;
                border-radius:8px;font-size:15px;font-weight:700;text-decoration:none;margin:4px;">
        ✅ Setujui &amp; Kirim Token
      </a>
      <a href="${rejectUrl}"
         style="display:inline-block;background:#dc2626;color:#fff;padding:14px 28px;
                border-radius:8px;font-size:15px;font-weight:700;text-decoration:none;margin:4px;">
        ❌ Tolak Permintaan
      </a>
    </div>

    <p style="font-size:12px;color:#94a3b8;text-align:center;margin:16px 0 0;">
      Jika tombol tidak berfungsi, salin URL ini ke browser:<br>
      Setujui: <code style="word-break:break-all;">${approveUrl}</code>
    </p>
  `);

  const text = `Permintaan Token Admin Baru\n\nNama: ${nama}\nUsername: @${username}\nEmail: ${email}\nWaktu: ${waktuStr} WIB\n\nSetujui: ${approveUrl}\nTolak: ${rejectUrl}\n\nTautan berlaku 24 jam.`;

  try {
    await transporter.sendMail({
      from: `"B3Matika" <${env.EMAIL_USER}>`,
      to: env.SUPERADMIN_EMAIL,
      subject: `[B3Matika] Permintaan Token Admin dari ${username}`,
      text,
      html,
    });
  } catch (error) {
    console.error('❌ Gagal mengirim email permintaan admin:', error.code || error.message);
    throw new Error(`Gagal mengirim email ke superadmin: ${error.message}`);
  }
}

// ─── Kirim Token ke Pendaftar Admin ──────────────────────────────────────────
export async function kirimTokenAdmin(to, username, token) {
  const html = wrapHtml(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;">🎉 Token Admin Anda Telah Disetujui!</h2>
    <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Halo <strong>${escEmail(username)}</strong>! Superadmin B3Matika telah menyetujui permintaan Anda.
      Gunakan token khusus berikut untuk melengkapi pendaftaran sebagai Admin.
    </p>
    <div style="background:#f0fdf4;border:2px solid #86efac;border-radius:10px;
                padding:24px;text-align:center;margin:20px 0;">
      <div style="font-size:13px;color:#16a34a;margin-bottom:8px;font-weight:600;">Token Khusus Admin</div>
      <span style="font-size:22px;font-weight:800;letter-spacing:4px;color:#15803d;font-family:monospace;
                   word-break:break-all;">
        ${escEmail(token)}
      </span>
    </div>
    <p style="font-size:13px;color:#64748b;line-height:1.5;">
      Token ini berlaku <strong>24 jam</strong>, hanya untuk satu kali pakai, dan hanya untuk email <strong>${escEmail(to)}</strong>.
      Masukkan di kolom "Token Khusus Admin" pada halaman pendaftaran lalu selesaikan verifikasi email.
    </p>
  `);

  const text = `Halo ${username}!\n\nToken khusus admin Anda: ${token}\n\nBerlaku 24 jam, sekali pakai, khusus email ${to}.\nMasukkan di form pendaftaran Admin B3Matika.`;

  try {
    await transporter.sendMail({
      from: `"B3Matika" <${env.EMAIL_USER}>`,
      to,
      subject: '[B3Matika] Token Khusus Admin Anda Telah Disetujui',
      text,
      html,
    });
  } catch (error) {
    console.error('❌ Gagal mengirim token admin ke', to, ':', error.code || error.message);
    throw new Error(`Gagal mengirim token ke email pendaftar: ${error.message}`);
  }
}

// ─── Kirim Email Penolakan ke Pendaftar ──────────────────────────────────────
export async function kirimEmailPenolakan(to, username) {
  const html = wrapHtml(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;">Informasi Permintaan Token Admin</h2>
    <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 16px;">
      Halo <strong>${escEmail(username)}</strong>,
    </p>
    <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 16px;">
      Mohon maaf, permintaan token khusus Admin B3Matika Anda <strong>tidak dapat disetujui</strong> untuk saat ini.
    </p>
    <p style="color:#64748b;font-size:14px;line-height:1.5;">
      Anda masih bisa menggunakan B3Matika sebagai pengguna biasa. Jika ada pertanyaan, silakan hubungi kami.
    </p>
  `);

  const text = `Halo ${username},\n\nMohon maaf, permintaan token khusus Admin B3Matika Anda tidak dapat disetujui saat ini.\n\nAnda masih bisa menggunakan B3Matika sebagai pengguna biasa.`;

  try {
    await transporter.sendMail({
      from: `"B3Matika" <${env.EMAIL_USER}>`,
      to,
      subject: '[B3Matika] Informasi Permintaan Token Admin',
      text,
      html,
    });
  } catch (error) {
    // Email penolakan: log tapi jangan blokir respons
    console.error('⚠️ Gagal mengirim email penolakan ke', to, ':', error.message);
  }
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function escEmail(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
