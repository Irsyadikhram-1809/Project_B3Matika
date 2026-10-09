# B3Matika — Mobile App Readiness

Dokumen ini mendokumentasikan semua perubahan yang dibuat untuk mempersiapkan B3Matika agar responsif penuh dan siap dibungkus menjadi aplikasi mobile (PWA / Capacitor).

---

## Status

| Area | Status |
|------|--------|
| Responsivitas (320px–1536px) | ✅ Selesai |
| Navbar hamburger & drawer | ✅ Sudah ada, diperbaiki |
| Admin sidebar + overlay mobile | ✅ Selesai |
| Tabel horizontal scroll | ✅ Selesai |
| AI Tutor chat window (dvh) | ✅ Selesai |
| Game grids fluid | ✅ Selesai |
| PWA Manifest | ✅ Selesai |
| Service Worker | ✅ Selesai |
| Safe-area (notch/home indicator) | ✅ Selesai |
| iOS font-size prevent zoom | ✅ Selesai |
| View Transitions API (prep) | ✅ Selesai |

---

## Perubahan yang Dilakukan

### 1. `index.html`

- Menambahkan `viewport-fit=cover` agar konten tidak terpotong di notch iPhone
- Menambahkan `<link rel="manifest" href="/manifest.json" />`
- Meta tag PWA: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `theme-color`
- Meta Open Graph untuk preview saat dibagikan
- Script registrasi Service Worker yang aman (tidak lempar error jika gagal)

### 2. `public/manifest.json`

File baru. Konfigurasi PWA:
- `display: standalone` — tampil seperti app native saat Add to Home Screen
- Shortcuts ke Materi, Games, dan AI Tutor
- Icons menggunakan logo yang ada
- `theme_color: #1b2468` (sesuai warna brand navy B3Matika)

### 3. `public/sw.js`

File baru. Service Worker dengan strategi:
- **Navigate (HTML)**: Network-first, fallback offline ke `/`
- **Aset statis (JS/CSS/gambar)**: Cache-first, update di background
- **Tidak pernah intercept**: `/api/`, Supabase, Google Fonts, domain eksternal
- Cache name berbasis versi (`b3matika-v1`) — update dengan ganti nomor versi

### 4. `resources/css/app.css` — Seksi 32 (baru)

Blok penambahan responsivitas di akhir file:

#### 32a. Chat window — dvh
```css
.chat-window { height: clamp(400px, 75dvh, 85vh); min-height: unset; }
```
`dvh` memperhitungkan toolbar browser mobile. Sebelumnya `min-height: 650px` menyebabkan overflow di HP kecil.

#### 32b. Admin sidebar overlay
`.admin-sidebar-overlay` yang muncul saat sidebar terbuka di ≤992px. Klik overlay = tutup sidebar.

#### 32c. Table scroll
- `.table-wrap table { min-width: 480px }` — tabel tidak menyusut terlalu sempit
- `.card table { min-width: 360px }` — tabel di dalam card juga aman

#### 32d–32n. Breakpoint micro (360px, 400px, 480px)
- Game 2048: gap grid lebih kecil di 400px
- Sudoku: font fluid di 400px
- Puzzle header: padding fluid di 480px
- AI Tutor: quick prompts 1 kolom di 360px
- Navbar & container: padding aman di 360px
- Hero CTA: tombol vertikal di 360px
- Admin content: padding lebih kecil, sembunyikan user info di 600px
- Calculords/KenKen: tombol compact di 480px

#### 32q–32r. Scroll tab tanpa scrollbar
`scrollbar-width: none` pada `.topic-tabs` dan `.profil-tabs`

#### 32s. Materi code block
`overflow-x: auto; white-space: pre` — kode panjang bisa di-scroll horizontal.

#### 32v. Safe area
```css
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  body { padding-bottom: env(safe-area-inset-bottom); }
  .admin-layout { padding-bottom: 0; }
}
```

#### 32w. View Transitions API
Progressive enhancement — hanya aktif jika browser mendukung dan user tidak pilih `prefers-reduced-motion`.

#### 32z. iOS font-size zoom prevention
```css
@media (max-width: 768px) {
  input, select, textarea { font-size: max(16px, 1em); }
}
```

### 5. `resources/js/pages/admin/AdminGuard.jsx`

- Overlay `.admin-sidebar-overlay` tampil saat sidebar terbuka di mobile
- Sidebar toggle menampilkan `✕` saat terbuka, `☰` saat tertutup
- `aria-expanded` dan `aria-controls` untuk aksesibilitas
- Sidebar links menutup sidebar saat navigasi (`onClick={closeSidebar}`)
- `useEffect` untuk Escape key dan `body.overflow`

### 6. `resources/js/pages/Board.jsx`

Tabel Papan Skor dibungkus dalam `<div className="table-wrap">` terpisah di dalam `.card`.

---

## Cara Membungkus ke Capacitor (Android/iOS)

### Persiapan
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init "B3Matika" "id.b3matika.app" --web-dir=dist
```

### Build dan sync
```bash
npm run build        # build Vite ke dist/
npx cap add android  # atau ios
npx cap sync         # copy dist/ ke native project
npx cap open android # buka Android Studio
```

### Catatan penting
- `viewport-fit=cover` sudah di-set → notch iPhone tertangani
- `env(safe-area-inset-*)` sudah di-handle di CSS → home indicator aman
- `font-size: max(16px, 1em)` → tidak ada zoom aneh di iOS
- Service Worker tidak konflik dengan Capacitor (Capacitor punya native layer sendiri)

---

## Checklist QA Responsivitas

### Breakpoints
| Lebar | Target |
|-------|--------|
| 1536px | Desktop widescreen |
| 1280px | Desktop standard |
| 1024px | Laptop / hamburger aktif |
| 768px  | Tablet portrait |
| 600px  | Phablet |
| 480px  | HP medium |
| 360px  | HP kecil (Samsung Galaxy A) |
| 320px  | HP terkecil (iPhone SE lama) |

### Item Uji
- [ ] Navbar hamburger membuka/menutup drawer dengan benar
- [ ] Admin sidebar: overlay tutup saat diklik, Escape menutup
- [ ] Tabel Papan Skor: bisa di-scroll horizontal di 360px
- [ ] AI Tutor: chat window tidak overflow keyboard virtual (dvh)
- [ ] Game 2048: grid tidak melebihi lebar layar di 360px
- [ ] Sudoku: grid dan numpad fluid
- [ ] Auth form: tidak ada zoom saat tap input (iOS)
- [ ] Add to Home Screen: icon muncul, nama "B3Matika"
- [ ] Offline: halaman beranda tetap muncul (SW cache)
- [ ] Dark mode + mobile: semua komponen tetap terbaca
