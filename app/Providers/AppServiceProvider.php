<?php

namespace App\Providers;

use App\Models\LearningTrack;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Auto-seed learning tracks if table exists but is empty
        if (Schema::hasTable('learning_tracks') && LearningTrack::count() === 0) {
            $seeder = new \Database\Seeders\LearningTrackSeeder;
            $seeder->run();
        }
    }
}
