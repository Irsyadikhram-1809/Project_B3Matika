<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_returns_token_and_user(): void
    {
        $this->postJson('/api/auth/register', ['name' => 'Budi', 'email' => 'Budi@Test.com', 'password' => 'rahasia'])
            ->assertOk()
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role', 'points', 'level']])
            ->assertJsonPath('user.email', 'budi@test.com')
            ->assertJsonPath('user.role', 'user')
            ->assertJsonPath('user.level', 1);
    }

    public function test_register_validation_errors_use_error_field(): void
    {
        User::factory()->create(['email' => 'a@test.com']);

        $this->postJson('/api/auth/register', ['name' => 'A', 'email' => 'a@test.com', 'password' => 'rahasia'])
            ->assertStatus(422)->assertJsonPath('error', 'Email sudah terdaftar.');
        $this->postJson('/api/auth/register', ['name' => 'A', 'email' => 'b@test.com', 'password' => '123'])
            ->assertStatus(422)->assertJsonPath('error', 'Password minimal 6 karakter.');
    }

    public function test_login_and_me(): void
    {
        $user = User::factory()->create(['email' => 'siswa@test.com', 'password' => 'rahasia']);

        $token = $this->postJson('/api/auth/login', ['email' => 'siswa@test.com', 'password' => 'rahasia'])
            ->assertOk()->json('token');

        $this->withToken($token)->getJson('/api/me')->assertOk()->assertJsonPath('user.id', $user->id);
        $this->getJson('/api/me')->assertStatus(401)->assertJsonPath('error', 'Silakan masuk.');
    }

    public function test_wrong_password_and_wrong_portal_are_rejected(): void
    {
        User::factory()->create(['email' => 'siswa@test.com', 'password' => 'rahasia']);
        User::factory()->admin()->create(['email' => 'admin@test.com', 'password' => 'rahasia']);

        $this->postJson('/api/auth/login', ['email' => 'siswa@test.com', 'password' => 'salah'])->assertStatus(422);
        $this->postJson('/api/auth/login', ['email' => 'admin@test.com', 'password' => 'rahasia'])->assertStatus(422);
        $this->postJson('/api/auth/admin-login', ['email' => 'siswa@test.com', 'password' => 'rahasia'])->assertStatus(422);
        $this->postJson('/api/auth/admin-login', ['email' => 'admin@test.com', 'password' => 'rahasia'])->assertOk();
    }

    public function test_blocked_user_cannot_login_or_use_existing_token(): void
    {
        $user = User::factory()->create(['email' => 'x@test.com', 'password' => 'rahasia']);
        $token = $user->createToken('web')->plainTextToken;
        $user->forceFill(['is_active' => false])->save();

        $this->postJson('/api/auth/login', ['email' => 'x@test.com', 'password' => 'rahasia'])->assertStatus(403);
        $this->withToken($token)->getJson('/api/me')->assertStatus(401);
    }
}
