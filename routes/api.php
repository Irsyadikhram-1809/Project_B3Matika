<?php

use App\Http\Controllers\Api\Admin\PuzzleController as AdminPuzzleController;
use App\Http\Controllers\Api\Admin\QuestionController as AdminQuestionController;
use App\Http\Controllers\Api\Admin\StatsController;
use App\Http\Controllers\Api\Admin\TopicController as AdminTopicController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GameController;
use App\Http\Controllers\Api\GradeController;
use App\Http\Controllers\Api\HistoryController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\LeaderboardController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\PuzzleController;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\TopicController;
use App\Http\Controllers\Api\AiTutorController;
use Illuminate\Support\Facades\Route;

// ---------- Auth ----------
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('admin-login', [AuthController::class, 'adminLogin'])->middleware('throttle:10,1');
    Route::post('logout', [AuthController::class, 'logout'])->middleware(['auth:sanctum', 'active']);
    Route::post('forgot-password', [ProfileController::class, 'forgotPassword'])->middleware('throttle:5,1');
    Route::post('reset-password', [ProfileController::class, 'resetPassword'])->middleware('throttle:5,1');
});

// ---------- Publik ----------
Route::get('home', HomeController::class);
Route::get('grades/{grade}', [GradeController::class, 'show'])->whereNumber('grade');
Route::get('topics/{topic}', [TopicController::class, 'show']);
Route::get('puzzles', [PuzzleController::class, 'index']);
Route::get('puzzles/{puzzle}', [PuzzleController::class, 'show']);
Route::get('leaderboard', LeaderboardController::class);
Route::post('chat', [AiTutorController::class, 'chat']);

// ---------- Perlu login ----------
Route::middleware(['auth:sanctum', 'active'])->group(function () {
    Route::get('me', [AuthController::class, 'me']);

    // Profil & password
    Route::put('me/profile', [ProfileController::class, 'update']);
    Route::put('me/password', [ProfileController::class, 'changePassword']);

    // Riwayat belajar
    Route::get('me/history', [HistoryController::class, 'index']);

    // Soal & games
    Route::post('questions/{question}/answer', [QuestionController::class, 'answer']);
    Route::post('games/score', [GameController::class, 'score']);
    Route::get('games/my-scores', [GameController::class, 'myScores']);

    // Puzzle
    Route::post('puzzles/{puzzle}/check', [PuzzleController::class, 'check']);
});

// ---------- Admin (non-admin mendapat 404) ----------
Route::prefix('admin')->middleware(['auth:sanctum', 'active', 'admin'])->group(function () {
    Route::get('stats', StatsController::class);

    Route::get('users', [AdminUserController::class, 'index']);
    Route::post('users/{user}/toggle', [AdminUserController::class, 'toggle']);
    Route::delete('users/{user}', [AdminUserController::class, 'destroy']);

    Route::apiResource('topics', AdminTopicController::class);
    Route::apiResource('questions', AdminQuestionController::class);
    Route::apiResource('puzzles', AdminPuzzleController::class);
});
