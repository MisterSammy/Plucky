<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlayerSetting extends Model
{
    protected $fillable = ['player_id', 'completion_threshold', 'preferred_instrument', 'theme', 'preferences'];

    protected $casts = [
        'preferences' => 'array',
    ];

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class);
    }
}
