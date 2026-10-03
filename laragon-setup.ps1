# Setup B3Matika untuk Laragon (Windows).
# Jalankan lewat setup-laragon.bat (klik dua kali) atau cek-lingkungan.bat (hanya mengecek).
param([switch]$CheckOnly)

$project = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $project
$problems = 0

function Say($m, $c = 'Cyan') { Write-Host $m -ForegroundColor $c }
function Ok($m)   { Say "[OK]         $m" 'Green' }
function Warn($m) { Say "[PERHATIAN]  $m" 'Yellow' }
function Bad($m)  { Say "[GAGAL]      $m" 'Red' }

function Get-Ver($text, $pattern) {
    $m = [regex]::Match($text, $pattern)
    if ($m.Success) { return [version]$m.Groups[1].Value }
    return [version]'0.0.0'
}

# Cari folder versi tertinggi di $base yang berisi $exe (mis. bin\php\php-8.3.x-...\php.exe)
function Find-Best($base, $exe, $pattern) {
    if (-not (Test-Path $base)) { return $null }
    $found = Get-ChildItem -Path $base -Directory -ErrorAction SilentlyContinue |
        Where-Object { Test-Path (Join-Path $_.FullName $exe) } |
        ForEach-Object { [pscustomobject]@{ Path = $_.FullName; Name = $_.Name; Ver = (Get-Ver $_.Name $pattern) } } |
        Sort-Object -Property Ver -Descending
    return ($found | Select-Object -First 1)
}

function Find-Laragon {
    $candidates = @()
    if ($env:LARAGON_ROOT) { $candidates += $env:LARAGON_ROOT }
    $dir = $project
    while ($dir) {
        $candidates += $dir
        $parent = Split-Path -Parent $dir
        if (-not $parent -or $parent -eq $dir) { break }
        $dir = $parent
    }
    foreach ($d in 'C', 'D', 'E') { $candidates += "${d}:\laragon" }
    foreach ($c in $candidates) {
        if ($c -and (Test-Path (Join-Path $c 'bin\php'))) { return $c }
    }
    return $null
}

Say '=== B3Matika - setup untuk Laragon ==='
Say "Folder proyek: $project"

if (-not (Test-Path (Join-Path $project 'artisan'))) {
    Bad "File 'artisan' tidak ada di folder ini. Pastikan zip diekstrak sehingga jalurnya C:\laragon\www\b3matika\artisan (bukan b3matika\b3matika)."
    exit 1
}

$root = Find-Laragon
if (-not $root) {
    Bad 'Folder Laragon tidak ditemukan (dicari di C:\laragon, D:\laragon, E:\laragon). Set variabel LARAGON_ROOT ke folder Laragon Anda lalu jalankan lagi.'
    exit 1
}
Ok "Laragon: $root"

# ---------- PHP ----------
$php = Find-Best (Join-Path $root 'bin\php') 'php.exe' 'php-(\d+\.\d+\.\d+)'
if (-not $php) {
    Bad "PHP tidak ditemukan di $root\bin\php. Di Laragon: Menu > PHP > Version, atau pasang PHP 8.2/8.3."
    exit 1
}
if ($php.Ver -lt [version]'8.2.0') {
    Bad "PHP tertinggi di Laragon hanya $($php.Ver). Laravel 11 membutuhkan PHP 8.2 atau lebih baru."
    Say "            Unduh PHP 8.3 x64 dari https://windows.php.net/download lalu ekstrak ke $root\bin\php\, kemudian pilih lewat Menu Laragon > PHP > Version." 'Yellow'
    exit 1
}

# ---------- Composer ----------
$composerDir = Join-Path $root 'bin\composer'
$hasBat  = Test-Path (Join-Path $composerDir 'composer.bat')
$hasPhar = Test-Path (Join-Path $composerDir 'composer.phar')

# ---------- Node ----------
$node = Find-Best (Join-Path $root 'bin\nodejs') 'node.exe' 'v(\d+\.\d+\.\d+)'

# Pasang ke PATH sesi ini saja (tidak mengubah sistem)
$prefix = @($php.Path)
if ($hasBat -or $hasPhar) { $prefix += $composerDir }
if ($node) { $prefix += $node.Path }
$env:Path = ($prefix -join ';') + ';' + $env:Path

if ($hasPhar -and -not $hasBat) {
    $script:pharPath = Join-Path $composerDir 'composer.phar'
    function composer { & php $script:pharPath @args }
}

Say ''
Say 'Pengecekan alat:'

$phpLine = (& php -v 2>&1 | Select-Object -First 1)
if ($LASTEXITCODE -eq 0) { Ok "php      -> $phpLine" } else { Bad 'php tidak bisa dijalankan.'; $problems++ }

