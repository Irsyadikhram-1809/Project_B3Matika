<?php

namespace Database\Factories;

use App\Models\Question;
use App\Models\Topic;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Question> */
class QuestionFactory extends Factory
{
    protected $model = Question::class;

    public function definition(): array
    {
        return [
            'topic_id' => Topic::factory(),
            'text' => '2 + 3 = ?',
            'options' => ['4', '5', '6', '7'],
            'answer' => 1,
            'difficulty' => 1,
            'explanation' => '2 ditambah 3 sama dengan 5',
        ];
    }
}
