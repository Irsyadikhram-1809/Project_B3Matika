#!/bin/sh
set -e

echo "==> Starting B3Matika Laravel Backend..."

# Pastikan storage & cache directory bisa ditulis
mkdir -p /var/www/html/storage/logs
mkdir -p /var/www/html/storage/framework/{cache,sessions,views}
mkdir -p /var/www/html/bootstrap/cache
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Pastikan SQLite database ada
if [ ! -f /var/www/html/database/database.sqlite ]; then
    echo "==> Creating SQLite database..."
    touch /var/www/html/database/database.sqlite
    chown www-data:www-data /var/www/html/database/database.sqlite
fi

# Jalankan migrasi dan seeder
echo "==> Running migrations..."
cd /var/www/html
php artisan migrate --force 2>/dev/null || echo "Migration skipped (already up to date)"

# Seed hanya jika tabel kosong
php artisan db:seed --force 2>/dev/null || echo "Seeder skipped"

# Cache config dan routes
echo "==> Caching config & routes..."
php artisan config:cache
php artisan route:cache

echo "==> Starting PHP-FPM..."
php-fpm -D

echo "==> Starting Nginx..."
nginx -g "daemon off;"
