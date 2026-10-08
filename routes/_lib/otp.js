/**
 * routes/_lib/otp.js
 * Helper: OTP, kriptografi, dan template email transaksional B3Matika.
 *
 * Perubahan v2 (deliverability):
 * - sendMail() dari mailer.js menggantikan transporter langsung
 * - Subjek: polos, spesifik, tanpa prefix [...], tanpa emoji/tanda seru
 * - HTML: tanpa emoji di tombol, satu tombol utama, tautan teks cadangan
 * - Multipart wajib: text + html di setiap email
 * - kirimEmailPenolakan sekarang throw agar pemanggil tahu jika gagal
 */
import crypto from 'crypto';
import env from './env.js';
import { sendMail } from './mailer.js';

// ─── Primitif kriptografi ─────────────────────────────────────────────────────
export const hmac = (v) =>
  crypto.createHmac('sha256', env.OTP_SECRET).update(String(v)).digest('hex');

/** Hash SHA-256 standar, dipakai untuk token random (admin invite, link verif). */
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

/** Buat token URL-safe acak (minimal 32 byte → 43 karakter base64url). */
export const buatToken = (bytes = 32) =>
  crypto.randomBytes(bytes).toString('base64url');

// ─── Helper ───────────────────────────────────────────────────────────────────
/** Escape karakter HTML untuk menyisipkan data ke template. */
function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Template wrapper HTML ────────────────────────────────────────────────────
/**
 * Bungkus konten dengan kerangka email responsif.
 * Warna: tetap (bukan CSS variable) agar terbaca di semua klien email
 * termasuk Gmail, Outlook, Apple Mail — di mode terang maupun gelap.
 *
 * Prinsip anti-spam:
 * - Tidak ada gambar besar / tracking pixel
 * - Tidak ada kata promosi/mendesak (FREE, GRATIS, KLIK SEKARANG)
 * - Ratio teks:HTML wajar (konten teks yang bermakna)
 * - Header footer ringkas
 */
