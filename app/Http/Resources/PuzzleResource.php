<?php

namespace App\Http\Resources;

use App\Services\CryptarithmSolver;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Puzzle */
class PuzzleResource extends JsonResource
{
    public function __construct($resource, private readonly bool $withLetters = false)
    {
        parent::__construct($resource);
    }

    /** Kunci jawaban (solution) tidak pernah dikirim ke klien. */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'title' => $this->title,
            'description' => $this->description,
            'points' => $this->points,
            'data' => $this->data,
            $this->mergeWhen(
                $this->withLetters && $this->isCryptarithm(),
                fn () => ['letters' => CryptarithmSolver::letters($this->data['equation'] ?? '')]
            ),
        ];
    }
}
