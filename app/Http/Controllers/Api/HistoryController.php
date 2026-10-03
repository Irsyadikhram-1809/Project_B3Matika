<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attempt;
use App\Models\GameScore;
use App\Models\Topic;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HistoryController extends Controller
{
    /**
     * GET /api/me/history
     * Riwayat belajar: per topik — jumlah soal benar/salah & tanggal terakhir.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Ambil semua attempt milik user beserta topiknya.
        $attempts = Attempt::with('question.topic')
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        // Kelompokkan per topik.
        $byTopic = [];
        foreach ($attempts as $att) {
            $topic = $att->question?->topic;
            if (! $topic) continue;
            $tid = $topic->id;
            if (! isset($byTopic[$tid])) {
                $byTopic[$tid] = [
                    'topic_id'    => $tid,
                    'topic_title' => $topic->title,
                    'grade'       => $topic->grade,
                    'correct'     => 0,
                    'wrong'       => 0,
                    'last_at'     => null,
                ];
            }
            $byTopic[$tid][$att->correct ? 'correct' : 'wrong']++;
            if (! $byTopic[$tid]['last_at'] || $att->created_at > $byTopic[$tid]['last_at']) {
                $byTopic[$tid]['last_at'] = $att->created_at;
            }
        }

        // Urutkan: kelas naik, lalu judul.
        usort($byTopic, fn($a, $b) => $a['grade'] <=> $b['grade'] ?: strcmp($a['topic_title'], $b['topic_title']));

        // Riwayat game scores.
        $gameHistory = GameScore::where('user_id', $user->id)
            ->selectRaw('game_type, MAX(score) as best_score, SUM(points_awarded) as total_points, COUNT(*) as plays, MAX(created_at) as last_played')
            ->groupBy('game_type')
            ->get();

        return response()->json([
            'topics' => array_values($byTopic),
            'games'  => $gameHistory,
        ]);
    }
}
