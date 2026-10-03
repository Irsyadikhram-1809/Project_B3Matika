# B3Matika — Belajar, Berlatih, Bermain

Website belajar matematika kelas 1 SD – 12 SMA/SMK.
**Laravel 11** (API + Sanctum) di backend, **React 18 + Vite** di frontend (satu repositori).

## Fitur
- Materi per kelas (1–12) + latihan soal pilihan ganda dengan penjelasan
- Game Kilat Hitung (30 detik) dan Puzzle (cryptarithm & teka-teki)
- Poin, level (tiap 100 poin), papan skor
- Daftar / masuk / keluar (token Laravel Sanctum)
- Admin di URL tersembunyi `/panel-rahasia/login` (tidak ditautkan di situs; non-admin melihat 404):
  CRUD materi, soal, puzzle; blokir/hapus pengguna; evaluasi kesulitan soal

## Menjalankan di Laragon (Windows)
Proyek ini **satu folder**: Laravel 11 (Blade `resources/views/app.blade.php` sebagai pembungkus) + React 18 (Vite, `resources/js`).
Syarat: **PHP 8.2+**, Composer 2, **Node 18+**. Versi PHP bawaan Laragon lama sering 8.1, ganti lewat Menu Laragon > PHP > Version.

1. Ekstrak ke `C:\laragon\www\b3matika` sehingga file `C:\laragon\www\b3matika\artisan` ada (jangan `b3matika\b3matika`).
2. Klik dua kali **`cek-lingkungan.bat`**. Skrip memasang PHP/Composer/Node milik Laragon ke PATH sesi itu dan memeriksa versi serta ekstensi PHP.
3. Klik dua kali **`setup-laragon.bat`**: composer install, `.env`, key, SQLite, migrate + seed, npm install, npm run build.
4. Laragon > Start All, lalu buka `http://b3matika.test` (Auto Virtual Host mengarah ke folder `public`).

Pengembangan dengan hot reload: buka **Terminal dari Laragon**, `cd C:\laragon\www\b3matika`, jalankan `npm run dev` dan biarkan terbuka. Setelah selesai, tutup dengan Ctrl+C; jika tampilan kosong, hapus file `public\hot`.
Folder `public/build` sudah berisi hasil build, jadi situs bisa dibuka tanpa Node. Setelah mengubah file di `resources/js` atau `resources/css`, jalankan `npm run build` lagi.

### Jika `php` / `composer` / `node` / `npm` error di terminal
| Gejala | Penyebab & solusi |
|---|---|
| `'php' is not recognized` (dan composer/node/npm) | Terminal biasa tidak punya PATH Laragon. Pakai tombol **Terminal** di Laragon, atau Menu Laragon > Tools > Path > Add Laragon to Path lalu buka terminal baru. |
| composer: `requires php ^8.2` | PHP aktif terlalu lama. Menu Laragon > PHP > Version, pilih 8.2 atau 8.3 (pasang dulu jika belum ada). |
| `node` tidak ada / `Unsupported engine` | Menu Laragon > Tools > Quick add > Node.js, pilih 18/20/22 (Vite 5 minimal Node 18). |
| `could not find driver` | Ekstensi `pdo_sqlite` belum aktif: Menu Laragon > PHP > Extensions. |
| `Vite manifest not found` | Belum ada `public/build`: jalankan `npm run build` (atau `npm run dev`). |
| Halaman kosong saat `npm run dev` sudah ditutup | Hapus `public\hot`. |
| Lain-lain | Jalankan `cek-lingkungan.bat` dan baca baris `[GAGAL]` / `[PERHATIAN]`. |

Memakai MySQL Laragon: buat database `b3matika` di HeidiSQL, lalu ikuti petunjuk di `.env.example`.

## Menjalankan (manual, tanpa Laragon)
```bash
composer setup          # install, .env, key, SQLite, migrate --seed, npm install, build
composer dev            # php artisan serve (:8000) + Vite (:5173) -> buka http://localhost:8000
```
Atau manual:
```bash
composer install && cp .env.example .env && php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
npm install && npm run dev      # terminal 1
php artisan serve               # terminal 2
```
Isi ulang data awal: `php artisan migrate:fresh --seed`. Jalankan test: `composer test`.

## Produksi
```bash
npm run build                                   # hasil di public/build
php artisan migrate --force
php artisan config:cache route:cache view:cache
```
Set `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL`, dan database di `.env`. Arahkan web server ke folder `public/`.

## Akun awal (ganti segera!)
- Admin: `admin@b3matika.test` / `admin12345` → `/panel-rahasia/login`
- Siswa: `siswa@b3matika.test` / `siswa12345`

## Struktur
```
app/
  Http/Controllers/Api/        Auth, Home, Grade, Topic, Question, Game, Puzzle, Leaderboard
  Http/Controllers/Api/Admin/  Stats, User, Topic, Question, Puzzle
  Http/Middleware/             EnsureAdmin (404 untuk non-admin), EnsureUserIsActive
  Http/Requests/               validasi (Auth/, Admin/)
  Http/Resources/              UserResource, PuzzleResource (kunci jawaban tidak dikirim)
  Models/                      User, Topic, Question, Attempt, Puzzle, PuzzleSolve
  Services/                    CryptarithmSolver, DifficultyEvaluator
database/                      migrations, factories, seeders
routes/api.php                 semua endpoint /api/*
routes/web.php                 SPA catch-all → resources/views/app.blade.php
resources/js/
  lib/api.js                   fetch + Bearer token
  context/AuthContext.jsx      state login
  components/                  Logo, Navbar, NotFound
  pages/                       Home, Games, Board, AuthForm
  pages/learn|puzzle|admin/    halaman per fitur
tests/                         Feature + Unit (PHPUnit)
```

## Endpoint API
| Method | URL | Akses |
|---|---|---|
| POST | `/api/auth/register`, `/auth/login`, `/auth/admin-login` | publik (login dibatasi 10x/menit) |
| POST | `/api/auth/logout` · GET `/api/me` | login |
| GET | `/api/home`, `/grades/{1-12}`, `/topics/{id}`, `/puzzles`, `/puzzles/{id}`, `/leaderboard` | publik |
| POST | `/api/questions/{id}/answer`, `/games/score`, `/puzzles/{id}/check` | login |
| * | `/api/admin/stats`, `/admin/users`, `/admin/{topics,questions,puzzles}` | admin |

Semua error API berbentuk `{ "error": "pesan" }`.

## Menambah konten
Admin → Soal: opsi satu per baris, `answer` = indeks jawaban benar (0 = pertama).
Admin → Puzzle: `type` = `cryptarithm` atau `teka-teki`.
Cryptarithm: `data` = `{"equation":"AB + C = DE","hint":"..."}`.
Teka-teki: `data` = `{"question":"..."}`, `solution` = `{"answer":"..."}`.
