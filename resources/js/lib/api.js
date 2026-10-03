/**
 * Pembungkus fetch untuk API Laravel (/api/*).
 * Token Sanctum disimpan di localStorage dan dikirim sebagai Bearer token.
 * Error API selalu berbentuk { "error": "pesan" }.
 */
export const TOKEN_KEY = 'b3_token';

export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  // Jika body sudah berupa string (sudah di-stringify sebelumnya), kirim apa adanya.
  // Jika body berupa object, stringify di sini. Ini mencegah double-stringify.
  const bodyStr = body
    ? (typeof body === 'string' ? body : JSON.stringify(body))
    : undefined;

  const res = await fetch('/api' + path, {
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
