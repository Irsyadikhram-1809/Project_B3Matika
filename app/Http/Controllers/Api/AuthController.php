<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create($request->validated());

        return $this->tokenResponse($user);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        return $this->attempt($request, admin: false);
    }

    /** Login khusus admin (URL tersembunyi /panel-rahasia/login). */
    public function adminLogin(LoginRequest $request): JsonResponse
    {
        return $this->attempt($request, admin: true);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => new UserResource($request->user())]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['ok' => true]);
    }

    private function attempt(LoginRequest $request, bool $admin): JsonResponse
    {
        $user = User::where('email', $request->input('email'))->first();

        if (! $user || ! Hash::check($request->input('password'), $user->password) || $user->isAdmin() !== $admin) {
            throw ValidationException::withMessages(['email' => 'Email atau password salah.']);
        }
        abort_unless($user->is_active, 403, 'Akun dinonaktifkan oleh admin.');

        return $this->tokenResponse($user);
    }

    private function tokenResponse(User $user): JsonResponse
    {
        return response()->json([
            'token' => $user->createToken('web')->plainTextToken,
            'user' => new UserResource($user),
        ]);
    }
}
