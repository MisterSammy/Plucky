<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TrackScale extends Model
{
    protected $fillable = ['learning_track_id', 'scale_id', 'suggested_root', 'sort_order', 'tip'];

    public function track(): BelongsTo
    {
        return $this->belongsTo(LearningTrack::class, 'learning_track_id');
    }

    public function playerProgress(): HasMany
    {
        return $this->hasMany(PlayerTrackProgress::class);
    }
}
