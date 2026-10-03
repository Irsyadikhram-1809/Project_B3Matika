<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory;

    public const ROLE_ADMIN = 'admin';

    public const ROLE_USER = 'user';

    /** role, points, dan is_active sengaja tidak mass-assignable. */
    protected $fillable = ['name', 'email', 'password', 'avatar'];

    protected $hidden = ['password'];

    protected function casts(): array
    {
        return [
            'password'                  => 'hashed',
            'points'                    => 'integer',
            'is_active'                 => 'boolean',
            'password_reset_expires_at' => 'datetime',
        ];
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(Attempt::class);
    }

    public function puzzleSolves(): HasMany
    {
        return $this->hasMany(PuzzleSolve::class);
    }

    public function gameScores(): HasMany
    {
        return $this->hasMany(\App\Models\GameScore::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    /** Tiap 100 poin naik 1 level. */
    public function getLevelAttribute(): int
    {
        return intdiv($this->points, 100) + 1;
    }

    public function addPoints(int $amount): void
    {
        if ($amount > 0) {
            $this->increment('points', $amount);
        }
    }

    public function scopePlayers($query)
    {
        return $query->where('role', self::ROLE_USER);
    }
}
