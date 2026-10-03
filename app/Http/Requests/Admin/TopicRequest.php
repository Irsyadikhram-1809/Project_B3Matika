<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class TopicRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'grade' => ['required', 'integer', 'between:1,12'],
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'grade.*' => 'Kelas harus 1–12.',
            'title.required' => 'Judul dan isi wajib diisi.',
            'content.required' => 'Judul dan isi wajib diisi.',
        ];
    }
}
