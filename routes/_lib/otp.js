import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { supabase } from './supabase.js';

// Setup transporter Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper untuk menghasilkan HMAC hash
export const hmac = (v) =>
  crypto.createHmac('sha256', process.env.OTP_SECRET || 'secret123').update(String(v)).digest('hex');

// Timing safe equal untuk membandingkan hash
export const safeEqual = (a, b) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

// Enkripsi password secara simetris agar bisa dibuat di Supabase Auth nanti
export const encryptPassword = (text) => {
  const key = crypto.scryptSync(process.env.OTP_SECRET || 'secret123', 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

// Dekripsi password 
export const decryptPassword = (text) => {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const key = crypto.scryptSync(process.env.OTP_SECRET || 'secret123', 'salt', 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// Buat OTP 6 digit
export const buatOTP = () => crypto.randomInt(100000, 1000000).toString();

// Kirim email
export async function kirimOTP(to, otp, tujuan) {
  try {
    await transporter.sendMail({
      from: `"B3Matika" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Kode Verifikasi ${tujuan}`,
      text: `Kode verifikasi kamu: ${otp}\nBerlaku 10 menit. Jangan bagikan kode ini ke siapa pun.`,
    });
  } catch (error) {
    console.error("Gagal mengirim email SMTP:", error);
    throw new Error("Gagal mengirim email. Periksa kredensial .env (EMAIL_USER, EMAIL_PASS).");
  }
}
