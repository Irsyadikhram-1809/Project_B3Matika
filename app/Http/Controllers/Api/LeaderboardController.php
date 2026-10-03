<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class LeaderboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $users = User::players()
            ->where('is_active', true)
            ->orderByDesc('points')
            ->orderBy('id')
            ->limit(20)
            ->get(['id', 'name', 'points'])
            ->map(fn (User $u) => ['id' => $u->id, 'name' => $u->name, 'points' => $u->points, 'level' => $u->level]);

        return response()->json(['users' => $users]);
    }
}
