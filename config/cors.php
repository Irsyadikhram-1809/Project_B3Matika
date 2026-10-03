<?php

return [
    /*
     * CORS untuk API Laravel yang diakses frontend React (Vercel).
     * Atur FRONTEND_URL di environment variable Railway agar aman.
     * Contoh: FRONTEND_URL=https://b3matika.vercel.app
     */

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    // Izinkan domain frontend dari env. Di lokal bisa diisi http://localhost:5173
    'allowed_origins' => array_filter(
        explode(',', env('FRONTEND_URL', 'http://localhost:5173,http://localhost:3000'))
    ),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // false karena autentikasi pakai Bearer token, bukan cookie
    'supports_credentials' => false,
];
