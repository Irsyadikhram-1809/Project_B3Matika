<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Question extends Model
{
    use HasFactory;

    protected $fillable = ['topic_id', 'text', 'options', 'answer', 'difficulty', 'explanation'];

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'answer' => 'integer',
            'difficulty' => 'integer',
        ];
    }

    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(Attempt::class);
    }

    /** Poin dasar: 10 x tingkat kesulitan. */
    public function rewardPoints(): int
    {
        return 10 * $this->difficulty;
    }
}
