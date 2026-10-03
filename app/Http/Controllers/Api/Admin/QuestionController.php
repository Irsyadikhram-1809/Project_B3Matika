<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\QuestionRequest;
use App\Models\Question;
use Illuminate\Http\JsonResponse;

class QuestionController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['rows' => Question::latest('id')->get()]);
    }

    public function show(Question $question): JsonResponse
    {
        return response()->json(['row' => $question]);
    }

    public function store(QuestionRequest $request): JsonResponse
    {
        return response()->json(['id' => Question::create($request->validated())->id]);
    }

    public function update(QuestionRequest $request, Question $question): JsonResponse
    {
        $question->update($request->validated());

        return response()->json(['ok' => true]);
    }

    public function destroy(Question $question): JsonResponse
    {
        $question->delete();

        return response()->json(['ok' => true]);
    }
}
