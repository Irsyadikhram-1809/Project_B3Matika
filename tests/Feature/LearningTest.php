<?php

namespace Tests\Feature;

use App\Models\Question;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LearningTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_and_grade_endpoints(): void
    {
        $topic = Topic::factory()->create(['grade' => 3]);
        Question::factory()->count(2)->create(['topic_id' => $topic->id]);

        $this->getJson('/api/home')->assertOk()->assertJsonPath('counts.3', 1);
        $this->getJson('/api/grades/3')->assertOk()->assertJsonPath('topics.0.questions_count', 2);
        $this->getJson('/api/grades/13')->assertStatus(404);
    }

    public function test_topic_hides_answer_and_explanation(): void
    {
        $topic = Topic::factory()->create();
        Question::factory()->create(['topic_id' => $topic->id]);

        $this->getJson("/api/topics/{$topic->id}")
            ->assertOk()
            ->assertJsonMissingPath('questions.0.answer')
            ->assertJsonMissingPath('questions.0.explanation')
            ->assertJsonPath('questions.0.options.1', '5');
    }

    public function test_answering_requires_login(): void
    {
        $question = Question::factory()->create();

        $this->postJson("/api/questions/{$question->id}/answer", ['choice' => 1])->assertStatus(401);
    }

    public function test_points_are_awarded_only_on_first_attempt(): void
    {
        $user = User::factory()->create();
        $question = Question::factory()->create(['difficulty' => 2]);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/questions/{$question->id}/answer", ['choice' => 1])
            ->assertOk()
            ->assertJsonPath('correct', true)
            ->assertJsonPath('points', 20)
            ->assertJsonPath('counted', true)
            ->assertJsonPath('user.points', 20);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/questions/{$question->id}/answer", ['choice' => 1])
            ->assertOk()
            ->assertJsonPath('points', 0)
            ->assertJsonPath('counted', false)
            ->assertJsonPath('user.points', 20);
    }

    public function test_wrong_answer_gives_no_points_but_reveals_answer(): void
    {
        $user = User::factory()->create();
        $question = Question::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/questions/{$question->id}/answer", ['choice' => 0])
            ->assertOk()
            ->assertJsonPath('correct', false)
            ->assertJsonPath('answer', 1)
            ->assertJsonPath('user.points', 0);
    }

    public function test_game_score_converts_to_capped_points(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')->postJson('/api/games/score', ['score' => 11])->assertOk()->assertJsonPath('points', 5);
        $this->actingAs($user, 'sanctum')->postJson('/api/games/score', ['score' => 200])->assertOk()->assertJsonPath('points', 40);
        $this->actingAs($user, 'sanctum')->postJson('/api/games/score', ['score' => 301])->assertStatus(422)->assertJsonPath('error', 'Skor tidak valid.');
    }

    public function test_leaderboard_lists_only_active_players_sorted_by_points(): void
    {
        User::factory()->create(['name' => 'Rendah', 'points' => 10]);
        User::factory()->create(['name' => 'Tinggi', 'points' => 250]);
        User::factory()->blocked()->create(['name' => 'Diblokir', 'points' => 999]);
        User::factory()->admin()->create(['name' => 'Admin', 'points' => 999]);

        $this->getJson('/api/leaderboard')
            ->assertOk()
            ->assertJsonCount(2, 'users')
            ->assertJsonPath('users.0.name', 'Tinggi')
            ->assertJsonPath('users.0.level', 3);
    }
}
