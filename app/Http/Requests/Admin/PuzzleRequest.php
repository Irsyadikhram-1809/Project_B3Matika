<?php

namespace App\Http\Requests\Admin;

use App\Models\Puzzle;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PuzzleRequest extends FormRequest
{
    public function rules(): array
    {
        $isCrypt = fn () => $this->input('type') === Puzzle::TYPE_CRYPTARITHM;
        $isRiddle = fn () => $this->input('type') === Puzzle::TYPE_RIDDLE;

        return [
            'type' => ['required', Rule::in([Puzzle::TYPE_CRYPTARITHM, Puzzle::TYPE_RIDDLE])],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'data' => ['required', 'array'],
            'solution' => ['required', 'array'],
            'points' => ['required', 'integer', 'min:0', 'max:1000'],

            'data.equation' => [Rule::requiredIf($isCrypt), 'string', 'regex:/^[A-Z]+(\s*\+\s*[A-Z]+)*\s*=\s*[A-Z]+$/'],
            'data.question' => [Rule::requiredIf($isRiddle), 'string'],
            'solution.answer' => [Rule::requiredIf($isRiddle), 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'type.*' => 'Tipe harus "cryptarithm" atau "teka-teki".',
            'title.required' => 'Judul dan tipe wajib diisi.',
            'data.*' => 'JSON tidak valid.',
            'solution.*' => 'JSON tidak valid.',
            'data.equation.*' => 'Persamaan cryptarithm tidak valid, contoh: "AB + C = DE".',
            'data.question.*' => 'Pertanyaan teka-teki wajib diisi.',
            'solution.answer.*' => 'Jawaban teka-teki wajib diisi.',
        ];
    }
}
