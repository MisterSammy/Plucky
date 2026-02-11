<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlayerTrackProgress extends Model
{
    protected $fillable = ['player_id', 'track_scale_id', 'completed_runs', 'best_time_ms'];

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class);
    }

    public function trackScale(): BelongsTo
    {
        return $this->belongsTo(TrackScale::class);
    }
}
