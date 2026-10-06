import db from '../routes/_lib/db.js';
import dotenv from 'dotenv';
dotenv.config();

const GAMES = [
  {
    id: 'kilat', label: 'Kilat Hitung', emoji: '⚡', level: 'Sederhana',
    desc: 'Jawab sebanyak mungkin soal dalam 30 detik!',
    tutorial: 'Selesaikan operasi matematika (tambah, kurang, kali, atau campuran) secepat mungkin. Kamu punya waktu 30 detik. Ketikkan jawabanmu di kotak yang tersedia, lalu tekan Enter atau klik Jawab.',
    learningGoal: 'Melatih kecepatan dan ketepatan berhitung dasar (penjumlahan, pengurangan, perkalian). Sangat baik untuk meningkatkan fluensi aritmetika dan refleks matematika.',
    tips: ['Pilih mode "Penjumlahan" dulu untuk pemanasan', 'Mode Campuran memberi poin lebih karena lebih menantang', 'Fokus pada kecepatan, bukan keakuratan 100% — lanjut ke soal berikutnya!']
  },
  {
    id: '2048', label: '2048', emoji: '🎯', level: 'Sederhana',
    desc: 'Geser dan gabungkan blok angka hingga mencapai 2048.',
    tutorial: 'Gunakan tombol panah (←→↑↓) atau WASD di keyboard, atau swipe di layar sentuh, untuk menggeser semua kotak sekaligus. Dua kotak bernilai sama yang bersentuhan akan bergabung menjadi satu dengan nilai dua kali lipat. Target: buat kotak bernilai 2048!',
    learningGoal: 'Melatih pemahaman deret ukur dan eksponen basis 2 (2¹, 2², 2³, ..., 2¹¹ = 2048). Melatih perencanaan strategi dan berpikir beberapa langkah ke depan.',
    tips: ['Coba pertahankan angka terbesar di sudut (pojok kanan bawah)', 'Jangan geser ke arah yang memecah susunan angka besar', 'Selalu sisakan ruang untuk tile baru muncul']
  },
  {
    id: 'threes', label: 'Threes!', emoji: '🎲', level: 'Sederhana',
    desc: 'Gabungkan 1+2=3, lalu 3+3, 6+6 … raih skor tertinggi!',
    tutorial: 'Gunakan panah untuk menggeser kotak. Aturan penggabungan UNIK: angka 1 HANYA bisa digabung dengan angka 2 (hasilnya 3). Setelah itu, hanya angka yang identik yang bisa digabung (3+3=6, 6+6=12, dst). Permainan berakhir saat papan penuh.',
    learningGoal: 'Melatih perencanaan tata ruang (spatial planning) dan kelipatan bilangan 3. Lebih strategis dari 2048 karena aturan penggabungannya lebih ketat.',
    tips: ['Pisahkan tile 1 dan 2 agar mudah digabungkan', 'Jangan biarkan papan penuh dengan tile kecil yang tidak bisa bergabung', 'Rencanakan 2-3 langkah ke depan sebelum menggeser']
  },
  {
    id: 'riddle', label: 'Math Riddles', emoji: '🧩', level: 'Sederhana',
    desc: 'Pola angka, aljabar kasual, dan logika visual.',
    tutorial: 'Perhatikan pola angka atau gambar yang diberikan. Setiap teka-teki memiliki logika tersembunyi — bisa berupa nilai sebuah simbol, selisih antar angka, atau pola kelipatan. Temukan polanya, lalu ketikkan jawabanmu.',
    learningGoal: 'Melatih nalar aljabar dasar dan pengenalan pola tanpa menggunakan variabel formal. Membangun intuisi matematika yang kuat untuk topik yang lebih lanjut.',
    tips: ['Coba cari selisih atau rasio antar angka dalam deret', 'Untuk teka-teki simbol, buat tabel nilai setiap simbol', 'Jika buntu, coba kerjakan dari soal yang paling sederhana dulu']
  },
  {
    id: 'crypt_basic', label: 'Cryptarithm Dasar', emoji: '🔤', level: 'Sederhana',
    desc: 'Pecahkan substitusi huruf-ke-angka pada teka-teki aritmetika singkat.',
    tutorial: 'Setiap huruf mewakili satu angka unik (0-9). Tugasmu adalah mengganti semua huruf dengan angka yang tepat agar persamaan penjumlahannya benar secara matematika. Isikan nilai setiap huruf di kotak masing-masing, lalu tekan "Cek Jawaban".',
    learningGoal: 'Melatih logika eliminasi, nilai tempat bilangan (satuan, puluhan, ratusan), dan deduksi bertahap. Merupakan pintu masuk ke logika pemrograman dan kriptografi.',
    tips: ['Mulai dari kolom satuan (paling kanan)', 'Perhatikan apakah ada "carry" (angka simpanan) ke kolom selanjutnya', 'Huruf pertama suatu bilangan tidak boleh bernilai 0']
  },
  {
    id: 'sudoku', label: 'Sudoku', emoji: '🟦', level: 'Sulit',
    desc: 'Isi kisi 9×9 tanpa pengulangan angka di baris, kolom, dan kotak.',
    tutorial: 'Isi setiap petak kosong dengan angka 1-9. Ada tiga syarat yang harus dipenuhi sekaligus: (1) Setiap baris → tidak boleh ada angka yang sama, (2) Setiap kolom → tidak boleh ada angka yang sama, (3) Setiap kotak 3×3 → tidak boleh ada angka yang sama.',
    learningGoal: 'Melatih constraint satisfaction — kemampuan memecahkan masalah dengan banyak syarat sekaligus. Membangun kemampuan berpikir sistematis dan eliminasi logis.',
    tips: ['Mulai dari baris/kolom/kotak yang sudah paling banyak terisi', 'Gunakan teknik "naked single": jika hanya ada satu kemungkinan, isi', 'Tandai kandidat angka di setiap sel untuk memudahkan eliminasi']
  },
  {
    id: 'kenken', label: 'KenKen', emoji: '🔢', level: 'Sulit',
    desc: 'Sudoku + operasi hitung (+−×÷) dalam kotak cage.',
    tutorial: 'Isi kotak dengan angka tanpa pengulangan di setiap baris dan kolom. TAMBAHAN: Angka dalam setiap kelompok (cage) bergaris tebal harus menghasilkan angka target dengan operasi yang tertera (misal: "12×" artinya hasil kalinya harus 12).',
    learningGoal: 'Melatih faktorisasi, partisi bilangan, dan komputasi mental cepat. Menggabungkan logika Sudoku dengan kemampuan aritmetika untuk tantangan ganda.',
    tips: ['Cage berisi 1 sel sudah pasti nilainya (langsung isi)', 'Untuk cage perkalian, cari semua pasangan faktor yang mungkin', 'Gunakan aturan Sudoku (tanpa pengulangan) untuk mengeliminasi kandidat']
  },
  {
    id: 'calculords', label: 'Calculords', emoji: '🃏', level: 'Sulit',
    desc: 'Rangkai kartu angka dengan operasi untuk mencapai target.',
    tutorial: 'Kamu punya beberapa kartu angka. Pilih kartu angka, lalu pilih operasi (+, -, ×), lalu pilih kartu angka lagi, dan seterusnya. Tujuanmu: buat ekspresi matematika yang hasilnya tepat sama dengan Angka Target. Gunakan sebanyak mungkin kartu!',
    learningGoal: 'Melatih urutan operasi hitung (PEMDAS/KABATAKU) dan strategi optimasi. Melatih berpikir kombinatoris — mencari kombinasi terbaik dari banyak kemungkinan.',
    tips: ['Hitung target dari yang terbesar: apakah bisa dicapai dengan perkalian?', 'Coba eliminasi angka-angka kecil dengan pengurangan atau pembagian', 'Ingat: perkalian dikerjakan sebelum penjumlahan/pengurangan']
  },
  {
    id: 'crypt_adv', label: 'Cryptarithm Lanjutan', emoji: '🔐', level: 'Sulit',
    desc: 'SEND + MORE = MONEY — eliminasi bersyarat berlapis.',
    tutorial: 'Seperti Cryptarithm Dasar, tapi dengan kata yang lebih panjang dan carry (angka simpanan) berlapis. Contoh legendaris: SEND + MORE = MONEY. Setiap huruf berbeda = angka berbeda (0-9). Huruf pertama suatu kata TIDAK BOLEH bernilai 0.',
    learningGoal: 'Melatih analisis kasus mendalam, sistem persamaan dengan constraint ganda, dan penalaran logis berlapis. Setara dengan latihan berpikir algoritmik tingkat lanjut.',
    tips: ['Mulai dengan menentukan nilai huruf di posisi paling kiri (biasanya 1)', 'Lacak carry di setiap kolom — ini kunci utamanya', 'Gunakan tabel untuk mencatat kemungkinan nilai setiap huruf']
  }
];

