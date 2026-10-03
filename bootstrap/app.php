<?php

use App\Http\Middleware\EnsureAdmin;
use App\Http\Middleware\EnsureUserIsActive;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // CORS: izinkan request dari frontend Vercel (diatur via env FRONTEND_URL)
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        $middleware->alias([
            'active' => EnsureUserIsActive::class,
            'admin'  => EnsureAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson()
        );

        // Semua error API dikembalikan dalam format { "error": "pesan" }
        // sehingga frontend React cukup membaca satu field.
        $exceptions->render(function (Throwable $e, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            if ($e instanceof ValidationException) {
                return response()->json([
                    'error' => collect($e->errors())->flatten()->first(),
                    'errors' => $e->errors(),
                ], 422);
            }
            if ($e instanceof AuthenticationException) {
                return response()->json(['error' => 'Silakan masuk.'], 401);
            }
            if ($e instanceof ModelNotFoundException || $e instanceof NotFoundHttpException) {
                return response()->json(['error' => 'Tidak ditemukan.'], 404);
            }
            if ($e instanceof TooManyRequestsHttpException) {
                return response()->json(['error' => 'Terlalu banyak percobaan. Coba lagi sebentar lagi.'], 429);
            }
            if ($e instanceof HttpExceptionInterface && $e->getMessage() !== '') {
                return response()->json(['error' => $e->getMessage()], $e->getStatusCode());
            }

            return null;
        });
    })->create();
