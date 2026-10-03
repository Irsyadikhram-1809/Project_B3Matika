<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    /** GET /api/me – data lengkap profil + avatar. */
    public function show(Request $request): JsonResponse
    {
        return response()->json(['user' => new UserResource($request->user())]);
    }

    /** PUT /api/me/profile – ubah nama, email, avatar. */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name'   => ['required', 'string', 'max:60'],
            'email'  => ['required', 'email', 'unique:users,email,' . $user->id],
            'avatar' => ['nullable', 'string', 'max:10'],
        ]);

        $user->update(array_filter($data, fn($v) => $v !== null));

        return response()->json(['user' => new UserResource($user->refresh()), 'ok' => true]);
    }

    /** PUT /api/me/password – ganti password. */
    public function changePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'current_password' => ['required'],
            'password'         => ['required', 'confirmed', Password::min(6)],
        ]);

        if (! Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages(['current_password' => 'Password saat ini salah.']);
        }

        $user->update(['password' => $data['password']]);

        return response()->json(['ok' => true]);
    }

    /** POST /api/auth/forgot-password – kirim link reset via email. */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        $user = User::where('email', $request->input('email'))->first();

        // Selalu balas 200 agar tidak bocorkan eksistensi email.
        if ($user) {
            $token = Str::random(64);

            $user->forceFill([
                'password_reset_token'      => hash('sha256', $token),
                'password_reset_expires_at' => now()->addHour(),
            ])->save();

            $resetUrl = config('app.url') . '/reset-password?token=' . $token . '&email=' . urlencode($user->email);

            Mail::send([], [], function ($message) use ($user, $resetUrl) {
                $message->to($user->email, $user->name)
                    ->subject('[B3Matika] Reset Password')
                    ->html(
                        '<p>Halo <b>' . e($user->name) . '</b>,</p>' .
                        '<p>Klik tautan berikut untuk mengatur ulang passwordmu (berlaku 1 jam):</p>' .
                        '<p><a href="' . $resetUrl . '">' . $resetUrl . '</a></p>' .
                        '<p>Jika kamu tidak meminta ini, abaikan email ini.</p>' .
                        '<p>— Tim B3Matika</p>'
                    );
            });
        }

        return response()->json(['ok' => true, 'message' => 'Jika email terdaftar, link reset telah dikirim.']);
    }

    /** POST /api/auth/reset-password – terapkan password baru. */
    public function resetPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email'    => ['required', 'email'],
            'token'    => ['required', 'string'],
            'password' => ['required', 'confirmed', Password::min(6)],
        ]);

        $user = User::where('email', $data['email'])
            ->where('password_reset_token', hash('sha256', $data['token']))
            ->where('password_reset_expires_at', '>', now())
            ->first();

        if (! $user) {
            throw ValidationException::withMessages(['token' => 'Token tidak valid atau sudah kedaluwarsa.']);
        }

        $user->forceFill([
            'password'                  => Hash::make($data['password']),
            'password_reset_token'      => null,
            'password_reset_expires_at' => null,
        ])->save();

        // Hapus semua token Sanctum agar login ulang paksa.
        $user->tokens()->delete();

        return response()->json(['ok' => true, 'message' => 'Password berhasil direset. Silakan masuk kembali.']);
    }
}
