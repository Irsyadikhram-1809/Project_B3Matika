<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Topic extends Model
{
    use HasFactory;

    protected $fillable = ['grade', 'title', 'content'];

    protected function casts(): array
    {
        return ['grade' => 'integer'];
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }
}
