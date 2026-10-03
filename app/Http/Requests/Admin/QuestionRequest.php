<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class QuestionRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'topic_id' => ['required', 'integer', 'exists:topics,id'],
            'text' => ['required', 'string'],
            'options' => ['required', 'array', 'min:2'],
            'options.*' => ['required', 'string'],
            'answer' => [
                'required', 'integer', 'min:0',
                function (string $attribute, mixed $value, \Closure $fail) {
                    if ((int) $value >= count((array) $this->input('options'))) {
                        $fail('Indeks jawaban di luar jumlah pilihan.');
                    }
                },
            ],
            'difficulty' => ['required', 'integer', 'between:1,5'],
            'explanation' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'topic_id.*' => 'Materi tidak ditemukan.',
            'text.required' => 'Teks soal wajib diisi.',
            'options.required' => 'Minimal 2 pilihan.',
            'options.array' => 'Minimal 2 pilihan.',
            'options.min' => 'Minimal 2 pilihan.',
            'options.*.*' => 'Setiap pilihan harus berupa teks.',
            'answer.*' => 'Indeks jawaban di luar jumlah pilihan.',
            'difficulty.*' => 'Kesulitan harus 1–5.',
        ];
    }
}
