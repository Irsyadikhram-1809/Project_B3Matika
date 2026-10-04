/**
 * Memeriksa apakah transkrip mengandung perintah suara khusus.
 * @param {string} transcript - Teks hasil pengenalan suara.
 * @returns {Object|null} - Mengembalikan objek action jika cocok, null jika tidak.
 */
export const parseVoiceCommand = (transcript) => {
  const text = transcript.toLowerCase().trim();

  // Daftar perintah
  const commands = [
    { keywords: ['ulangi jawaban', 'ulang dong', 'coba ulangi'], action: 'REPEAT' },
    { keywords: ['lebih pelan', 'ngomongnya pelan dikit', 'pelan pelan'], action: 'SLOWER' },
    { keywords: ['berhenti', 'stop bicara', 'diam'], action: 'STOP_SPEAKING' },
    { keywords: ['materi selanjutnya', 'lanjut', 'berikutnya'], action: 'NEXT_TOPIC' },
    { keywords: ['kosongkan chat', 'hapus chat', 'bersihkan layar'], action: 'CLEAR_CHAT' },
  ];

  for (const cmd of commands) {
    if (cmd.keywords.some(keyword => text.includes(keyword))) {
      return { type: cmd.action, originalText: text };
    }
  }

  return null;
};
