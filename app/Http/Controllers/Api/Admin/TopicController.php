<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TopicRequest;
use App\Models\Topic;
use Illuminate\Http\JsonResponse;

class TopicController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['rows' => Topic::latest('id')->get()]);
    }

    public function show(Topic $topic): JsonResponse
    {
        return response()->json(['row' => $topic]);
    }

    public function store(TopicRequest $request): JsonResponse
    {
        return response()->json(['id' => Topic::create($request->validated())->id]);
    }

    public function update(TopicRequest $request, Topic $topic): JsonResponse
    {
        $topic->update($request->validated());

        return response()->json(['ok' => true]);
    }

    public function destroy(Topic $topic): JsonResponse
    {
        $topic->delete();

        return response()->json(['ok' => true]);
    }
}
