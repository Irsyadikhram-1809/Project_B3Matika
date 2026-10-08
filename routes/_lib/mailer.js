/**
 * routes/_lib/mailer.js
 * Abstraksi pengiriman email B3Matika.
 *
 * Penyedia dikonfigurasi lewat variabel lingkungan EMAIL_PROVIDER:
 *   - "gmail"  (default) — Gmail via SMTP
 *   - "smtp"             — SMTP generik (Brevo / Resend SMTP / Mailgun SMTP / dll.)
 *   - "resend"           — Resend HTTP API (opsional, aktif bila ada RESEND_API_KEY)
 *
 * Pola penggunaan di seluruh kode:
 *   import { sendMail } from '../_lib/mailer.js';
 *   await sendMail({ to, subject, html, text });  // Selalu di-await; gagal = throw
 *
 * Jangan mencetak secret ke konsol.
 */

import nodemailer from 'nodemailer';
import 'dotenv/config';

// ─── Baca konfigurasi (tanpa import env.js agar tidak ada circular) ───────────
const EMAIL_PROVIDER  = (process.env.EMAIL_PROVIDER  || 'gmail').toLowerCase().trim();
const EMAIL_FROM_NAME = (process.env.EMAIL_FROM_NAME || 'B3Matika').trim();
const EMAIL_FROM_ADDR = (process.env.EMAIL_USER       || '').trim();
const EMAIL_PASS      = (process.env.EMAIL_PASS       || '').trim();
const REPLY_TO        = (process.env.EMAIL_REPLY_TO   || EMAIL_FROM_ADDR).trim();

// ─── Buat transporter sesuai penyedia ─────────────────────────────────────────
function buildTransporter() {
  switch (EMAIL_PROVIDER) {

    // ── SMTP Generik (Brevo, Mailgun, SendGrid, dll.) ─────────────────────────
    case 'smtp': {
      const host = process.env.SMTP_HOST;
      const port = parseInt(process.env.SMTP_PORT || '587', 10);
      const secure = process.env.SMTP_SECURE === 'true'; // true = TLS port 465
      if (!host) throw new Error('CRITICAL: SMTP_HOST wajib diisi jika EMAIL_PROVIDER=smtp');

      return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user: process.env.SMTP_USER || EMAIL_FROM_ADDR,
          pass: process.env.SMTP_PASS || EMAIL_PASS,
        },
        // Timeout wajar — hindari fungsi serverless hang terlalu lama
        connectionTimeout : 8_000,
        greetingTimeout   : 8_000,
        socketTimeout     : 15_000,
      });
    }

    // ── Gmail (default) ───────────────────────────────────────────────────────
    case 'gmail':
    default:
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: EMAIL_FROM_ADDR,
          pass: EMAIL_PASS,
        },
        connectionTimeout: 8_000,
        socketTimeout    : 15_000,
      });
  }
}

// Singleton — dibuat sekali per process (serverless: sekali per cold start)
let _transporter;
function getTransporter() {
  if (!_transporter) _transporter = buildTransporter();
  return _transporter;
}

// ─── Format alamat pengirim ────────────────────────────────────────────────────
function fromAddress() {
  // RFC 5321 — kutip nama jika ada spasi atau tanda baca
  const safe = /[,;@<>()]/.test(EMAIL_FROM_NAME)
    ? `"${EMAIL_FROM_NAME}"`
    : EMAIL_FROM_NAME;
  return `${safe} <${EMAIL_FROM_ADDR}>`;
}

// ─── Fungsi utama sendMail ─────────────────────────────────────────────────────
/**
 * Kirim satu email transaksional.
 * Selalu di-await oleh pemanggil; error dilempar agar pemanggil bisa
 * membatalkan transaksi atau mengembalikan respons 502 yang jelas.
 *
 * @param {object} opts
 * @param {string}   opts.to       - Alamat penerima
 * @param {string}   opts.subject  - Subjek (polos, tanpa emoji/tanda seru/kapital berlebihan)
 * @param {string}   opts.html     - Konten HTML (sudah di-wrap atau mentah)
 * @param {string}   opts.text     - Konten teks biasa wajib (fallback multipart)
 * @param {string}  [opts.replyTo] - Override Reply-To (default: EMAIL_REPLY_TO atau EMAIL_FROM)
 * @returns {Promise<object>} Info nodemailer (messageId, accepted, rejected)
 * @throws  {Error}  jika pengiriman gagal
 */
export async function sendMail({ to, subject, html, text, replyTo }) {
  if (!to || !subject || !html || !text) {
    throw new Error('sendMail: to, subject, html, dan text wajib diisi.');
  }

  // Resend API (opsional) — aktif jika EMAIL_PROVIDER=resend DAN RESEND_API_KEY ada
  if (EMAIL_PROVIDER === 'resend') {
    return await sendViaResend({ to, subject, html, text, replyTo });
  }

  const transport = getTransporter();

  let info;
  try {
    info = await transport.sendMail({
      from    : fromAddress(),
      replyTo : replyTo || REPLY_TO || fromAddress(),
      to,
      subject,
      text,
      html,
      headers: {
        // Tandai sebagai email transaksional (bukan promosi)
        'X-Mailer'          : 'B3Matika Mailer/2.0',
        'X-Priority'        : '3',            // Normal (1=High/Spam, 5=Low)
        'X-Entity-Ref-ID'   : Date.now().toString(36), // unik per send
        'Precedence'        : 'transactional',
        'List-Unsubscribe'  : `<mailto:${REPLY_TO}?subject=unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    });
  } catch (err) {
    // Jangan cetak password atau body ke console
    console.error('[mailer] Gagal kirim ke', to, '— kode:', err.code || err.responseCode || 'unknown');
    throw new Error(
      `Gagal mengirim email ke ${to}. ` +
      `Periksa konfigurasi EMAIL_PROVIDER, EMAIL_USER, EMAIL_PASS, ` +
      `atau cek koneksi SMTP server.`
    );
  }

  if (info.rejected && info.rejected.length > 0) {
    throw new Error(`Email ditolak server SMTP untuk penerima: ${info.rejected.join(', ')}`);
  }

  return info;
}

// ─── Resend HTTP API (opsional) ───────────────────────────────────────────────
async function sendViaResend({ to, subject, html, text, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('CRITICAL: RESEND_API_KEY wajib diisi jika EMAIL_PROVIDER=resend');

  const body = {
    from        : fromAddress(),
    reply_to    : replyTo || REPLY_TO,
    to          : [to],
    subject,
    html,
    text,
    headers     : { 'Precedence': 'transactional' },
  };

  const res = await fetch('https://api.resend.com/emails', {
    method  : 'POST',
    headers : {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type' : 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.status);
    console.error('[mailer/resend] HTTP', res.status, '— penerima:', to);
    throw new Error(`Resend API gagal (HTTP ${res.status}): ${errText}`);
  }

  return await res.json();
}
