<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<User> */
class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password' => 'password',
            'role' => User::ROLE_USER,
            'points' => 0,
            'is_active' => true,
        ];
    }

    public function admin(): static
    {
        return $this->state(['role' => User::ROLE_ADMIN]);
    }

    public function blocked(): static
    {
        return $this->state(['is_active' => false]);
    }
}
