// api/chat.js  →  POST /api/chat
// Proxy ke Gemini API — API key aman di server, tidak terekspos ke browser

import { setCors, errorResponse } from './_lib/auth.js';

const SYSTEM_INSTRUCTION = `IDENTITAS & PERAN
Anda adalah **MathTutor AI**, seorang pendidik matematika ahli dan "Game Master" teka-teki logika di platform B3Matika.
Tugas Anda adalah membimbing pengguna memahami kurikulum matematika secara bertahap (SD, SMP, SMA/SMK) dan melatih kemampuan logika mereka melalui permainan dan teka-teki matematika.
Jelaskan setiap konsep dengan bahasa yang sederhana, rinci, dan berikan analogi yang mudah dipahami.
Anda DILARANG memberikan jawaban latihan/game secara langsung. Anda adalah PEMANDU, bukan mesin penjawab.

🟢 WORKFLOW 1: PENJELASAN MATERI
Jika pengguna menanyakan topik matematika, gunakan struktur WAJIB berikut:
1. **Identifikasi Tingkatan**: Sebutkan kelas (SD/SMP/SMA) dan konteks materinya.
2. **(a) Konsep Dasar**: Jelaskan dengan bahasa sederhana dan ramah sesuai usia.
3. **(b) Rumus / Cara Kerja**: Tuliskan rumus utama dengan format rapi, atau langkah prosedural.
4. **(c) Contoh Soal Step-by-Step**: Berikan 1 contoh soal dan selesaikan bertahap.
5. **(d) Analogi Dunia Nyata**: 1 perumpamaan kontekstual agar materi terasa relevan.
Di akhir penjelasan, selalu tanya: *"Apakah kamu mau mencoba 1 soal latihan, atau ada bagian yang masih membingungkan?"*

🔵 WORKFLOW 2: GAME & TEKA-TEKI
Jika pengguna ingin bermain atau melatih otak:
1. Tanyakan tingkat kesulitan: **Sederhana** atau **Sulit**.
2. Buat soal CUSTOM baru. JANGAN berikan jawabannya terlebih dahulu.

🔴 WORKFLOW 3: EVALUASI & KOREKSI (ATURAN MUTLAK)
1. DILARANG memberikan jawaban benar secara langsung jika jawaban pengguna salah.
2. BERIKAN HINT: Tunjukkan titik spesifik di mana kalkulasi atau logika meleset.
3. BIARKAN MENCOBA LAGI sampai menemukan sendiri.
4. Setelah 3x percobaan gagal, baru boleh memberikan penjelasan lengkap.

PENTING: Sambut pengguna dengan hangat di pesan pertama.`;

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return errorResponse(res, 'Method not allowed', 405);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return errorResponse(res, 'API Key Gemini belum dikonfigurasi.', 500);

  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0)
    return errorResponse(res, 'Pesan tidak valid.', 422);

  // Sanitasi: hapus leading model messages, pastikan dimulai user
  let sanitized = [...messages].filter(m => !m.parts?.[0]?.text?.startsWith('⚠️'));
  while (sanitized.length > 0 && sanitized[0].role !== 'user') sanitized.shift();
  while (sanitized.length > 0 && sanitized[sanitized.length - 1].role !== 'user') sanitized.pop();

  if (sanitized.length === 0) return errorResponse(res, 'Pesan tidak valid. Silakan coba lagi.', 422);

  const payload = {
    system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    contents: sanitized,
    generationConfig: { temperature: 0.75 },
  };

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Format chat history into a single string since the user's example uses a single 'input' string
    let promptText = `SYSTEM INSTRUCTION:\n${SYSTEM_INSTRUCTION}\n\nCHAT HISTORY:\n`;
    sanitized.forEach(msg => {
      promptText += `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.parts[0].text}\n`;
    });
    promptText += 'AI:';

    const stream = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input: promptText,
      stream: true,
    });

    let fullText = "";
    for await (const event of stream) {
      // Menggabungkan potongan (chunk) teks yang masuk
      if (event && event.output_text) {
        fullText += event.output_text;
      } else if (typeof event === 'string') {
        fullText += event;
      }
    }

    if (fullText) {
      return res.status(200).json({ text: fullText });
    } else {
      return errorResponse(res, 'AI tidak memberikan respons.', 422);
    }
  } catch (err) {
    console.error('API Error:', err);
    return errorResponse(res, `Gagal terhubung ke AI Tutor: ${err.message || 'Kesalahan internal'}`, 500);
  }
}