function wrapHtml(innerHtml, footerNote = 'Abaikan email ini jika Anda tidak merasa melakukan tindakan ini.') {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="id" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>B3Matika</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;mso-hide:all;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
               style="max-width:580px;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;">

          <!-- Header -->
          <tr>
            <td style="background:#1d4ed8;padding:24px 32px;text-align:center;">
              <span style="color:#ffffff;font-size:24px;font-weight:800;letter-spacing:1px;font-family:'Segoe UI',Arial,sans-serif;">B3Matika</span>
              <p style="margin:4px 0 0;color:#bfdbfe;font-size:12px;font-family:'Segoe UI',Arial,sans-serif;">Belajar, Berlatih, Bermain</p>
            </td>
          </tr>

          <!-- Konten -->
          <tr>
            <td style="padding:32px 32px 24px;">
              ${innerHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;font-family:'Segoe UI',Arial,sans-serif;line-height:1.6;">
                &copy; ${year} B3Matika &mdash; Belajar, Berlatih, Bermain<br>
                ${footerNote}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Buat tombol utama yang kompatibel dengan Outlook (VML) dan klien modern. */
function btnPrimary(href, label, bg = '#1d4ed8') {
  // Gunakan tabel agar tombol terbaca di Outlook yang tidak mendukung border-radius pada <a>
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
      <tr>
        <td style="border-radius:7px;background:${bg};">
          <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${esc(href)}" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="15%" stroke="f" fillcolor="${bg}"><w:anchorlock/><center style="color:#ffffff;font-family:'Segoe UI',Arial,sans-serif;font-size:15px;font-weight:700;">${esc(label)}</center></v:roundrect><![endif]-->
          <!--[if !mso]><!-->
          <a href="${esc(href)}"
             style="display:inline-block;padding:13px 32px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;border-radius:7px;background:${bg};font-family:'Segoe UI',Arial,sans-serif;mso-hide:all;">
            ${esc(label)}
          </a>
          <!--<![endif]-->
        </td>
      </tr>
    </table>`;
}

/** Kotak kode OTP yang besar dan jelas. */
function otpBox(otp) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background:#f8fafc;border:2px dashed #cbd5e1;border-radius:10px;padding:22px;text-align:center;">
          <p style="margin:0 0 6px;font-size:12px;color:#64748b;font-family:'Segoe UI',Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Kode Verifikasi</p>
          <span style="font-size:38px;font-weight:800;letter-spacing:12px;color:#f97316;font-family:'Courier New',Courier,monospace;">${esc(otp)}</span>
        </td>
      </tr>
    </table>`;
}

// ─── 1. Kirim OTP + Tautan Verifikasi ────────────────────────────────────────
/**
 * Email OTP pendaftaran / reset sandi.
 * Subjek: "Kode verifikasi B3Matika: 123456" — spesifik, langsung, tanpa tanda seru.
 *
 * @param {string}      to        - Email penerima
 * @param {string}      otp       - Kode OTP 6 digit
 * @param {string}      tujuan    - Label tujuan (mis. "Pendaftaran")
 * @param {string|null} linkToken - Token link verifikasi (null jika tidak ada)
 * @throws {Error} jika SMTP gagal
 */
export async function kirimOTP(to, otp, tujuan, linkToken = null) {
  const linkHref = linkToken
    ? `${env.APP_BASE_URL}/verifikasi-email?token=${encodeURIComponent(linkToken)}&email=${encodeURIComponent(to)}`
    : null;

  const linkSection = linkHref
    ? `
      <div style="text-align:center;margin:24px 0;">
        ${btnPrimary(linkHref, 'Verifikasi Email Saya')}
        <p style="margin:10px 0 0;font-size:12px;color:#94a3b8;font-family:'Segoe UI',Arial,sans-serif;">
          Tautan berlaku 10 menit dan hanya untuk satu kali pakai.
        </p>
      </div>
      <p style="text-align:center;color:#94a3b8;font-size:12px;margin:4px 0 16px;">— atau gunakan kode di bawah —</p>`
    : '';

  const linkFallback = linkHref
    ? `\nAtau verifikasi lewat tautan berikut (berlaku 10 menit):\n${linkHref}\n`
    : '';

  const html = wrapHtml(`
    <h2 style="margin:0 0 12px;color:#1e293b;font-size:20px;font-family:'Segoe UI',Arial,sans-serif;">Verifikasi ${esc(tujuan)} Anda</h2>
    <p style="color:#475569;font-size:15px;line-height:1.65;margin:0 0 20px;font-family:'Segoe UI',Arial,sans-serif;">
      Kami menerima permintaan <strong>${esc(tujuan)}</strong> untuk akun B3Matika yang terhubung ke email ini.
    </p>

    ${linkSection}
    ${otpBox(otp)}

    <p style="font-size:13px;color:#64748b;line-height:1.55;margin:16px 0 0;font-family:'Segoe UI',Arial,sans-serif;">
      Kode berlaku selama <strong>10 menit</strong>.
      Jangan bagikan kode ini kepada siapa pun, termasuk pihak yang mengaku dari B3Matika.
    </p>
  `);

  const text =
    `Verifikasi ${tujuan} B3Matika\n` +
    `\n` +
    `Kode verifikasi Anda: ${otp}\n` +
    `Berlaku 10 menit. Jangan bagikan ke siapa pun.\n` +
    linkFallback +
    `\nB3Matika — Belajar, Berlatih, Bermain`;

  await sendMail({
    to,
    // Subjek: polos, spesifik, kode di depan agar terlihat di preview notifikasi
    subject : `Kode verifikasi B3Matika: ${otp}`,
    text,
    html,
  });
}

// ─── 2. Email Notifikasi Umum ─────────────────────────────────────────────────
/**
 * Kirim email HTML umum. Error dilempar ulang agar pemanggil tahu.
 * @throws {Error} jika SMTP gagal
 */
export async function kirimEmailNotifikasi(to, subject, htmlContent, textContent) {
  await sendMail({
    to,
    subject,
    html: wrapHtml(htmlContent),
    text: textContent || '',
  });
}

// ─── 3. Permintaan Token Admin ke Superadmin ──────────────────────────────────
/**
 * Email ke superadmin — berisi tautan konfirmasi (bukan aksi otomatis).
 * Dua tombol (setujui / tolak) hanya sebagai tautan ke halaman konfirmasi.
 * @throws {Error} jika SMTP gagal
 */
export async function kirimEmailPermintaanAdmin({ nama, username, email, waktu, approveUrl, rejectUrl }) {
  const waktuStr = new Date(waktu).toLocaleString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta',
  });

  const html = wrapHtml(`
    <h2 style="margin:0 0 12px;color:#1e293b;font-size:20px;font-family:'Segoe UI',Arial,sans-serif;">Permintaan Token Admin Baru</h2>
    <p style="color:#475569;font-size:15px;line-height:1.65;margin:0 0 20px;font-family:'Segoe UI',Arial,sans-serif;">
      Seseorang mengajukan permintaan token untuk mendaftar sebagai <strong>Admin B3Matika</strong>.
      Tinjau data di bawah dan pilih tindakan.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="border-collapse:collapse;font-size:14px;margin:0 0 24px;">
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:10px 0;color:#64748b;width:140px;font-family:'Segoe UI',Arial,sans-serif;">Nama Lengkap</td>
        <td style="padding:10px 0;font-weight:600;color:#1e293b;font-family:'Segoe UI',Arial,sans-serif;">${esc(nama)}</td>
      </tr>
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:10px 0;color:#64748b;font-family:'Segoe UI',Arial,sans-serif;">Username</td>
        <td style="padding:10px 0;font-weight:600;color:#1e293b;font-family:'Segoe UI',Arial,sans-serif;">@${esc(username)}</td>
      </tr>
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:10px 0;color:#64748b;font-family:'Segoe UI',Arial,sans-serif;">Email</td>
        <td style="padding:10px 0;font-weight:600;color:#1e293b;font-family:'Segoe UI',Arial,sans-serif;">${esc(email)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;color:#64748b;font-family:'Segoe UI',Arial,sans-serif;">Waktu Permintaan</td>
        <td style="padding:10px 0;color:#1e293b;font-family:'Segoe UI',Arial,sans-serif;">${esc(waktuStr)} WIB</td>
      </tr>
    </table>

    <p style="color:#475569;font-size:14px;margin:0 0 20px;line-height:1.6;font-family:'Segoe UI',Arial,sans-serif;">
      Klik tombol di bawah untuk membuka halaman konfirmasi.
      Tindakan tidak dijalankan secara otomatis — Anda harus mengklik tombol di halaman tersebut.
      <strong>Tautan berlaku 24 jam.</strong>
    </p>

    <div style="text-align:center;margin:24px 0;">
      ${btnPrimary(approveUrl, 'Setujui Permintaan', '#16a34a')}
      <div style="height:10px;"></div>
      ${btnPrimary(rejectUrl, 'Tolak Permintaan', '#dc2626')}
    </div>

    <p style="font-size:12px;color:#94a3b8;text-align:center;margin:16px 0 0;font-family:'Segoe UI',Arial,sans-serif;line-height:1.6;">
      Jika tombol tidak berfungsi, salin tautan berikut ke browser:<br>
      <span style="word-break:break-all;color:#1d4ed8;">${esc(approveUrl)}</span>
    </p>
  `, 'Email ini dikirim otomatis oleh sistem B3Matika kepada superadmin.');

  const text =
    `Permintaan Token Admin Baru — B3Matika\n` +
    `\n` +
    `Nama    : ${nama}\n` +
    `Username: @${username}\n` +
    `Email   : ${email}\n` +
    `Waktu   : ${waktuStr} WIB\n` +
    `\n` +
    `Tindakan (buka tautan berikut untuk konfirmasi, BUKAN aksi otomatis):\n` +
    `Setujui : ${approveUrl}\n` +
    `Tolak   : ${rejectUrl}\n` +
    `\n` +
    `Tautan berlaku 24 jam.\n` +
    `B3Matika — Belajar, Berlatih, Bermain`;

  await sendMail({
    to      : env.SUPERADMIN_EMAIL,
    // Subjek: deskriptif, tanpa prefix [...], tanpa emoji
    subject : `Permintaan token admin baru dari ${username} - B3Matika`,
    text,
    html,
  });
}

