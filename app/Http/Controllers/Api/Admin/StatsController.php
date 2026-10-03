<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attempt;
use App\Models\Puzzle;
use App\Models\Question;
use App\Models\Topic;
use App\Models\User;
use App\Services\DifficultyEvaluator;
use Illuminate\Http\JsonResponse;

class StatsController extends Controller
{
    public function __invoke(DifficultyEvaluator $evaluator): JsonResponse
    {
        return response()->json([
            'stats' => [
                'Pengguna' => User::players()->count(),
                'Materi' => Topic::count(),
                'Soal' => Question::count(),
                'Puzzle' => Puzzle::count(),
                'Jawaban' => Attempt::count(),
                'Total poin' => (int) User::sum('points'),
            ],
            'evaluation' => $evaluator->evaluate(),
        ]);
    }
}
