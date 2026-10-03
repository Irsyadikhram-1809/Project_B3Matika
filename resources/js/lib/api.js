/**
 * Pembungkus fetch untuk API Laravel (/api/*).
 * Token Sanctum disimpan di localStorage dan dikirim sebagai Bearer token.
 * Error API selalu berbentuk { "error": "pesan" }.
 */
export const TOKEN_KEY = 'b3_token';

export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch('/api' + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json', // wajib agar Laravel membalas JSON, bukan redirect HTML
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Terjadi kesalahan.');
    err.status = res.status;
    throw err;
  }
  return data;
}
