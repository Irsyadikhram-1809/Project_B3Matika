<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Topic;
use Illuminate\Http\JsonResponse;

class GradeController extends Controller
{
    public function show(int $grade): JsonResponse
    {
        abort_unless($grade >= 1 && $grade <= 12, 404, 'Kelas tidak ditemukan.');

        $topics = Topic::where('grade', $grade)->withCount('questions')->orderBy('id')->get();

        return response()->json(['grade' => $grade, 'topics' => $topics]);
    }
}
