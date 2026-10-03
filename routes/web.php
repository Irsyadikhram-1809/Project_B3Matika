<?php

use Illuminate\Support\Facades\Route;

// SPA React: semua URL non-API dilayani oleh satu view, routing ditangani React Router.
Route::view('/{any?}', 'app')->where('any', '^(?!api(/|$)).*$');
