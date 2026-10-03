<?php

namespace Database\Seeders;

use App\Models\Question;
use App\Models\Topic;
use Illuminate\Database\Seeder;

/**
 * Materi per kelas (SD 1–6, SMP 7–9, SMA/SMK 10–12) + soal latihan acak per jenjang.
 * Setiap kelas diberi topik sesuai kurikulum lengkap yang diminta.
 */
class TopicSeeder extends Seeder
{
    private const QUESTIONS_PER_TOPIC = 5;

    /** [grade => [[title, content], ...]] */
    private const TOPICS = [
        /* ===== SD ===== */
        1 => [
            ['Bilangan Cacah 1–20', "Bilangan cacah dimulai dari 0, 1, 2, 3, … hingga 20.\n\n• Membaca bilangan: 15 dibaca \"lima belas\", 20 dibaca \"dua puluh\".\n• Menulis bilangan: \"tujuh belas\" ditulis 17.\n• Mengurutkan: urutkan dari terkecil → 3, 7, 11, 15, 20.\n\nGunakan garis bilangan untuk membantu membandingkan besar kecilnya bilangan."],
            ['Penjumlahan & Pengurangan (sampai 20)', "Penjumlahan: menggabungkan dua kelompok benda.\n   5 + 8 = 13 (hitung maju dari 5 sebanyak 8 langkah)\n\nPengurangan: mengambil sebagian dari kelompok.\n   14 – 6 = 8 (hitung mundur dari 14 sebanyak 6 langkah)\n\nFakta penting:\n• Penjumlahan bisa dibalik: 4 + 9 = 9 + 4\n• Pengurangan adalah kebalikan penjumlahan: 8 + 5 = 13 ↔ 13 – 5 = 8"],
            ['Pengenalan Bangun Datar', "Bangun datar adalah bentuk 2 dimensi (pipih).\n\n• Segitiga – 3 sisi, 3 sudut\n• Persegi – 4 sisi sama panjang, 4 sudut siku-siku\n• Persegi panjang – 2 pasang sisi sejajar, 4 sudut siku-siku\n• Lingkaran – tidak bersudut, sisi melengkung\n\nCara mudah membedakan: hitung jumlah sisinya!"],
            ['Pengukuran Panjang & Berat (satuan tidak baku)', "Satuan tidak baku menggunakan benda sehari-hari sebagai alat ukur.\n\nPanjang: jengkal tangan, langkah kaki, pensil.\n   Contoh: Meja panjangnya 5 pensil.\n\nBerat: batu, buku, buah.\n   Contoh: 1 mangga = 2 batu kecil.\n\nCatatan: hasil pengukuran tidak baku bisa berbeda-beda antar orang karena ukuran benda berbeda-beda."],
        ],
        2 => [
            ['Bilangan Cacah sampai 1.000', "Ribuan, ratusan, puluhan, satuan:\n   547 = 5 ratusan + 4 puluhan + 7 satuan\n\nMembandingkan:\n   324 > 320 karena puluhan sama (2), satuan 4 > 0.\n\nUrutan bilangan:\n   150, 250, 350, … bertambah 100 setiap langkah.\n\nMenulis bilangan: 803 = delapan ratus tiga (perhatikan 'tiga' bukan 'nol tiga')."],
            ['Penjumlahan & Pengurangan Bersusun', "Penjumlahan bersusun:\n   235\n +148\n ———\n  383\n\nMulai dari satuan → puluhan → ratusan. Jika ada simpanan (carry), tambahkan ke kolom berikutnya.\n\nPengurangan bersusun:\n   452\n – 167\n ———\n  285\n\nJika satuan tidak cukup dikurangi, pinjam 1 dari puluhan."],
            ['Perkalian & Pembagian Dasar', "Perkalian = penjumlahan berulang:\n   4 × 3 = 4 + 4 + 4 = 12\n\nTabel perkalian 1–5 wajib dihafal!\n\nPembagian = kebalikan perkalian:\n   12 ÷ 4 = 3 karena 4 × 3 = 12\n\nTrik: Jika tahu tabel kali, pembagian jadi mudah."],
            ['Pengukuran Waktu, Panjang, dan Berat (satuan baku)', "Waktu: 1 jam = 60 menit, 1 menit = 60 detik.\n   2 jam 30 menit = 150 menit.\n\nPanjang:\n   1 m = 100 cm, 1 km = 1.000 m\n\nBerat:\n   1 kg = 1.000 g\n   Contoh: 2,5 kg = 2.500 g"],
            ['Pengenalan Pecahan Sederhana', "Pecahan: bagian dari keseluruhan.\n\n1/2 = satu dari DUA bagian sama besar\n1/3 = satu dari TIGA bagian sama besar\n1/4 = satu dari EMPAT bagian sama besar\n\nBandingkan: 1/2 > 1/4 (bagian lebih sedikit → tiap bagian lebih besar)\n\nContoh nyata: Pizza dibagi 4, kamu makan 1 irisan = kamu makan 1/4 pizza."],
        ],
        3 => [
            ['Operasi Hitung Bilangan Cacah Lanjutan', "Penjumlahan & pengurangan bilangan 3 angka.\nPerkalian & pembagian hingga angka 100.\n\nSifat operasi hitung:\n• Komutatif: a + b = b + a dan a × b = b × a\n• Asosiatif: (a + b) + c = a + (b + c)\n• Distributif: a × (b + c) = a×b + a×c\n\nContoh: 4 × (3 + 2) = 4×3 + 4×2 = 12 + 8 = 20"],
            ['Pecahan Sederhana: Membandingkan & Mengurutkan', "Membandingkan pecahan:\n• Penyebut sama: bandingkan pembilang. 3/7 > 2/7\n• Pembilang sama: penyebut besar → nilainya kecil. 1/3 < 1/2\n• Berbeda keduanya: samakan penyebut dulu.\n\nMengurutkan: 1/4, 1/2, 3/4 → dari terkecil ke terbesar.\n\nGaris bilangan pecahan sangat membantu visualisasi!"],
            ['Satuan Waktu, Panjang, dan Berat', "Waktu:\n   1 hari = 24 jam\n   1 minggu = 7 hari\n   1 bulan ≈ 30 hari\n   1 tahun = 12 bulan = 365 hari\n\nPanjang (dari besar ke kecil):\n   km → hm → dam → m → dm → cm → mm\n   Turun 1 tangga: × 10, Naik 1 tangga: ÷ 10\n\nBerat:\n   1 ton = 1.000 kg, 1 kg = 1.000 g"],
            ['Simetri Lipat & Simetri Putar', "Simetri Lipat: bangun dapat dilipat sehingga kedua sisi tepat menutup.\n   Persegi → 4 sumbu simetri\n   Persegi panjang → 2 sumbu simetri\n   Segitiga sama sisi → 3 sumbu simetri\n   Lingkaran → tak terhingga sumbu simetri\n\nSimetri Putar (Rotasi): seberapa sering bangun terlihat sama saat diputar 360°.\n   Persegi → simetri putar tingkat 4 (setiap 90°)"],
            ['Sudut & Jenis Bangun Datar', "Sudut: daerah yang terbentuk antara dua sinar garis yang bertemu di satu titik.\n\nJenis sudut:\n• Lancip < 90°\n• Siku-siku = 90° (ditandai kotak kecil)\n• Tumpul > 90°\n\nBangun datar dan sudutnya:\n• Segitiga: jumlah sudut = 180°\n• Segiempat: jumlah sudut = 360°"],
        ],
        4 => [
            ['Pecahan Senilai, Desimal, dan Persen', "Pecahan Senilai: 1/2 = 2/4 = 3/6 (kali atau bagi pembilang & penyebut dengan bilangan sama).\n\nDesimal:\n   1/2 = 0,5 ; 1/4 = 0,25 ; 3/4 = 0,75\n   1/10 = 0,1 ; 1/100 = 0,01\n\nPersen:\n   50% = 50/100 = 0,5\n   25% = 1/4 = 0,25\n\nKonversi: Persen → Desimal: bagi 100. Desimal → Persen: kali 100."],
            ['KPK dan FPB', "FPB (Faktor Persekutuan Terbesar):\n   Faktor 12: 1, 2, 3, 4, 6, 12\n   Faktor 18: 1, 2, 3, 6, 9, 18\n   FPB(12, 18) = 6\n\nKPK (Kelipatan Persekutuan Terkecil):\n   Kelipatan 4: 4, 8, 12, 16, 20, 24…\n   Kelipatan 6: 6, 12, 18, 24…\n   KPK(4, 6) = 12\n\nCara pohon faktor juga bisa digunakan untuk menemukan FPB & KPK."],
            ['Keliling & Luas Bangun Datar', "Persegi (sisi = s):\n   Keliling = 4 × s\n   Luas = s × s\n\nPersegi Panjang (panjang = p, lebar = l):\n   Keliling = 2 × (p + l)\n   Luas = p × l\n\nSegitiga (alas = a, tinggi = t, sisi-sisinya = a, b, c):\n   Keliling = a + b + c\n   Luas = ½ × a × t"],
            ['Hubungan Antar Garis', "Garis Sejajar: dua garis yang tidak pernah berpotongan meski diperpanjang tak terbatas.\n   Simbol: ∥ (contoh: rel kereta api)\n\nGaris Berpotongan: dua garis yang bertemu di satu titik.\n   Membentuk sudut; jika 90°, disebut tegak lurus (⊥).\n\nGaris Berhimpit: dua garis yang sepenuhnya menempati posisi yang sama."],
            ['Pengolahan Data: Tabel dan Diagram Batang', "Tabel data: menyajikan data dalam baris & kolom.\n\nDiagram Batang:\n• Sumbu mendatar (X): kategori\n• Sumbu tegak (Y): frekuensi/nilai\n• Tinggi batang menunjukkan besarnya nilai\n\nMembaca diagram: bandingkan tinggi batang untuk mengetahui nilai terbesar/terkecil.\n\nContoh: Nilai ulangan Andi 80, Budi 70, Caca 90 → Caca tertinggi."],
        ],
        5 => [
            ['Operasi Pecahan dan Desimal', "Penjumlahan Pecahan:\n   Penyebut sama: langsung jumlahkan pembilang. 2/7 + 3/7 = 5/7\n   Penyebut beda: samakan penyebut (KPK). 1/2 + 1/3 = 3/6 + 2/6 = 5/6\n\nPerkalian Pecahan: (a/b) × (c/d) = (a×c)/(b×d)\n   2/3 × 3/4 = 6/12 = 1/2\n\nPembagian Pecahan: balik pecahan kedua lalu kalikan.\n   2/3 ÷ 4/5 = 2/3 × 5/4 = 10/12 = 5/6"],
            ['Perbandingan, Kecepatan, dan Debit', "Perbandingan: a : b = ka : kb (dapat disederhanakan).\n   Contoh: perbandingan 4:6 = 2:3\n\nKecepatan:\n   Kecepatan = Jarak ÷ Waktu\n   Jarak = Kecepatan × Waktu\n   Waktu = Jarak ÷ Kecepatan\n\nDebit: volume cairan yang mengalir per satuan waktu.\n   Debit = Volume ÷ Waktu\n   Contoh: 600 liter / 5 menit = 120 liter/menit"],
            ['Skala dan Denah', "Skala = Ukuran pada gambar : Ukuran sebenarnya\n\nContoh: Skala 1 : 500.000\n   1 cm di peta = 500.000 cm = 5 km di dunia nyata.\n\nJarak sebenarnya = Jarak peta × Penyebut skala\nJarak peta = Jarak sebenarnya ÷ Penyebut skala\n\nDenah: gambar tampak atas suatu tempat menggunakan skala tertentu."],
            ['Volume Bangun Ruang', "Kubus (rusuk = s):\n   Volume = s × s × s = s³\n   Contoh: s = 4 cm → V = 64 cm³\n\nBalok (panjang = p, lebar = l, tinggi = t):\n   Volume = p × l × t\n   Contoh: p=5, l=3, t=4 → V = 60 cm³\n\nSatuan volume: cm³, dm³ (= 1 liter), m³"],
            ['Penyajian Data: Diagram Garis & Lingkaran', "Diagram Garis: menampilkan perubahan data dari waktu ke waktu.\n   Sumbu X = waktu, Sumbu Y = nilai. Titik-titik dihubungkan dengan garis.\n\nDiagram Lingkaran (Pie Chart):\n   Menyajikan bagian dari keseluruhan dalam bentuk juring (irisan).\n   360° = 100%\n   Sudut juring = (nilai/total) × 360°\n\nContoh: jika 30% = 30/100 × 360° = 108°."],
        ],
        6 => [
            ['Bilangan Bulat Negatif dan Operasi Hitungnya', "Bilangan bulat: … –3, –2, –1, 0, 1, 2, 3 …\n\nAturan operasi:\n• (+) + (+) = positif\n• (–) + (–) = negatif (jumlahkan, beri tanda –)\n• (+) + (–) atau (–) + (+) = selisih, tanda dari angka terbesar\n• (–) × (–) = + ; (–) × (+) = –\n\nGaris bilangan: bilangan semakin ke kanan semakin besar.\nContoh: –3 + 5 = 2 (maju 5 dari –3)"],
            ['Operasi Hitung Campuran', "Urutan pengerjaan (KPKP / PEMDAS):\n1. Kurung (tanda kurung dikerjakan lebih dulu)\n2. Pangkat & Akar\n3. Kali & Bagi (dari kiri ke kanan)\n4. Jumlah & Kurang (dari kiri ke kanan)\n\nContoh:\n   12 + 6 ÷ 2 × 3 = 12 + (6÷2)×3 = 12 + 9 = 21\n   (12 + 6) ÷ 2 × 3 = 18 ÷ 2 × 3 = 9 × 3 = 27"],
            ['Lingkaran: Unsur, Keliling, dan Luas', "Unsur lingkaran:\n• Jari-jari (r): jarak titik pusat ke tepi\n• Diameter (d): d = 2r (garis melewati pusat)\n• Busur: bagian keliling lingkaran\n• Tali busur: garis yang menghubungkan dua titik di keliling\n\nRumus (π ≈ 3,14 atau 22/7):\n   Keliling = 2πr = πd\n   Luas = πr²\n\nContoh: r = 7 cm → K = 2 × 22/7 × 7 = 44 cm ; L = 22/7 × 49 = 154 cm²"],
            ['Luas Permukaan & Volume Bangun Ruang Gabungan', "Luas Permukaan:\n   Kubus = 6 × s²\n   Balok = 2(pl + pt + lt)\n\nVolume bangun gabungan: pisahkan jadi beberapa bangun sederhana, hitung masing-masing lalu jumlahkan (atau kurangi jika berlubang).\n\nContoh: Bangun L = balok besar – balok kecil yang dikeluarkan."],
            ['Statistika Dasar: Mean, Median, Modus', "Data: 7, 8, 8, 9, 10\n\nMean (Rata-rata):\n   = Jumlah data ÷ Banyak data\n   = (7+8+8+9+10) ÷ 5 = 42 ÷ 5 = 8,4\n\nMedian (Nilai Tengah):\n   Urutkan data, ambil nilai tengah.\n   Data ganjil: langsung nilai tengah → 8\n   Data genap: rata-rata dua nilai tengah.\n\nModus (Nilai Paling Sering Muncul):\n   8 muncul 2 kali → Modus = 8"],
        ],

        /* ===== SMP ===== */
        7 => [
            ['Bilangan Bulat, Pecahan, dan Berpangkat', "Bilangan bulat: negatif, nol, positif.\n\nOperasi pecahan:\n   a/b + c/d = (ad + bc)/(bd)\n   a/b × c/d = ac/bd\n\nBilangan berpangkat:\n   a^n = a × a × ... × a (n faktor)\n   2^5 = 32 ; 10^3 = 1.000\n\nSifat: a^m × a^n = a^(m+n) ; a^m ÷ a^n = a^(m–n) ; (a^m)^n = a^(mn)"],
            ['Himpunan: Konsep, Operasi, Diagram Venn', "Himpunan: kumpulan objek yang terdefinisi jelas.\n   A = {1, 2, 3, 4}\n\nOperasi:\n• Irisan (∩): anggota yang ada di A dan B sekaligus.\n• Gabungan (∪): semua anggota A atau B.\n• Komplemen (Aᶜ): anggota semesta yang tidak di A.\n• Selisih (A – B): anggota A yang tidak di B.\n\nDiagram Venn: visualisasi himpunan dengan lingkaran-lingkaran yang tumpang tindih."],
            ['Bentuk Aljabar: Unsur dan Operasi', "Variabel: simbol (biasanya x, y, z) yang mewakili bilangan tidak diketahui.\nKoefisien: angka pengali variabel. Pada 3x, koefisiennya 3.\nKonstanta: bilangan tanpa variabel.\n\nSuku sejenis: memiliki variabel dan pangkat yang sama.\n   3x + 5x = 8x (bisa dijumlahkan)\n   3x + 5y ≠ bisa disederhanakan (tidak sejenis)\n\nPerkalian: 2(x + 3) = 2x + 6"],
            ['Persamaan & Pertidaksamaan Linear Satu Variabel', "Persamaan: 2x + 5 = 13\n   → 2x = 8 → x = 4\n\nCara: lakukan operasi yang sama pada kedua ruas.\n\nPertidaksamaan: 3x – 1 > 8\n   → 3x > 9 → x > 3\n   Solusi: semua bilangan lebih dari 3.\n\nPerhatian: jika kedua ruas dikali/bagi bilangan NEGATIF, tanda pertidaksamaan DIBALIK."],
            ['Perbandingan: Senilai dan Berbalik Nilai', "Perbandingan Senilai: jika x bertambah, y ikut bertambah secara proporsional.\n   x₁/y₁ = x₂/y₂\n   Contoh: 2 pensil = Rp4.000 ; 5 pensil = ?\n   5/2 × 4.000 = Rp10.000\n\nPerbandingan Berbalik Nilai: jika x bertambah, y berkurang.\n   x₁ × y₁ = x₂ × y₂\n   Contoh: 4 pekerja selesai 6 hari; 3 pekerja = 4×6÷3 = 8 hari"],
            ['Aritmetika Sosial', "Harga Beli (HB), Harga Jual (HJ):\n   Untung = HJ – HB (jika HJ > HB)\n   Rugi = HB – HJ (jika HB > HJ)\n   Persen untung = (Untung ÷ HB) × 100%\n\nDiskon: Harga bayar = Harga asal – Diskon\nBunga Tunggal: B = M × p% × t\nPajak: Harga akhir = Harga + (pajak% × Harga)"],
            ['Garis dan Sudut', "Sudut: diukur dalam derajat (°).\n• Sudut siku-siku = 90°\n• Sudut pelurus = 180° (dua sudut berdampingan)\n• Sudut penyiku: a + b = 90°\n\nGaris sejajar & transversal:\n• Sudut sehadap: sama besar\n• Sudut berselang-seling: sama besar\n• Sudut sepihak: berjumlah 180°"],
            ['Bangun Datar Segiempat dan Segitiga', "Segitiga:\n   Jumlah sudut = 180°\n   Luas = ½ × alas × tinggi\n\nJenis segitiga: sama sisi, sama kaki, sembarang, siku-siku, lancip, tumpul.\n\nSegiempat penting:\n• Persegi: K=4s, L=s²\n• Persegi panjang: K=2(p+l), L=p×l\n• Jajar genjang: L=a×t\n• Trapesium: L=½×(a+b)×t\n• Belah ketupat: L=½×d₁×d₂"],
        ],
        8 => [
            ['Pola Bilangan dan Barisan', "Pola bilangan: mencari aturan dari susunan bilangan.\n\nBarisan Aritmetika:\n   Beda (b) tetap: 2, 5, 8, 11, … (b = 3)\n   Un = a + (n – 1)b\n\nBarisan Geometri:\n   Rasio (r) tetap: 2, 6, 18, 54, … (r = 3)\n   Un = a × r^(n–1)\n\nJumlah n suku aritmetika:\n   Sn = n/2 × (a + Un) = n/2 × (2a + (n–1)b)"],
            ['Sistem Koordinat Kartesius', "Koordinat Kartesius: pasangan bilangan (x, y) untuk menentukan posisi titik.\n\nSumbu X: mendatar (positif ke kanan, negatif ke kiri)\nSumbu Y: tegak (positif ke atas, negatif ke bawah)\nTitik asal O(0, 0)\n\nKuadran:\n   I: (+, +) ; II: (–, +) ; III: (–, –) ; IV: (+, –)\n\nJarak dua titik: d = √((x₂–x₁)² + (y₂–y₁)²)"],
            ['Relasi dan Fungsi', "Relasi: aturan yang memasangkan anggota himpunan A ke himpunan B.\n\nFungsi: setiap anggota domain (A) dipasangkan TEPAT SATU ke kodomain (B).\n\nNotasi: f(x) = 2x + 1\n   f(3) = 2(3) + 1 = 7\n\nDomain: himpunan nilai x yang diperbolehkan.\nRange: himpunan hasil f(x)."],
            ['Persamaan Garis Lurus', "Bentuk umum: y = mx + c\n   m = gradien (kemiringan garis)\n   c = titik potong sumbu Y (y-intercept)\n\nGradien:\n   m = (y₂ – y₁) ÷ (x₂ – x₁)\n\nGaris sejajar: m₁ = m₂\nGaris tegak lurus: m₁ × m₂ = –1\n\nBentuk lain: ax + by + c = 0"],
            ['Sistem Persamaan Linear Dua Variabel (SPLDV)', "Dua persamaan, dua variabel (x dan y).\n\nMetode Substitusi:\n   Dari persamaan 1, nyatakan x dalam y, lalu substitusi ke persamaan 2.\n\nMetode Eliminasi:\n   Kalikan kedua persamaan agar koefisien salah satu variabel sama, lalu kurangkan.\n\nContoh: x + y = 5 dan x – y = 1 → eliminasi y: 2x = 6 → x = 3, y = 2"],
            ['Teorema Pythagoras', "Segitiga siku-siku: sisi tegak a dan b, sisi miring c (hipotenusa).\n\n   a² + b² = c²\n\nCari sisi miring: c = √(a² + b²)\nCari sisi tegak: a = √(c² – b²)\n\nTriple Pythagoras umum: (3,4,5), (5,12,13), (8,15,17)\n\nAplikasi: tinggi tiang, jarak diagonal, panjang tangga."],
            ['Lingkaran: Sudut, Luas Juring, Garis Singgung', "Sudut Pusat: sudut yang bertitik pusat di pusat lingkaran.\nSudut Keliling: sudut yang titik puncaknya di keliling (= ½ sudut pusat yang menghadap busur sama).\n\nLuas Juring = (sudut/360°) × πr²\nPanjang Busur = (sudut/360°) × 2πr\n\nGaris Singgung Lingkaran: tegak lurus terhadap jari-jari di titik singgung."],
            ['Bangun Ruang Sisi Datar', "Kubus: 6 sisi persegi, 12 rusuk, 8 titik sudut.\n   V = s³ ; L.permukaan = 6s²\n\nBalok: 6 sisi persegi panjang.\n   V = p×l×t ; L.permukaan = 2(pl+pt+lt)\n\nPrisma: alas & tutup kongruen, sisi tegak persegi panjang.\n   V = L.alas × tinggi\n\nLimas: alas segiempat, sisi tegak segitiga.\n   V = ⅓ × L.alas × tinggi"],
            ['Statistika: Pemusatan & Penyebaran Data', "Ukuran Pemusatan:\n• Mean (rata-rata): jumlah ÷ banyak data\n• Median: nilai tengah data terurut\n• Modus: nilai yang paling sering muncul\n\nUkuran Penyebaran:\n• Jangkauan = data max – data min\n• Kuartil: Q1 (25%), Q2 (50%), Q3 (75%)\n• Simpangan kuartil = ½(Q3 – Q1)"],
            ['Peluang: Titik Sampel & Ruang Sampel', "Percobaan acak: hasilnya tidak dapat dipastikan.\nRuang Sampel (S): himpunan semua kemungkinan hasil.\nTitik Sampel: setiap anggota ruang sampel.\n\nPeluang suatu kejadian A:\n   P(A) = n(A) / n(S)\n   0 ≤ P(A) ≤ 1\n\nContoh: Dadu dilempar. S = {1,2,3,4,5,6}\n   P(angka genap) = P({2,4,6}) = 3/6 = 1/2"],
        ],
        9 => [
            ['Perpangkatan dan Bentuk Akar', "Sifat Pangkat:\n   aᵐ × aⁿ = aᵐ⁺ⁿ\n   aᵐ ÷ aⁿ = aᵐ⁻ⁿ\n   (aᵐ)ⁿ = aᵐⁿ\n   a⁰ = 1 (a ≠ 0)\n   a⁻ⁿ = 1/aⁿ\n\nBentuk Akar:\n   √(a×b) = √a × √b\n   √(a/b) = √a / √b\n   Merasionalkan penyebut: 1/√a = √a/a"],
            ['Persamaan Kuadrat: Akar & Diskriminan', "Bentuk umum: ax² + bx + c = 0 (a ≠ 0)\n\nCara menyelesaikan:\n1. Faktorisasi: (x – x₁)(x – x₂) = 0\n2. Melengkapi kuadrat sempurna\n3. Rumus ABC: x = (–b ± √(b²–4ac)) / 2a\n\nDiskriminan D = b² – 4ac:\n   D > 0: dua akar real berbeda\n   D = 0: dua akar real sama\n   D < 0: tidak ada akar real"],
            ['Fungsi Kuadrat: Grafik Parabola', "f(x) = ax² + bx + c\n\nBentuk vertex: f(x) = a(x – h)² + k\n   Titik puncak (vertex): (h, k)\n\nSumbu simetri: x = –b / 2a\nNilai puncak: k = f(h)\n\nJika a > 0: parabola terbuka ke atas (minimum di puncak)\nJika a < 0: parabola terbuka ke bawah (maksimum di puncak)"],
            ['Transformasi Geometri', "1. Translasi (Geser): T(a, b) → titik (x, y) → (x+a, y+b)\n\n2. Refleksi (Cermin):\n   Terhadap sumbu X: (x, y) → (x, –y)\n   Terhadap sumbu Y: (x, y) → (–x, y)\n   Terhadap y = x: (x, y) → (y, x)\n\n3. Rotasi (Putar) pusat O, sudut θ:\n   90°: (x, y) → (–y, x)\n   180°: (x, y) → (–x, –y)\n\n4. Dilatasi: (x, y) → (kx, ky); k = faktor skala"],
            ['Kesebangunan dan Kekongruenan', "Kongruen (≅): dua bangun yang sama bentuk DAN ukurannya.\n   Syarat segitiga kongruen: SSS, SAS, ASA, AAS\n\nSebangun (~): dua bangun yang sama bentuknya tapi berbeda ukuran.\n   Sudut-sudut bersesuaian sama besar.\n   Sisi-sisi bersesuaian sebanding.\n\nSkala = sisi gambar / sisi nyata"],
            ['Bangun Ruang Sisi Lengkung', "Tabung:\n   V = πr²t\n   L.permukaan = 2πr(r + t)\n\nKerucut:\n   Garis pelukis l = √(r² + t²)\n   V = ⅓πr²t\n   L.permukaan = πr(r + l)\n\nBola:\n   V = 4/3 πr³\n   L.permukaan = 4πr²"],
        ],

        /* ===== SMA/SMK ===== */
        10 => [
            ['Eksponen dan Logaritma', "Eksponen (pangkat):\n   Sifat: aᵐ × aⁿ = aᵐ⁺ⁿ ; a⁻ⁿ = 1/aⁿ ; a^(1/n) = ⁿ√a\n\nLogaritma:\n   ᵃlog b = c ↔ aᶜ = b\n   log (berjangkauan 10): log 100 = 2\n   ln (berjangkauan e ≈ 2,718)\n\nSifat logaritma:\n   log(xy) = log x + log y\n   log(x/y) = log x – log y\n   log xⁿ = n log x"],
            ['Nilai Mutlak Linear Satu Variabel', "|x| = x jika x ≥ 0 ; |x| = –x jika x < 0\n\nPersamaan |ax + b| = c (c ≥ 0):\n   ax + b = c atau ax + b = –c\n\nPertidaksamaan:\n   |x| < c → –c < x < c\n   |x| > c → x < –c atau x > c\n\nContoh:\n   |2x – 1| = 5 → 2x – 1 = 5 → x = 3\n   atau 2x – 1 = –5 → x = –2"],
            ['Sistem Persamaan Linear Tiga Variabel (SPLTV)', "Tiga persamaan, tiga variabel (x, y, z).\n\nLangkah:\n1. Eliminasi satu variabel dari dua pasang persamaan → dapatkan 2 persamaan 2 variabel (SPLDV)\n2. Selesaikan SPLDV\n3. Substitusi kembali untuk variabel ketiga\n\nContoh:\n   x + y + z = 6\n   2x – y + z = 3\n   x + 2y – z = 2"],
            ['Fungsi: Linear, Kuadrat, dan Rasional', "Fungsi Linear: f(x) = mx + c\n   Grafik: garis lurus, m = gradien.\n\nFungsi Kuadrat: f(x) = ax² + bx + c\n   Grafik: parabola, buka atas (a>0) atau bawah (a<0).\n\nFungsi Rasional: f(x) = P(x)/Q(x)\n   Asimtot vertikal: Q(x) = 0\n   Asimtot horizontal: bandingkan derajat P & Q"],
            ['Fungsi Komposisi dan Fungsi Invers', "Komposisi (f∘g)(x) = f(g(x))\n   Urutan: kerjakan g(x) dulu, hasilnya masukkan ke f.\n\nInvers f⁻¹:\n   Jika f(x) = y, maka f⁻¹(y) = x.\n   Cara mencari: tukar x dan y, lalu selesaikan untuk y.\n\nContoh: f(x) = 2x + 3\n   y = 2x + 3 → x = (y–3)/2\n   f⁻¹(x) = (x–3)/2"],
            ['Trigonometri Dasar', "Pada segitiga siku-siku (siku-siku di C):\n   sin A = sisi depan / sisi miring\n   cos A = sisi samping / sisi miring\n   tan A = sisi depan / sisi samping\n\nSudut Istimewa:\n   sin 30° = 1/2 ; cos 30° = ½√3 ; tan 30° = 1/√3\n   sin 45° = ½√2 ; cos 45° = ½√2 ; tan 45° = 1\n   sin 60° = ½√3 ; cos 60° = 1/2 ; tan 60° = √3\n\nAturan Sinus: a/sin A = b/sin B = c/sin C\nAturan Cosinus: a² = b² + c² – 2bc cos A"],
        ],
        11 => [
            ['Induksi Matematika', "Pembuktian dengan Induksi Matematika (3 langkah):\n1. Basis: buktikan P(1) benar.\n2. Hipotesis induksi: asumsikan P(k) benar.\n3. Langkah induksi: buktikan P(k+1) benar berdasarkan P(k).\n\nContoh: 1+2+…+n = n(n+1)/2\n   Basis (n=1): 1 = 1×2/2 = 1 ✓\n   Langkah: asumsikan benar untuk k, buktikan untuk k+1."],
            ['Program Linear Dua Variabel', "Mencari nilai optimum (maks/min) pada daerah feasible.\n\nLangkah:\n1. Ubah kendala jadi pertidaksamaan.\n2. Gambar grafik, tentukan daerah feasible.\n3. Temukan titik-titik sudut daerah feasible.\n4. Substitusi ke fungsi tujuan (z = ax + by).\n5. Pilih titik yang memberi nilai z optimal.\n\nMetode Garis Selidik: geser garis z = ax + by sejajar untuk mencari titik optimal."],
            ['Matriks: Operasi, Determinan, Invers', "Matriks: susunan bilangan dalam baris dan kolom.\n\nOperasi:\n   Tambah/kurang: komponen bersesuaian (ordo harus sama)\n   Kali: (A×B)ᵢⱼ = dot product baris i A dengan kolom j B (kolom A = baris B)\n\nDeterminan 2×2: det[[a,b],[c,d]] = ad – bc\n\nInvers: A⁻¹ = (1/det A) × adj A\n   Syarat: det A ≠ 0"],
            ['Barisan dan Deret Aritmetika & Geometri', "Barisan Aritmetika:\n   Un = a + (n–1)b\n   Sn = n/2 (2a + (n–1)b) = n/2 (a + Un)\n\nBarisan Geometri:\n   Un = a × rⁿ⁻¹\n   Sn = a(rⁿ – 1)/(r–1) untuk r ≠ 1\n\nDeret Geometri Tak Hingga (|r| < 1):\n   S∞ = a/(1–r)"],
            ['Limit Fungsi Aljabar', "Limit: nilai yang didekati f(x) saat x mendekati suatu nilai c.\n   lim_{x→c} f(x) = L\n\nTeknik:\n• Substitusi langsung (jika tidak menghasilkan 0/0)\n• Faktorisasi (eliminir faktor penyebab 0/0)\n• Perkalian sekawan (untuk bentuk akar)\n• Aturan L'Hôpital (jika bentuk 0/0 atau ∞/∞)\n\nlim_{x→0} sin x / x = 1"],
            ['Turunan Fungsi Aljabar', "Definisi: f'(x) = lim_{h→0} [f(x+h) – f(x)] / h\n\nRumus:\n   d/dx[xⁿ] = nxⁿ⁻¹\n   d/dx[af(x)] = a f'(x)\n   d/dx[f+g] = f' + g'\n\nAturan Rantai: [f(g(x))]' = f'(g(x)) × g'(x)\nAturan Hasil Kali: (fg)' = f'g + fg'\n\nAplikasi: kecepatan, laju perubahan, titik stasioner (f'(x) = 0)."],
            ['Integral Tak Tentu Fungsi Aljabar', "Integral = anti-turunan.\n\nRumus dasar:\n   ∫xⁿ dx = xⁿ⁺¹/(n+1) + C (n ≠ –1)\n   ∫a dx = ax + C\n   ∫[f(x) + g(x)] dx = ∫f dx + ∫g dx\n\nContoh:\n   ∫3x² dx = 3 × x³/3 + C = x³ + C\n\nC = konstanta integrasi (tidak boleh dihilangkan!)"],
        ],
        12 => [
            ['Dimensi Tiga: Jarak dalam Ruang', "Menghitung jarak di ruang 3D menggunakan koordinat atau geometri.\n\nJarak titik ke titik: d = √((Δx)² + (Δy)² + (Δz)²)\n\nJarak titik ke garis:\n   1. Proyeksikan titik ke garis\n   2. Hitung panjang proyeksi tegak lurus\n\nJarak titik ke bidang:\n   1. Cari persamaan bidang\n   2. Gunakan rumus jarak titik ke bidang\n\nJarak garis ke garis: untuk garis sejajar, gambar bidang perantara."],
            ['Statistika Lanjut: Data Berkelompok', "Data Berkelompok: data dikelompokkan dalam kelas interval.\n\nHistogram: diagram batang untuk data berkelompok (tidak ada jarak antar batang).\n\nPoligon Frekuensi: titik tengah kelas dihubungkan dengan garis.\n\nOgive: grafik frekuensi kumulatif (frekuensi jumlahnya terus bertambah).\n\nMean berkelompok: x̄ = Σ(fᵢ × xᵢ) / Σfᵢ\nMedian: Me = L + [(n/2 – F)/f] × p\nModus: Mo = L + [d₁/(d₁+d₂)] × p"],
            ['Aturan Pencacahan: Permutasi & Kombinasi', "Aturan Perkalian: jika langkah 1 bisa p cara dan langkah 2 bisa q cara → total p×q cara.\n\nPermutasi (urutan penting):\n   P(n, r) = n! / (n–r)!\n   nPn = n! (semua elemen disusun)\n\nKombinasi (urutan TIDAK penting):\n   C(n, r) = n! / [r!(n–r)!] = nCr\n\nContoh: memilih 3 dari 5 orang untuk komite (urutan tidak penting):\n   C(5,3) = 10"],
            ['Peluang Kejadian Majemuk', "Peluang Komplemen: P(Aᶜ) = 1 – P(A)\n\nKejadian Saling Lepas (mutually exclusive):\n   P(A ∪ B) = P(A) + P(B)\n\nKejadian Tidak Saling Lepas:\n   P(A ∪ B) = P(A) + P(B) – P(A ∩ B)\n\nKejadian Bebas:\n   P(A ∩ B) = P(A) × P(B)\n\nPeluang Bersyarat:\n   P(A|B) = P(A ∩ B) / P(B)"],
        ],
    ];

