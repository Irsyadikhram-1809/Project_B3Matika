<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('game_type', 40);   // kilat, 2048, threes, riddle, crypt_basic, sudoku, kenken, calculords, crypt_adv
            $table->unsignedInteger('score');
            $table->unsignedInteger('points_awarded')->default(0);
            $table->timestamps();

            $table->index(['user_id', 'game_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_scores');
    }
};
