<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlayerAchievement extends Model
{
    protected $fillable = [
        'player_id',
        'achievement_key',
        'category',
        'tier',
        'metadata',
        'unlocked_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'unlocked_at' => 'datetime',
    ];

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class);
    }
}