    public function run(): void
    {
        foreach (self::TOPICS as $grade => $topics) {
            foreach ($topics as [$title, $content]) {
                $topic = Topic::create(compact('grade', 'title', 'content'));

                for ($i = 0; $i < self::QUESTIONS_PER_TOPIC; $i++) {
                    [$text, $answer, $explanation] = $this->generate($grade);
                    [$options, $answerIndex] = $this->options($answer);

                    Question::create([
                        'topic_id'    => $topic->id,
                        'text'        => $text,
                        'options'     => $options,
                        'answer'      => $answerIndex,
                        'difficulty'  => $this->difficulty($grade),
                        'explanation' => $explanation,
                    ]);
                }
            }
        }
    }

    private function difficulty(int $grade): int
    {
        if ($grade <= 3) return 1;
        if ($grade <= 6) return 2;
        if ($grade <= 9) return 3;
        return 4;
    }

    /** @return array{0: string, 1: int, 2: string} [soal, jawaban, penjelasan] */
    private function generate(int $grade): array
    {
        // SD Kelas 1-2: penjumlahan & pengurangan
        if ($grade <= 2) {
            $max = $grade * 10;
            $op = random_int(0, 1) === 0 ? '+' : '-';
            $a = random_int(1, $max);
            $b = random_int(1, $grade <= 1 ? min($a, 10) : min($a, $max));
            if ($op === '-') [$a, $b] = [$a >= $b ? $a : $b, $a >= $b ? $b : $a];
            $ans = $op === '+' ? $a + $b : $a - $b;
            return ["$a $op $b = ?", $ans, "$a " . ($op === '+' ? 'ditambah' : 'dikurangi') . " $b = $ans"];
        }

        // SD Kelas 3-4: perkalian & pembagian
        if ($grade <= 4) {
            $variant = random_int(0, 2);
            if ($variant === 0) {
                $a = random_int(2, 9);
                $b = random_int(2, 9);
                return ["$a × $b = ?", $a * $b, "$a dikali $b = " . ($a * $b)];
            }
            if ($variant === 1) {
                $b = random_int(2, 9);
                $q = random_int(2, 9);
                $a = $b * $q;
                return ["$a ÷ $b = ?", $q, "$a dibagi $b = $q"];
            }
            // KPK/FPB sederhana
            $a = random_int(2, 6) * 2;
            $b = random_int(2, 6) * 2;
            $fbp = $this->gcd($a, $b);
            return ["FPB dari $a dan $b = ?", $fbp, "Faktor persekutuan terbesar $a dan $b adalah $fbp"];
        }

        // SD Kelas 5-6: persen, pecahan, bilangan bulat
        if ($grade <= 6) {
            $variant = random_int(0, 2);
            if ($variant === 0) {
                // Persen
                $p = [10, 20, 25, 50][random_int(0, 3)];
                $n = random_int(2, 10) * 20;
                $r = intdiv($p * $n, 100);
                return ["{$p}% dari $n = ?", $r, "$p/100 × $n = $r"];
            }
            if ($variant === 1) {
                // Volume balok sederhana
                $p = random_int(2, 6);
                $l = random_int(2, 5);
                $t = random_int(2, 5);
                $v = $p * $l * $t;
                return ["Volume balok dengan p=$p, l=$l, t=$t adalah ?", $v, "V = $p × $l × $t = $v cm³"];
            }
            // Statistika: mean
            $data = [random_int(4, 8), random_int(4, 8), random_int(4, 8), random_int(4, 8)];
            $sum  = array_sum($data);
            $mean = intdiv($sum, 4);
            $teks = implode(', ', $data);
            return ["Rata-rata dari $teks adalah ?", $mean, "($teks) ÷ 4 = $mean"];
        }

        // SMP Kelas 7-9
        if ($grade <= 9) {
            $variant = random_int(0, 3);
            if ($variant === 0) {
                // PLSV
                $x = random_int(1, 9);
                $a = random_int(2, 5);
                $b = random_int(1, 9);
                $c = $a * $x + $b;
                return ["Jika {$a}x + $b = $c, maka x = ?", $x, "{$a}x = " . ($c - $b) . " → x = $x"];
            }
            if ($variant === 1) {
                // Pythagoras
                $triples = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17]];
                [$a, $b, $c] = $triples[random_int(0, 3)];
                return ["Segitiga siku-siku dengan sisi {$a} dan {$b}. Hipotenusanya = ?", $c, "{$a}^2 + {$b}^2 = " . ($a**2 + $b**2) . " = {$c}^2"];
            }
            if ($variant === 2) {
                // Barisan aritmetika
                $a = random_int(1, 5);
                $d = random_int(2, 6);
                $n = random_int(5, 10);
                $un = $a + ($n - 1) * $d;
                return ["Suku ke-$n barisan $a, " . ($a + $d) . ", " . ($a + 2 * $d) . ", … adalah ?", $un, "Un = a + (n–1)b = $a + " . ($n - 1) . "×$d = $un"];
            }
            // Peluang
            $choices = [['genap dari {1-6}', 3, 6, '2,4,6'], ['ganjil dari {1-6}', 3, 6, '1,3,5'], ['faktor 6 dari {1-6}', 4, 6, '1,2,3,6']];
            [$desc, $num, $den, $faktor] = $choices[random_int(0, 2)];
            $ans = intdiv($num * 10, $den);
            // Nilai sebagai integer untuk jawaban sederhana
            return ["Peluang muncul $desc pada sebuah dadu adalah ? (dalam per-10)", $num * 10 / $den == intval($num * 10 / $den) ? intval($num * 10 / $den) : $num, "P = $num/$den; faktor: {$faktor}"];
        }

        // SMA Kelas 10-11: berbagai topik
        if ($grade === 10) {
            $variant = random_int(0, 2);
            if ($variant === 0) {
                // Akar persamaan kuadrat (jumlah akar)
                $r1 = random_int(1, 6);
                $r2 = random_int(1, 6);
                return ['Jumlah akar-akar x² – ' . ($r1 + $r2) . 'x + ' . ($r1 * $r2) . ' = 0 adalah ?', $r1 + $r2, "Akar-akarnya $r1 dan $r2; jumlahnya = " . ($r1 + $r2)];
            }
            if ($variant === 1) {
                // Logaritma sederhana
                $base = [2, 3, 5][random_int(0, 2)];
                $exp  = random_int(2, 4);
                $val  = $base ** $exp;
                return ["Nilai dari log_{$base}({$val}) = ?", $exp, "{$base}^{$exp} = {$val}, jadi log_{$base}({$val}) = {$exp}"];
            }
            // Komposisi fungsi
            $a = random_int(1, 4);
            $b = random_int(1, 5);
            $x = random_int(2, 5);
            $gx = $a * $x + $b;
            $fgx = $gx * 2 + 1;
            return ["f(x) = 2x+1, g(x) = {$a}x+{$b}. Nilai (f∘g)({$x}) = ?", $fgx, "g({$x}) = {$gx}; f({$gx}) = 2×{$gx}+1 = {$fgx}"];
        }

        if ($grade === 11) {
            $variant = random_int(0, 2);
            if ($variant === 0) {
                // Suku ke-n barisan geometri
                $a = random_int(1, 3);
                $r = random_int(2, 3);
                $n = random_int(3, 6);
                $un = $a * ($r ** ($n - 1));
                return ["Suku ke-$n barisan geometri dengan a=$a dan r=$r adalah ?", $un, "Un = a × r^(n–1) = $a × {$r}^" . ($n - 1) . " = $un"];
            }
            if ($variant === 1) {
                // Turunan
                $a = random_int(2, 6);
                $n = random_int(2, 4);
                $x = random_int(1, 3);
                $r = $a * $n * ($x ** ($n - 1));
                return ["Jika f(x) = {$a}x^$n, maka f'($x) = ?", $r, "f'(x) = " . ($a * $n) . "x^" . ($n - 1) . " → f'($x) = $r"];
            }
            // Determinan matriks 2x2
            $a = random_int(1, 5);
            $b = random_int(1, 5);
            $c = random_int(1, 5);
            $d = random_int(1, 5);
            $det = $a * $d - $b * $c;
            return ["Determinan matriks [[{$a},{$b}],[{$c},{$d}]] = ?", $det, "det = ad – bc = {$a}×{$d} – {$b}×{$c} = $det"];
        }

        // SMA Kelas 12
        $variant = random_int(0, 2);
        if ($variant === 0) {
            // Kombinasi
            $n = random_int(4, 7);
            $r = random_int(2, 3);
            $comb = $this->combination($n, $r);
            return ["C($n,$r) = ?", $comb, "C($n,$r) = $n! / ($r! × " . ($n - $r) . "!) = $comb"];
        }
        if ($variant === 1) {
            // Permutasi
            $n = random_int(4, 6);
            $r = 2;
            $perm = $this->permutation($n, $r);
            return ["P($n,$r) = ?", $perm, "P($n,$r) = $n! / " . ($n - $r) . "! = $perm"];
        }
        // Peluang komplemen
        $p = [1, 2, 3][random_int(0, 2)];
        $q = [4, 5, 6][random_int(0, 2)];
        $comp_num = $q - $p;
        return ["P(A) = $p/$q, maka P(Aᶜ) = ?", $comp_num, "P(Aᶜ) = 1 – $p/$q = " . ($q - $p) . "/$q"];
    }

    /** @return array{0: list<string>, 1: int} */
    private function options(int $answer): array
    {
        $options = [$answer];
        $spread  = max(3, abs($answer) > 30 ? 10 : 5);
        $tries   = 0;

        while (count($options) < 4 && $tries < 200) {
            $tries++;
            $delta  = random_int(1, $spread);
            $sign   = random_int(0, 1) === 0 ? 1 : -1;
            $wrong  = $answer + $delta * $sign;

            if ($wrong !== $answer && ! in_array($wrong, $options, true)) {
                $options[] = $wrong;
            }
        }

        shuffle($options);
        return [array_map('strval', $options), (int) array_search($answer, $options, true)];
    }

    private function gcd(int $a, int $b): int
    {
        return $b === 0 ? abs($a) : $this->gcd($b, $a % $b);
    }

    private function factorial(int $n): int
    {
        if ($n <= 1) return 1;
        return $n * $this->factorial($n - 1);
    }

    private function combination(int $n, int $r): int
    {
        return intdiv($this->factorial($n), $this->factorial($r) * $this->factorial($n - $r));
    }

    private function permutation(int $n, int $r): int
    {
        return intdiv($this->factorial($n), $this->factorial($n - $r));
    }
}

