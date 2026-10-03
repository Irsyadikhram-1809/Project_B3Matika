<?php

namespace Database\Seeders;

use App\Models\Puzzle;
use Illuminate\Database\Seeder;

class PuzzleSeeder extends Seeder
{
    public function run(): void
    {
        $description = 'Setiap huruf mewakili satu angka berbeda (0-9). Angka pertama tidak boleh 0.';

        $cryptarithms = [
            ['Cryptarithm Pemula', 'TO + GO = OUT', 'O pasti bernilai 1.'],
            ['Cryptarithm Klasik', 'SEND + MORE = MONEY', 'M pasti bernilai 1.'],
            ['Cryptarithm Apel', 'EAT + THAT = APPLE', 'A pasti bernilai 1.'],
        ];
        foreach ($cryptarithms as [$title, $equation, $hint]) {
            Puzzle::create([
                'type' => Puzzle::TYPE_CRYPTARITHM,
                'title' => $title,
                'description' => $description,
                'data' => ['equation' => $equation, 'hint' => $hint],
                'solution' => ['note' => 'Divalidasi otomatis'],
                'points' => 50,
            ]);
        }

        $riddles = [
            ['Pola Bilangan', 'Lanjutkan pola.', '2, 6, 12, 20, ... bilangan berikutnya?', '30'],
            ['Bilangan Misterius', 'Cari bilangannya.', 'Sebuah bilangan dikali 3 lalu ditambah 4 hasilnya 31. Berapa bilangannya?', '9'],
        ];
        foreach ($riddles as [$title, $desc, $question, $answer]) {
            Puzzle::create([
                'type' => Puzzle::TYPE_RIDDLE,
                'title' => $title,
                'description' => $desc,
                'data' => ['question' => $question],
                'solution' => ['answer' => $answer],
                'points' => 30,
            ]);
        }
    }
}
