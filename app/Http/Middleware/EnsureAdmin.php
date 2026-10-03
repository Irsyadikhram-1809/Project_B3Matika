<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** Non-admin mendapat 404 agar keberadaan API admin tetap tersembunyi. */
class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless($request->user()?->isAdmin(), 404, 'Tidak ditemukan.');

        return $next($request);
    }
}
