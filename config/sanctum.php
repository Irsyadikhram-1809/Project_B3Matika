<?php

return [
    // Autentikasi memakai Bearer token (bukan cookie SPA), jadi tidak ada domain stateful.
    'stateful' => [],

    // Kosong = hanya token yang diperiksa, bukan sesi web.
    'guard' => [],

    // Masa berlaku token dalam menit (default 7 hari, sama seperti versi JWT sebelumnya).
    'expiration' => (int) env('SANCTUM_EXPIRATION', 60 * 24 * 7),

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    'middleware' => [
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies' => Illuminate\Cookie\Middleware\EncryptCookies::class,
        'validate_csrf_token' => Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
    ],
];
