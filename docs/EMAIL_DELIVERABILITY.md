# Panduan Deliverability Email B3Matika

Dokumen ini menjelaskan cara mengkonfigurasi DNS domain dan memilih penyedia
email transaksional agar email B3Matika (OTP, verifikasi, token admin) masuk
**Kotak Masuk**, bukan folder Spam.

---

## Daftar Isi

1. [Mengapa Email Masuk Spam?](#mengapa-email-masuk-spam)
2. [Memilih Penyedia Email Transaksional](#memilih-penyedia-email-transaksional)
3. [Konfigurasi Variabel Lingkungan](#konfigurasi-variabel-lingkungan)
4. [Rekaman DNS yang Harus Dibuat](#rekaman-dns-yang-harus-dibuat)
   - [SPF](#1-spf-sender-policy-framework)
   - [DKIM](#2-dkim-domainkeys-identified-mail)
   - [DMARC](#3-dmarc-domain-based-message-authentication)
5. [Cara Memverifikasi DNS](#cara-memverifikasi-dns)
6. [Uji Pengiriman Email](#uji-pengiriman-email)
7. [Daftar Periksa Deliverability](#daftar-periksa-deliverability)

---

## Mengapa Email Masuk Spam?

Email dari Gmail pribadi (akun `@gmail.com`) yang dikirim melalui nodemailer
hampir selalu masuk Spam karena:

| Penyebab | Penjelasan |
|----------|-----------|
| Tidak ada DKIM | Gmail tidak menandatangani email yang dikirim via SMTP App Password dengan DKIM domain kustom |
| Reputasi IP rendah | IP server Gmail shared, tidak dioptimalkan untuk email massal/transaksional |
| Tidak ada domain kustom | `From: B3Matika <xxxxx@gmail.com>` memiliki reputasi lebih rendah dari `@b3matika.com` |
| Subjek mencurigakan | Prefix `[Tag]`, tanda seru, atau emoji di teks tombol memicu filter spam |
| Tidak ada `text/plain` | Email hanya HTML tanpa fallback teks adalah pola spam umum |

---

## Memilih Penyedia Email Transaksional

Untuk lingkungan **produksi** sangat disarankan menggunakan penyedia transaksional
dengan reputasi IP tinggi dan dukungan DKIM/DMARC bawaan.

| Penyedia | Paket Gratis | Cara Integrasi | `EMAIL_PROVIDER` |
|----------|-------------|----------------|-----------------|
| **Brevo** (ex Sendinblue) | 300 email/hari | SMTP | `smtp` |
| **Resend** | 100 email/hari, 3.000/bln | API atau SMTP | `resend` atau `smtp` |
| **Mailgun** | 100 email/hari (trial) | SMTP | `smtp` |
| **SendGrid** | 100 email/hari | SMTP | `smtp` |
| **Gmail** | Batas 500/hari | SMTP App Password | `gmail` |

> **Rekomendasi:** Gunakan **Brevo** atau **Resend** untuk produksi karena
> keduanya menawarkan paket gratis, antarmuka yang mudah, dan panduan DNS
> yang jelas.

---

## Konfigurasi Variabel Lingkungan

Salin blok yang sesuai ke file `.env.local` (jangan ke `.env` yang masuk Git).

### Gmail (pengembangan lokal)

```env
EMAIL_PROVIDER=gmail
EMAIL_USER=akun@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx   # App Password, bukan password Gmail biasa
EMAIL_FROM_NAME=B3Matika
```

> **Cara membuat App Password Gmail:**
> 1. Aktifkan 2-Step Verification di <https://myaccount.google.com/security>
> 2. Buka <https://myaccount.google.com/apppasswords>
> 3. Pilih App: "Mail", Device: "Other (Custom)" → beri nama "B3Matika"
> 4. Salin 16 karakter yang muncul → isi ke `EMAIL_PASS`

### Brevo / Mailgun / SendGrid (SMTP)

```env
EMAIL_PROVIDER=smtp
EMAIL_USER=noreply@yourdomain.com
EMAIL_FROM_NAME=B3Matika
EMAIL_REPLY_TO=support@yourdomain.com

SMTP_HOST=smtp-relay.brevo.com    # atau smtp.mailgun.org / smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false                 # true hanya untuk port 465
SMTP_USER=                        # username SMTP dari dashboard penyedia
SMTP_PASS=                        # API key / password SMTP dari penyedia
```

### Resend (API)

```env
EMAIL_PROVIDER=resend
EMAIL_USER=noreply@yourdomain.com   # harus domain terverifikasi di Resend
EMAIL_FROM_NAME=B3Matika
EMAIL_REPLY_TO=support@yourdomain.com
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

---

## Rekaman DNS yang Harus Dibuat

Semua rekaman di bawah ditambahkan di **panel DNS registrar domain Anda**
(misal: Namecheap, Cloudflare, GoDaddy). Ganti `yourdomain.com` dengan
domain Anda yang sebenarnya.

> **Catatan:** Setiap penyedia email menyediakan nilai DKIM yang unik.
> Contoh di bawah adalah pola umum; **nilai aktual harus diambil dari
> dashboard penyedia Anda**.

---

### 1. SPF (Sender Policy Framework)

SPF memberitahu server penerima bahwa hanya server tertentu yang boleh
mengirim email atas nama domain Anda.

**Rekaman DNS:**

| Tipe | Nama (Host) | Nilai (Value) |
|------|------------|---------------|
| `TXT` | `@` (atau `yourdomain.com`) | lihat nilai penyedia di bawah |

**Nilai SPF per penyedia:**

```
# Brevo
v=spf1 include:spf.sendinblue.com ~all

# Resend
v=spf1 include:amazonses.com ~all

# Mailgun
v=spf1 include:mailgun.org ~all

# SendGrid
v=spf1 include:sendgrid.net ~all

# Jika masih pakai Gmail + domain kustom
v=spf1 include:_spf.google.com ~all
```

> Jika sudah ada rekaman SPF sebelumnya (misal untuk G Suite), **gabungkan**
> `include:` dalam satu baris, jangan buat dua rekaman SPF terpisah.
> Contoh gabungan: `v=spf1 include:spf.sendinblue.com include:_spf.google.com ~all`

---

### 2. DKIM (DomainKeys Identified Mail)

DKIM menambahkan tanda tangan kriptografi di setiap email. Nilai public key
**harus diambil dari dashboard penyedia** karena berbeda untuk setiap akun.

**Langkah umum:**

1. Masuk dashboard penyedia → Settings → Domains → Add Domain
2. Masukkan domain Anda → penyedia akan tampilkan daftar rekaman DNS
3. Tambahkan rekaman tersebut ke DNS registrar Anda

**Pola rekaman DKIM (contoh umum):**

```
# Brevo — selector biasanya: mail._domainkey
Tipe : CNAME
Nama : mail._domainkey.yourdomain.com
Nilai: mail._domainkey.yourdomain.com.isp.sendinblue.com

# Resend — biasanya menggunakan Amazon SES DKIM
Tipe : CNAME
Nama : resend._domainkey.yourdomain.com
Nilai: dkim.resend.com

# Mailgun — selector biasanya: mailo atau kp._domainkey
Tipe : TXT
Nama : mailo._domainkey.yourdomain.com
Nilai: k=rsa; p=MIGfMA0GCSqGSIb... (public key panjang dari dashboard)
```

> Nilai di atas hanya **contoh pola**. Salin nilai **persis** dari dashboard
> penyedia Anda.

---

### 3. DMARC (Domain-based Message Authentication)

DMARC memberitahu penerima apa yang harus dilakukan jika SPF atau DKIM gagal,
dan memungkinkan Anda menerima laporan pengiriman.

**Rekaman DNS:**

| Tipe | Nama (Host) | Nilai |
|------|------------|-------|
| `TXT` | `_dmarc.yourdomain.com` | lihat di bawah |

**Mulai dengan kebijakan lunak (monitor dulu sebelum enforce):**

```
v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com; ruf=mailto:dmarc@yourdomain.com; fo=1
```

**Setelah yakin SPF + DKIM konsisten lulus (1-2 minggu), tingkatkan:**

```
# Karantina email yang gagal (masuk Spam, tidak ditolak)
v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc@yourdomain.com

# Penolakan penuh — aktifkan hanya setelah monitor membuktikan semua email sah lulus
v=DMARC1; p=reject; pct=100; rua=mailto:dmarc@yourdomain.com
```

**Keterangan parameter:**

| Parameter | Penjelasan |
|-----------|-----------|
| `p=none` | Hanya monitor, tidak blokir |
| `p=quarantine` | Email gagal masuk Spam |
| `p=reject` | Email gagal ditolak sepenuhnya |
| `rua=` | Alamat email untuk laporan agregat harian |
| `pct=100` | Terapkan kebijakan ke 100% email |

---

## Cara Memverifikasi DNS

### A. Via command line

```bash
# Cek SPF
nslookup -type=TXT yourdomain.com

# Cek DKIM (ganti 'mail' dengan selector penyedia Anda)
nslookup -type=TXT mail._domainkey.yourdomain.com

# Cek DMARC
nslookup -type=TXT _dmarc.yourdomain.com
```

Atau pakai `dig` di Linux/macOS:

```bash
dig TXT yourdomain.com +short
dig TXT mail._domainkey.yourdomain.com +short
dig TXT _dmarc.yourdomain.com +short
```

### B. Via layanan web (lebih mudah)

- **MXToolbox:** <https://mxtoolbox.com/SuperTool.aspx>
  - SPF Lookup: masukkan domain → pilih "SPF Record Lookup"
  - DKIM Lookup: masukkan `selector:yourdomain.com` → pilih "DKIM Lookup"
  - DMARC Lookup: masukkan domain → pilih "DMARC Lookup"

- **Mail-Tester:** <https://www.mail-tester.com>
  - Kirim email uji ke alamat yang diberikan → skor 1-10 (target: minimal 8)

- **Google Admin Toolbox:** <https://toolbox.googleapps.com/apps/checkmx/>

### C. Periksa header email di Gmail

1. Buka email yang diterima di Gmail
2. Klik ikon titik tiga (⋮) → **"Tampilkan asli"** (Show original)
3. Cari baris `Authentication-Results` — contoh hasil baik:

```
Authentication-Results: mx.google.com;
   spf=pass (google.com: domain of noreply@yourdomain.com designates
             xxx.xxx.xxx.xxx as permitted sender) smtp.mailfrom=noreply@yourdomain.com;
   dkim=pass header.i=@yourdomain.com header.s=mail header.b=AbCdEfGh;
   dmarc=pass (p=QUARANTINE sp=QUARANTINE dis=NONE) header.from=yourdomain.com
```

> Ketiga nilai harus `pass`. Jika ada yang `fail` atau `none`, periksa kembali
> rekaman DNS dan konfigurasi penyedia email.

---

## Uji Pengiriman Email

Setelah konfigurasi selesai, jalankan skrip uji:

```bash
# Pastikan variabel lingkungan sudah di-set di .env.local
node scripts/test-email.js
```

Skrip ini mengirim **5 jenis email** (OTP pendaftaran, OTP reset sandi,
permintaan token admin, token disetujui, penolakan) ke alamat `TEST_EMAIL_TO`
dan melaporkan Message-ID setiap email.

---

## Daftar Periksa Deliverability

Centang setiap item sebelum deploy ke produksi:

- [ ] Menggunakan penyedia email transaksional (bukan Gmail pribadi)
- [ ] Domain kustom dikonfigurasi di penyedia (`noreply@yourdomain.com`)
- [ ] Rekaman SPF ditambahkan dan diverifikasi (`spf=pass`)
- [ ] Rekaman DKIM ditambahkan dan diverifikasi (`dkim=pass`)
- [ ] Rekaman DMARC ditambahkan (mulai dengan `p=none`)
- [ ] `EMAIL_PROVIDER`, `EMAIL_FROM_NAME`, `EMAIL_REPLY_TO` di-set di Vercel
- [ ] `npm run build` berhasil tanpa error
- [ ] `node scripts/test-email.js` berhasil (5/5)
- [ ] Email uji masuk Kotak Masuk (bukan Spam) di Gmail
- [ ] Header `Authentication-Results` menunjukkan SPF, DKIM, DMARC = pass

---

*Dokumen ini tidak mengandung nilai secret atau kredensial apapun.
Diperbarui: Oktober 2026.*
