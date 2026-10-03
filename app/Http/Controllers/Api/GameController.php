<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\GameScore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GameController extends Controller
{
    /**
     * Kirim skor game dari client.
     * Server memvalidasi batas skor & poin berdasarkan game_type
     * sehingga manipulasi manual dari browser tidak bisa melampaui batas.
     */
    public function score(Request $request): JsonResponse
    {
        $limits = GameScore::limits();
        $types  = array_keys($limits);

        $data = $request->validate([
            'game_type' => ['required', Rule::in($types)],
            'score'     => ['required', 'integer', 'min:0'],
        ], [
            'game_type.in' => 'Jenis game tidak valid.',
            'score.min'    => 'Skor tidak boleh negatif.',
        ]);

        $limit     = $limits[$data['game_type']];
        $score     = min((int) $data['score'], $limit['max_score']);
        $maxPts    = $limit['max_points'];

        // Hitung poin proporsional: (skor / max_skor) * max_poin, dibulatkan ke bawah.
        $points = (int) min(
            floor(($score / max($limit['max_score'], 1)) * $maxPts),
            $maxPts
        );

        $user = $request->user();

        // Simpan rekam skor (boleh berkali-kali, untuk riwayat).
        GameScore::create([
            'user_id'       => $user->id,
            'game_type'     => $data['game_type'],
            'score'         => $score,
            'points_awarded' => $points,
        ]);

        $user->addPoints($points);

        return response()->json([
            'points' => $points,
            'score'  => $score,
            'user'   => new UserResource($user->refresh()),
        ]);
    }

    /** Highscore user untuk semua game. */
    public function myScores(Request $request): JsonResponse
    {
        $scores = GameScore::where('user_id', $request->user()->id)
            ->selectRaw('game_type, MAX(score) as best_score, COUNT(*) as plays, MAX(created_at) as last_played')
            ->groupBy('game_type')
            ->get()
            ->keyBy('game_type');

        return response()->json(['scores' => $scores]);
    }
}