// ─── 4. Token Admin ke Pendaftar ─────────────────────────────────────────────
/**
 * Email token admin yang sudah disetujui, dikirim ke pendaftar.
 * @throws {Error} jika SMTP gagal
 */
export async function kirimTokenAdmin(to, username, token) {
  const html = wrapHtml(`
    <h2 style="margin:0 0 12px;color:#1e293b;font-size:20px;font-family:'Segoe UI',Arial,sans-serif;">Token Admin Disetujui</h2>
    <p style="color:#475569;font-size:15px;line-height:1.65;margin:0 0 20px;font-family:'Segoe UI',Arial,sans-serif;">
      Halo <strong>${esc(username)}</strong>,<br>
      Superadmin B3Matika telah menyetujui permintaan Anda.
      Gunakan token di bawah untuk melengkapi pendaftaran sebagai Admin.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:10px;padding:22px;text-align:center;">
          <p style="margin:0 0 8px;font-size:12px;color:#16a34a;font-family:'Segoe UI',Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Token Khusus Admin</p>
          <span style="font-size:20px;font-weight:800;letter-spacing:4px;color:#15803d;font-family:'Courier New',Courier,monospace;word-break:break-all;">
            ${esc(token)}
          </span>
        </td>
      </tr>
    </table>

    <p style="font-size:13px;color:#64748b;line-height:1.6;margin:16px 0 0;font-family:'Segoe UI',Arial,sans-serif;">
      Token ini berlaku <strong>24 jam</strong>, hanya satu kali pakai, dan hanya berlaku untuk email
      <strong>${esc(to)}</strong>.<br>
      Masukkan di kolom "Token Khusus Admin" pada halaman pendaftaran, lalu selesaikan verifikasi email.
    </p>
  `);

  const text =
    `Token Admin Disetujui — B3Matika\n` +
    `\n` +
    `Halo ${username},\n` +
    `\n` +
    `Token khusus admin Anda: ${token}\n` +
    `\n` +
    `Berlaku 24 jam, satu kali pakai, khusus email ${to}.\n` +
    `Masukkan di halaman pendaftaran Admin B3Matika.\n` +
    `\n` +
    `B3Matika — Belajar, Berlatih, Bermain`;

  await sendMail({
    to,
    subject : `Token admin B3Matika Anda telah disetujui`,
    text,
    html,
  });
}