# Ekstensi PHP yang dibutuhkan Laravel + SQLite
$mods = @(& php -m 2>$null) | ForEach-Object { "$_".Trim().ToLower() }
$missing = @()
foreach ($e in 'ctype', 'curl', 'dom', 'fileinfo', 'mbstring', 'openssl', 'pdo_sqlite', 'tokenizer', 'xml') {
    if ($mods -notcontains $e) { $missing += $e }
}
if ($missing.Count -eq 0) {
    Ok 'Ekstensi PHP lengkap'
} else {
    Warn ('Ekstensi PHP belum aktif: ' + ($missing -join ', '))
    Say '            Aktifkan lewat Menu Laragon > PHP > Extensions, lalu Stop All / Start All.' 'Yellow'
    $problems++
}

if ($hasBat -or $hasPhar) {
    $cLine = (& composer --version 2>&1 | Select-Object -First 1)
    if ($LASTEXITCODE -eq 0) { Ok "composer -> $cLine" } else { Bad "composer error: $cLine"; $problems++ }
} else {
    Bad "Composer tidak ditemukan di $composerDir. Di Laragon: Menu > Tools > Quick add > Composer, atau pasang dari getcomposer.org."
    $problems++
}

$nodeOk = $false
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nv = (& node -v).Trim()
    $nver = Get-Ver $nv '(\d+\.\d+\.\d+)'
    if ($nver -ge [version]'18.0.0') {
        Ok "node     -> $nv"
        $nodeOk = $true
    } else {
        Bad "Node $nv terlalu lama. Vite 5 membutuhkan Node 18 atau lebih baru."
        $problems++
    }
    $npv = (& npm -v 2>&1 | Select-Object -First 1)
    if ($LASTEXITCODE -eq 0) { Ok "npm      -> $npv" } else { Bad "npm error: $npv"; $problems++ }
} else {
    Bad 'Node.js tidak ditemukan. Di Laragon: Menu > Tools > Quick add > Node.js (pilih versi 18/20/22), atau pasang dari nodejs.org.'
    $problems++
}

if ($CheckOnly) {
    Say ''
    if ($problems -eq 0) { Say 'Semua alat siap. Jalankan setup-laragon.bat untuk memasang proyek.' 'Green' }
    else { Say "Ada $problems masalah di atas. Perbaiki dulu, lalu jalankan cek-lingkungan.bat lagi." 'Red' }
    exit ([int]($problems -gt 0))
}

if ($problems -gt 0) {
    Say ''
    Bad 'Setup dihentikan karena alat di atas belum siap. Perbaiki lalu jalankan lagi.'
    exit 1
}

# ---------- Pasang proyek ----------
function Step($t) { Say ''; Say ">>> $t" }
function Must($label) {
    if ($LASTEXITCODE -ne 0) { Bad "$label gagal (kode $LASTEXITCODE). Baca pesan error di atas."; exit 1 }
}

Step 'composer install'
& composer install --no-interaction
Must 'composer install'

if (-not (Test-Path '.env')) {
    Copy-Item '.env.example' '.env'
    Ok '.env dibuat dari .env.example'
}
$envText = Get-Content '.env' -Raw

if ($envText -notmatch '(?m)^APP_KEY=\S+') {
    Step 'php artisan key:generate'
    & php artisan key:generate --ansi
    Must 'key:generate'
}

if ($envText -match '(?m)^DB_CONNECTION=sqlite') {
    $db = Join-Path $project 'database\database.sqlite'
    if (-not (Test-Path $db)) { New-Item -ItemType File -Path $db | Out-Null; Ok 'database\database.sqlite dibuat' }
} else {
    Warn 'DB_CONNECTION bukan sqlite: pastikan database MySQL sudah dibuat (mis. lewat HeidiSQL) dan isi .env sudah benar.'
}

Step 'php artisan migrate --seed'
& php artisan migrate --seed --force
Must 'migrate --seed'

Step 'npm install'
& npm install
Must 'npm install'

Step 'npm run build'
& npm run build
Must 'npm run build'

Say ''
Say '=== SELESAI ===' 'Green'
Say 'Buka di browser (Start All di Laragon dulu): http://b3matika.test   (sesuai nama folder proyek)'
Say 'Alternatif tanpa virtual host: php artisan serve  ->  http://localhost:8000'
Say 'Mode pengembangan (hot reload): npm run dev  (biarkan jalan di terminal terpisah)'
Say 'Admin: /panel-rahasia/login   admin@b3matika.test / admin12345   (ganti password segera)'
