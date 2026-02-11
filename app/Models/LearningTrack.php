<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LearningTrack extends Model
{
    protected $fillable = ['slug', 'name', 'description', 'difficulty', 'color', 'sort_order'];

    public function scales(): HasMany
    {
        return $this->hasMany(TrackScale::class)->orderBy('sort_order');
    }
}
