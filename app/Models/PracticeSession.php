<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PracticeSession extends Model
{
    protected $fillable = [
        'player_id',
        'scale_id',
        'root_note',
        'tuning_id',
        'instrument',
        'completed',
        'duration_ms',
        'total_notes',
        'notes_hit',
        'accuracy',
        'practice_date',
    ];

    protected $casts = [
        'completed' => 'boolean',
        'accuracy' => 'decimal:2',
        'practice_date' => 'date',
    ];

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class);
    }
}
