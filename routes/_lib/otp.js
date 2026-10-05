import crypto from 'crypto';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const hmac = (v) =>
  crypto.createHmac('sha256', process.env.OTP_SECRET || 'secret123').update(String(v)).digest('hex');

export const safeEqual = (a, b) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

export const buatOTP = () => crypto.randomInt(100000, 1000000).toString();

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
