<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Player extends Model
{
    protected $fillable = ['name', 'color', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function settings(): HasOne
    {
        return $this->hasOne(PlayerSetting::class);
    }

    public function practiceSessions(): HasMany
    {
        return $this->hasMany(PracticeSession::class);
    }

    public function trackProgress(): HasMany
    {
        return $this->hasMany(PlayerTrackProgress::class);
    }

    public function achievements(): HasMany
    {
        return $this->hasMany(PlayerAchievement::class);
    }
}
