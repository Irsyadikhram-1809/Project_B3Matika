<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PuzzleRequest;
use App\Models\Puzzle;
use Illuminate\Http\JsonResponse;

class PuzzleController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['rows' => Puzzle::latest('id')->get()]);
    }

    public function show(Puzzle $puzzle): JsonResponse
    {
        return response()->json(['row' => $puzzle]);
    }

    public function store(PuzzleRequest $request): JsonResponse
    {
        return response()->json(['id' => Puzzle::create($request->validated())->id]);
    }

    public function update(PuzzleRequest $request, Puzzle $puzzle): JsonResponse
    {
        $puzzle->update($request->validated());

        return response()->json(['ok' => true]);
    }

    public function destroy(Puzzle $puzzle): JsonResponse
    {
        $puzzle->delete();

        return response()->json(['ok' => true]);
    }
}