// ─── 5. Penolakan ke Pendaftar ────────────────────────────────────────────────
/**
 * Email pemberitahuan penolakan token admin.
 * Versi lama: tidak throw (aksi gagal diam-diam).
 * Versi baru: throw agar pemanggil bisa mencatat ke log.
 * @throws {Error} jika SMTP gagal
 */
export async function kirimEmailPenolakan(to, username) {
  const html = wrapHtml(`
    <h2 style="margin:0 0 12px;color:#1e293b;font-size:20px;font-family:'Segoe UI',Arial,sans-serif;">Informasi Permintaan Token Admin</h2>
    <p style="color:#475569;font-size:15px;line-height:1.65;margin:0 0 16px;font-family:'Segoe UI',Arial,sans-serif;">
      Halo <strong>${esc(username)}</strong>,
    </p>
    <p style="color:#475569;font-size:15px;line-height:1.65;margin:0 0 16px;font-family:'Segoe UI',Arial,sans-serif;">
      Permintaan token khusus Admin B3Matika Anda tidak dapat disetujui untuk saat ini.
    </p>
    <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0;font-family:'Segoe UI',Arial,sans-serif;">
      Anda tetap dapat menggunakan B3Matika sebagai pengguna biasa.
      Jika ada pertanyaan, silakan hubungi kami melalui email ini.
    </p>
  `, 'Email ini adalah pemberitahuan resmi dari B3Matika.');

  const text =
    `Informasi Permintaan Token Admin — B3Matika\n` +
    `\n` +
    `Halo ${username},\n` +
    `\n` +
    `Permintaan token khusus Admin B3Matika Anda tidak dapat disetujui untuk saat ini.\n` +
    `\n` +
    `Anda tetap dapat menggunakan B3Matika sebagai pengguna biasa.\n` +
    `\n` +
    `B3Matika — Belajar, Berlatih, Bermain`;

  await sendMail({
    to,
    subject : `Informasi permintaan token admin B3Matika`,
    text,
    html,
  });
}
