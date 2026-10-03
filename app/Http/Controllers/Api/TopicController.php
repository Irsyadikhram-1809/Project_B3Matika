<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Topic;
use Illuminate\Http\JsonResponse;

class TopicController extends Controller
{
    /** Materi + daftar soal (tanpa kunci jawaban dan penjelasan). */
    public function show(Topic $topic): JsonResponse
    {
        $questions = $topic->questions()
            ->orderBy('id')
            ->get(['id', 'topic_id', 'text', 'options', 'difficulty'])
            ->makeHidden('topic_id');

        return response()->json(['topic' => $topic, 'questions' => $questions]);
    }
}
