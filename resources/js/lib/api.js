/**
 * Pembungkus fetch untuk API Laravel (/api/*).
 * Token Sanctum disimpan di localStorage dan dikirim sebagai Bearer token.
 * Error API selalu berbentuk { "error": "pesan" }.
 *
 * Base URL dikonfigurasi melalui env variable VITE_API_URL.
 * - Development lokal  : kosongkan (default ke '/api', proxy via Vite atau Laragon)
 * - Production Vercel  : isi dengan URL backend, misal https://b3matika-api.railway.app/api
 */
export const TOKEN_KEY = 'b3_token';

// API sekarang berjalan di Vercel serverless functions (/api/*)
// Tidak perlu env variable terpisah — sama-sama di vercel.app
const BASE_URL = '/api';

export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  // Jika body sudah berupa string (sudah di-stringify sebelumnya), kirim apa adanya.
  // Jika body berupa object, stringify di sini. Ini mencegah double-stringify.
  const bodyStr = body
    ? (typeof body === 'string' ? body : JSON.stringify(body))
    : undefined;

  const res = await fetch(BASE_URL + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json', // wajib agar Laravel membalas JSON, bukan redirect HTML
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: bodyStr,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Terjadi kesalahan.');
    err.status = res.status;
    throw err;
  }
  return data;
}
