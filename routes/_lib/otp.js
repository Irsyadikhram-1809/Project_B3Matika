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
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #2563eb; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">B3Matika</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff; color: #334155;">
          <h2 style="margin-top: 0; color: #1e293b;">Halo!</h2>
          <p style="font-size: 16px; line-height: 1.5;">
            Ini adalah kode verifikasi untuk <strong>${tujuan}</strong> akun B3Matika kamu.
          </p>
          <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #f97316;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #64748b;">
            Kode ini berlaku selama <strong>10 menit</strong>. Jangan bagikan kode ini ke siapa pun, termasuk pihak yang mengaku dari B3Matika.
          </p>
          <p style="font-size: 14px; color: #64748b; margin-top: 20px;">
            <em>Abaikan email ini jika kamu tidak merasa mendaftar.</em>
          </p>
        </div>
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
          B3 : Belajar, Berlatih, Bermain &copy; ${new Date().getFullYear()} B3Matika
        </div>
      </div>
    `;

    const text = `Halo!\n\nIni adalah kode verifikasi untuk ${tujuan} akun B3Matika kamu.\n\nKode verifikasi: ${otp}\n\nKode ini berlaku selama 10 menit. Jangan bagikan kode ini ke siapa pun.\nAbaikan email ini jika kamu tidak merasa mendaftar.\n\nB3 : Belajar, Berlatih, Bermain`;

    await transporter.sendMail({
      from: `"B3Matika" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Kode Verifikasi Pendaftaran B3Matika`,
      text,
      html,
    });
  } catch (error) {
    console.error("Gagal mengirim email SMTP:", error);
    throw new Error("Gagal mengirim email. Periksa kredensial .env (EMAIL_USER, EMAIL_PASS).");
  }
}
