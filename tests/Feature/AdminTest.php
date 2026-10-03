<?php

namespace Tests\Feature;

use App\Models\Attempt;
use App\Models\Question;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_gets_401_and_regular_user_gets_404(): void
    {
        $this->getJson('/api/admin/stats')->assertStatus(401);

        $this->actingAs(User::factory()->create(), 'sanctum')
            ->getJson('/api/admin/stats')->assertStatus(404);
    }

    public function test_topic_crud(): void
    {
        $admin = User::factory()->admin()->create();
        $this->actingAs($admin, 'sanctum');

        $id = $this->postJson('/api/admin/topics', ['grade' => 5, 'title' => 'Pecahan', 'content' => 'Isi'])
            ->assertOk()->json('id');
        $this->getJson("/api/admin/topics/$id")->assertOk()->assertJsonPath('row.title', 'Pecahan');
        $this->putJson("/api/admin/topics/$id", ['grade' => 6, 'title' => 'Baru', 'content' => 'Isi'])->assertOk();
        $this->getJson('/api/admin/topics')->assertOk()->assertJsonPath('rows.0.grade', 6);
        $this->postJson('/api/admin/topics', ['grade' => 13, 'title' => 'x', 'content' => 'y'])
            ->assertStatus(422)->assertJsonPath('error', 'Kelas harus 1–12.');
        $this->deleteJson("/api/admin/topics/$id")->assertOk();
        $this->getJson("/api/admin/topics/$id")->assertStatus(404);
    }

    public function test_question_validation(): void
    {
        $this->actingAs(User::factory()->admin()->create(), 'sanctum');
        $topic = Topic::factory()->create();
        $payload = ['topic_id' => $topic->id, 'text' => '1+1', 'options' => ['1', '2'], 'answer' => 1, 'difficulty' => 1];

        $this->postJson('/api/admin/questions', $payload)->assertOk();
        $this->postJson('/api/admin/questions', [...$payload, 'answer' => 2])
            ->assertStatus(422)->assertJsonPath('error', 'Indeks jawaban di luar jumlah pilihan.');
        $this->postJson('/api/admin/questions', [...$payload, 'options' => ['1']])
            ->assertStatus(422)->assertJsonPath('error', 'Minimal 2 pilihan.');
        $this->postJson('/api/admin/questions', [...$payload, 'difficulty' => 6])
            ->assertStatus(422)->assertJsonPath('error', 'Kesulitan harus 1–5.');
        $this->postJson('/api/admin/questions', [...$payload, 'topic_id' => 999])
            ->assertStatus(422)->assertJsonPath('error', 'Materi tidak ditemukan.');
    }

    public function test_deleting_topic_cascades_to_questions(): void
    {
        $this->actingAs(User::factory()->admin()->create(), 'sanctum');
        $question = Question::factory()->create();

        $this->deleteJson("/api/admin/topics/{$question->topic_id}")->assertOk();
        $this->assertDatabaseMissing('questions', ['id' => $question->id]);
    }

    public function test_user_toggle_and_delete_but_not_admin(): void
    {
        $admin = User::factory()->admin()->create();
        $student = User::factory()->create();
        $this->actingAs($admin, 'sanctum');

        $this->postJson("/api/admin/users/{$student->id}/toggle")->assertOk();
        $this->assertFalse($student->fresh()->is_active);
        $this->postJson("/api/admin/users/{$admin->id}/toggle")->assertStatus(400);
        $this->deleteJson("/api/admin/users/{$admin->id}")->assertStatus(400);
        $this->deleteJson("/api/admin/users/{$student->id}")->assertOk();
        $this->assertDatabaseMissing('users', ['id' => $student->id]);
    }

    public function test_stats_include_difficulty_evaluation(): void
    {
        $this->actingAs(User::factory()->admin()->create(), 'sanctum');
        $question = Question::factory()->create();
        foreach ([true, false, false, false] as $correct) {
            Attempt::create(['user_id' => User::factory()->create()->id, 'question_id' => $question->id, 'correct' => $correct]);
        }

        $this->getJson('/api/admin/stats')
            ->assertOk()
            ->assertJsonPath('stats.Jawaban', 4)
            ->assertJsonPath('evaluation.0.rate', 25)
            ->assertJsonPath('evaluation.0.verdict', 'Terlalu sulit');
    }
}
