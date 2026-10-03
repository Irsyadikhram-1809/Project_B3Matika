<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Puzzle extends Model
{
    use HasFactory;

    public const TYPE_CRYPTARITHM = 'cryptarithm';

    public const TYPE_RIDDLE = 'teka-teki';

    protected $fillable = ['type', 'title', 'description', 'data', 'solution', 'points'];

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'solution' => 'array',
            'points' => 'integer',
        ];
    }

    public function solves(): HasMany
    {
        return $this->hasMany(PuzzleSolve::class);
    }

    public function isCryptarithm(): bool
    {
        return $this->type === self::TYPE_CRYPTARITHM;
    }
}
