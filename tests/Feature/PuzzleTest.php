<?php

namespace Tests\Feature;

use App\Models\Puzzle;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PuzzleTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_puzzle_never_leaks_solution(): void
    {
        $riddle = Puzzle::factory()->create();

        $this->getJson('/api/puzzles')->assertOk()->assertJsonMissingPath('puzzles.0.solution');
        $this->getJson("/api/puzzles/{$riddle->id}")->assertOk()->assertJsonMissingPath('puzzle.solution');
    }

    public function test_cryptarithm_show_includes_letters(): void
    {
        $puzzle = Puzzle::factory()->cryptarithm()->create();

        $this->getJson("/api/puzzles/{$puzzle->id}")
            ->assertOk()
            ->assertJsonPath('puzzle.letters', ['T', 'O', 'G', 'U']);
    }

    public function test_riddle_answer_is_case_insensitive_and_awards_points_once(): void
    {
        $user = User::factory()->create();
        $puzzle = Puzzle::factory()->create(['solution' => ['answer' => 'Sembilan'], 'points' => 30]);

        $this->actingAs($user, 'sanctum')->postJson("/api/puzzles/{$puzzle->id}/check", ['answer' => '  sembilan '])
            ->assertOk()->assertJsonPath('correct', true)->assertJsonPath('awarded', 30)->assertJsonPath('user.points', 30);

        $this->actingAs($user, 'sanctum')->postJson("/api/puzzles/{$puzzle->id}/check", ['answer' => 'SEMBILAN'])
            ->assertOk()->assertJsonPath('awarded', 0)->assertJsonPath('user.points', 30);

        $this->actingAs($user, 'sanctum')->postJson("/api/puzzles/{$puzzle->id}/check", ['answer' => 'sepuluh'])
            ->assertOk()->assertJsonPath('correct', false);
    }

    public function test_cryptarithm_check(): void
    {
        $user = User::factory()->create();
        $puzzle = Puzzle::factory()->cryptarithm('SEND + MORE = MONEY')->create();
        $map = ['S' => 9, 'E' => 5, 'N' => 6, 'D' => 7, 'M' => 1, 'O' => 0, 'R' => 8, 'Y' => 2];

        $this->actingAs($user, 'sanctum')->postJson("/api/puzzles/{$puzzle->id}/check", ['map' => $map])
            ->assertOk()->assertJsonPath('correct', true)->assertJsonPath('awarded', 50);

        $this->actingAs($user, 'sanctum')->postJson("/api/puzzles/{$puzzle->id}/check", ['map' => [...$map, 'Y' => 3]])
            ->assertOk()->assertJsonPath('correct', false);
    }

    public function test_solved_list_is_returned_for_logged_in_user(): void
    {
        $user = User::factory()->create();
        $puzzle = Puzzle::factory()->create(['solution' => ['answer' => '9']]);
        $this->actingAs($user, 'sanctum')->postJson("/api/puzzles/{$puzzle->id}/check", ['answer' => '9']);

        $this->actingAs($user, 'sanctum')->getJson('/api/puzzles')->assertJsonPath('solved', [$puzzle->id]);
        $this->getJson('/api/puzzles')->assertJsonPath('solved', []);
    }
}
