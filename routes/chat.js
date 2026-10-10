// api/chat.js  →  POST /api/chat
// Proxy ke Gemini API — API key aman di server, tidak terekspos ke browser

import { setCors, errorResponse } from './_lib/auth.js';
import env from './_lib/env.js';

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
  
  if (req.query.health) {
    const key = env.GEMINI_API_KEY || '';
    if (!key) return res.status(503).json({ status: 'down', message: 'API Key Gemini belum dikonfigurasi.' });
    try {
      await import('@google/genai');
      return res.status(200).json({ status: 'ok', message: 'Layanan AI siap.' });
    } catch (e) {
      return res.status(500).json({ status: 'error', message: 'Gagal memuat SDK AI.' });
    }
  }

  if (req.method !== 'POST') return errorResponse(res, 'Method not allowed', 405);

  const apiKeyStr = env.GEMINI_API_KEY || '';
  const apiKeys = apiKeyStr.split(',').map(k => k.replace(/['"]/g, '').trim()).filter(k => k);
  if (apiKeys.length === 0) return errorResponse(res, 'Layanan AI belum dikonfigurasi.', 500);

  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0)
    return errorResponse(res, 'Pesan tidak valid.', 422);

  // Sanitasi: hapus leading model messages, pastikan dimulai user
  let sanitized = [...messages].filter(m => !m.parts?.[0]?.text?.startsWith('⚠️'));
  while (sanitized.length > 0 && sanitized[0].role !== 'user') sanitized.shift();
  while (sanitized.length > 0 && sanitized[sanitized.length - 1].role !== 'user') sanitized.pop();

  if (sanitized.length === 0) return errorResponse(res, 'Pesan tidak valid. Silakan coba lagi.', 422);
  
  // Batas panjang input dan pesan
  if (sanitized.length > 20) sanitized = sanitized.slice(-20);
  const totalLength = sanitized.reduce((acc, msg) => acc + (msg.parts[0].text || '').length, 0);
  if (totalLength > 10000) return errorResponse(res, 'Pesan terlalu panjang.', 413);

  try {
    const { GoogleGenAI } = await import('@google/genai');

    let promptText = "RIWAYAT PERCAKAPAN:\n";
    if (sanitized.length > 1) {
      sanitized.slice(0, -1).forEach(msg => {
        promptText += `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.parts[0].text}\n`;
      });
      promptText += `\nPESAN USER TERBARU:\n${sanitized[sanitized.length - 1].parts[0].text}`;
    } else {
      promptText = sanitized[0].parts[0].text;
    }

    const modelName = env.GEMINI_MODEL || "gemini-3.8-flash";
    let lastError = null;
    let stream;
    let successfulKey = null;

    for (const currentKey of apiKeys) {
      try {
        const ai = new GoogleGenAI({ apiKey: currentKey });
        stream = await ai.interactions.create({
          model: modelName,
          system_instruction: SYSTEM_INSTRUCTION,
          input: promptText,
          stream: true,
        });
        successfulKey = currentKey;
        break; // berhasil mendapatkan stream
      } catch (err) {
        lastError = err;
        const status = err.status || 500;
        const msg = err.message || '';
        // Rotasi hanya jika error kunci atau kuota
        if ([401, 403, 429].includes(status) || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('api key')) {
          console.warn(`⚠️ Rotasi API Key (status ${status})`);
          continue;
        } else {
          break; // error lain, jangan rotasi
        }
      }
    }

    if (!stream) {
      const errMsg = lastError?.message || 'AI tidak memberikan respons.';
      const status = lastError?.status || 500;
      console.error(`API Error (${status}):`, errMsg);
      if (status === 429 || errMsg.toLowerCase().includes('quota')) {
        return errorResponse(res, 'Jatah AI sedang habis, coba lagi nanti.', 429);
      }
      return errorResponse(res, 'Gagal terhubung ke AI Tutor.', status);
    }

    // Set headers untuk SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    let hasResponded = false;
    for await (const chunk of stream) {
      // Tangani event stream.delta dari Interactions API
      if (chunk.event_type === 'step.delta' && chunk.delta?.type === 'text' && chunk.delta?.text) {
        hasResponded = true;
        const data = JSON.stringify({ text: chunk.delta.text });
        res.write(`data: ${data}\n\n`);
      }
      // Atau jika SDK mereturn format fallback
      else if (chunk.output_text && typeof chunk.output_text === 'string') {
        hasResponded = true;
        const data = JSON.stringify({ text: chunk.output_text });
        res.write(`data: ${data}\n\n`);
      }
    }
    
    if (!hasResponded) {
       // Interactions API object fallback for non-stream / complete
       if (stream.output_text) {
          const data = JSON.stringify({ text: stream.output_text });
          res.write(`data: ${data}\n\n`);
       } else {
          // Empty response
          res.write(`data: ${JSON.stringify({ error: 'AI tidak memberikan jawaban, coba kirim ulang.' })}\n\n`);
       }
    }
    
    res.end();
  } catch (err) {
    console.error('API Error (Stream):', err.status || 500, err.message);
    if (!res.headersSent) {
      return errorResponse(res, `Gagal terhubung ke AI Tutor: ${err.message || 'Kesalahan internal'}`, 500);
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Permintaan ke AI terputus.' })}\n\n`);
      res.end();
    }
  }
}
