<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::latest('id')->get(['id', 'name', 'email', 'role', 'points', 'is_active', 'created_at']);

        return response()->json(['users' => $users]);
    }

    public function toggle(User $user): JsonResponse
    {
        abort_if($user->isAdmin(), 400, 'Admin tidak dapat dinonaktifkan.');

        $user->forceFill(['is_active' => ! $user->is_active])->save();
        if (! $user->is_active) {
            $user->tokens()->delete(); // paksa keluar dari semua perangkat
        }

        return response()->json(['ok' => true]);
    }

    public function destroy(User $user): JsonResponse
    {
        abort_if($user->isAdmin(), 400, 'Admin tidak dapat dihapus.');

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['ok' => true]);
    }
}
