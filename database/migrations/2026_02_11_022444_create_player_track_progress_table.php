<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('player_track_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('player_id')->constrained()->cascadeOnDelete();
            $table->foreignId('track_scale_id')->constrained()->cascadeOnDelete();
            $table->integer('completed_runs')->default(0);
            $table->integer('best_time_ms')->nullable();
            $table->timestamps();

            $table->unique(['player_id', 'track_scale_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('player_track_progress');
    }
};
