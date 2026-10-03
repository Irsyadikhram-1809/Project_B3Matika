<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GameScore extends Model
{
    protected $fillable = ['user_id', 'game_type', 'score', 'points_awarded'];

    protected function casts(): array
    {
        return ['score' => 'integer', 'points_awarded' => 'integer'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Batas skor & poin maksimal per jenis game (server-side validation). */
    public static function limits(): array
    {
        return [
            'kilat'       => ['max_score' => 300,  'max_points' => 40],
            '2048'        => ['max_score' => 20000, 'max_points' => 60],
            'threes'      => ['max_score' => 10000, 'max_points' => 50],
            'riddle'      => ['max_score' => 100,   'max_points' => 30],
            'crypt_basic' => ['max_score' => 10,    'max_points' => 20],
            'sudoku'      => ['max_score' => 10,    'max_points' => 80],
            'kenken'      => ['max_score' => 10,    'max_points' => 70],
            'calculords'  => ['max_score' => 200,   'max_points' => 50],
            'crypt_adv'   => ['max_score' => 10,    'max_points' => 100],
        ];
    }
}
