<?php

namespace Database\Factories;

use App\Models\Puzzle;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Puzzle> */
class PuzzleFactory extends Factory
{
    protected $model = Puzzle::class;

    public function definition(): array
    {
        return [
            'type' => Puzzle::TYPE_RIDDLE,
            'title' => fake()->sentence(3),
            'description' => 'Cari bilangannya.',
            'data' => ['question' => 'Bilangan dikali 3 lalu ditambah 4 hasilnya 31. Berapa bilangannya?'],
            'solution' => ['answer' => '9'],
            'points' => 30,
        ];
    }

    public function cryptarithm(string $equation = 'TO + GO = OUT'): static
    {
        return $this->state([
            'type' => Puzzle::TYPE_CRYPTARITHM,
            'data' => ['equation' => $equation, 'hint' => 'Huruf pertama hasil pasti 1.'],
            'solution' => ['note' => 'Divalidasi otomatis'],
            'points' => 50,
        ]);
    }
}
