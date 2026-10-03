<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PuzzleResource;
use App\Http\Resources\UserResource;
use App\Models\Puzzle;
use App\Models\PuzzleSolve;
use App\Services\CryptarithmSolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PuzzleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user('sanctum');

        return response()->json([
            'puzzles' => PuzzleResource::collection(Puzzle::orderBy('id')->get()),
            'solved' => $user ? $user->puzzleSolves()->pluck('puzzle_id') : [],
        ]);
    }

    public function show(Puzzle $puzzle): JsonResponse
    {
        return response()->json(['puzzle' => new PuzzleResource($puzzle, withLetters: true)]);
    }

    public function check(Request $request, Puzzle $puzzle, CryptarithmSolver $solver): JsonResponse
    {
        $correct = $puzzle->isCryptarithm()
            ? $solver->check($puzzle->data['equation'] ?? '', (array) $request->input('map', []))
            : $this->normalize($request->input('answer')) === $this->normalize($puzzle->solution['answer'] ?? '');

        if (! $correct) {
            return response()->json(['correct' => false]);
        }

        $user = $request->user();
        $solve = PuzzleSolve::createOrFirst(['user_id' => $user->id, 'puzzle_id' => $puzzle->id]);
        $awarded = $solve->wasRecentlyCreated ? $puzzle->points : 0;
        $user->addPoints($awarded);

        return response()->json([
            'correct' => true,
            'awarded' => $awarded,
            'user' => new UserResource($user->refresh()),
        ]);
    }

    private function normalize(mixed $value): string
    {
        return is_scalar($value) ? mb_strtolower(trim((string) $value)) : '';
    }
}
