<?php

namespace App\Services;

use App\Models\Question;
use Illuminate\Support\Collection;

/** Evaluasi tingkat kesulitan soal berdasarkan persentase jawaban benar. */
class DifficultyEvaluator
{
    public const MIN_ATTEMPTS = 3;

    /** @return Collection<int, array{id:int,text:string,total:int,ok:int,rate:int,verdict:string}> */
    public function evaluate(): Collection
    {
        return Question::query()
            ->join('attempts', 'attempts.question_id', '=', 'questions.id')
            ->groupBy('questions.id', 'questions.text')
            ->havingRaw('COUNT(attempts.id) >= ?', [self::MIN_ATTEMPTS])
            ->selectRaw('questions.id, questions.text, COUNT(attempts.id) AS total, SUM(CASE WHEN attempts.correct THEN 1 ELSE 0 END) AS ok')
            ->get()
            ->map(function ($row) {
                $rate = (int) round(100 * $row->ok / $row->total);

                return [
                    'id' => $row->id,
                    'text' => $row->text,
                    'total' => (int) $row->total,
                    'ok' => (int) $row->ok,
                    'rate' => $rate,
                    'verdict' => $this->verdict($rate),
                ];
            })
            ->sortBy('rate')
            ->values();
    }

    private function verdict(int $rate): string
    {
        return match (true) {
            $rate < 30 => 'Terlalu sulit',
            $rate > 90 => 'Terlalu mudah',
            default => 'Seimbang',
        };
    }
}