async function main() {
  try {
    // 1. Alter tabel games untuk menambahkan kolom-kolom baru jika belum ada
    await db.query(`
      ALTER TABLE public.games 
      ADD COLUMN IF NOT EXISTS emoji VARCHAR(20),
      ADD COLUMN IF NOT EXISTS level VARCHAR(50),
      ADD COLUMN IF NOT EXISTS tutorial TEXT,
      ADD COLUMN IF NOT EXISTS learning_goal TEXT,
      ADD COLUMN IF NOT EXISTS tips JSONB;
    `);

    console.log("Kolom-kolom baru berhasil ditambahkan/diperbarui ke tabel games.");

    // 2. Insert data games
    for (const game of GAMES) {
      await db.query(`
        INSERT INTO public.games (slug, title, description, badge_color, emoji, level, tutorial, learning_goal, tips)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (slug) DO UPDATE SET 
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          emoji = EXCLUDED.emoji,
          level = EXCLUDED.level,
          tutorial = EXCLUDED.tutorial,
          learning_goal = EXCLUDED.learning_goal,
          tips = EXCLUDED.tips
      `, [game.id, game.label, game.desc, '#2563eb', game.emoji, game.level, game.tutorial, game.learningGoal, JSON.stringify(game.tips || [])]);
    }
    
    console.log("Seeding data games berhasil.");
  } catch (error) {
    console.error("Gagal seeding games:", error);
  } finally {
    process.exit();
  }
}

main();
