<?php

namespace Database\Factories;

use App\Models\Topic;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Topic> */
class TopicFactory extends Factory
{
    protected $model = Topic::class;

    public function definition(): array
    {
        return [
            'grade' => fake()->numberBetween(1, 12),
            'title' => fake()->sentence(3),
            'content' => fake()->paragraph(),
        ];
    }
}
