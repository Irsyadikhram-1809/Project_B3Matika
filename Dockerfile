# ====================================================
# Dockerfile untuk Laravel 11 + Nginx + PHP-FPM
# Dioptimalkan untuk Render.com free tier
# ====================================================

FROM php:8.2-fpm-alpine

# Install system dependencies + PHP extensions
RUN apk add --no-cache \
        nginx \
        curl \
        unzip \
        git \
        sqlite \
        libpng-dev \
        libxml2-dev \
        oniguruma-dev \
    && docker-php-ext-install \
        pdo \
        pdo_sqlite \
        mbstring \
        xml \
        ctype \
        fileinfo \
        opcache

# Install Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy composer files dulu (untuk layer caching)
COPY composer.json composer.lock ./

# Install dependencies PHP (tanpa dev)
RUN composer install \
        --no-dev \
        --optimize-autoloader \
        --no-interaction \
        --no-scripts

# Copy seluruh aplikasi
COPY . .

# Buat SQLite database jika belum ada
RUN mkdir -p database \
    && touch database/database.sqlite \
    && chmod 664 database/database.sqlite

# Set permission Laravel
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Konfigurasi Nginx
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# Konfigurasi PHP-FPM
RUN sed -i 's/listen = 127.0.0.1:9000/listen = \/tmp\/php-fpm.sock/' /usr/local/etc/php-fpm.d/www.conf \
    && sed -i 's/;listen.owner = www-data/listen.owner = nginx/' /usr/local/etc/php-fpm.d/www.conf \
    && sed -i 's/;listen.group = www-data/listen.group = nginx/' /usr/local/etc/php-fpm.d/www.conf \
    && sed -i 's/;listen.mode = 0660/listen.mode = 0660/' /usr/local/etc/php-fpm.d/www.conf

# Script startup
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8080

CMD ["/start.sh"]
