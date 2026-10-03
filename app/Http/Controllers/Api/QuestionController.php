<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Attempt;
use App\Models\Question;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function answer(Request $request, Question $question): JsonResponse
    {
        $request->validate(['choice' => ['required', 'integer']]);

        $user = $request->user();
        $correct = (int) $request->input('choice') === $question->answer;

        // Hanya percobaan pertama yang dihitung (unique user_id + question_id).
        $attempt = Attempt::createOrFirst(
            ['user_id' => $user->id, 'question_id' => $question->id],
            ['correct' => $correct],
        );
        $counted = $attempt->wasRecentlyCreated;

        $points = 0;
        if ($counted && $correct) {
            $points = $question->rewardPoints();
            $user->addPoints($points);
        }

        return response()->json([
            'correct' => $correct,
            'answer' => $question->answer,
            'explanation' => $question->explanation,
            'points' => $points,
            'counted' => $counted,
            'user' => new UserResource($user->refresh()),
        ]);
    }
}
