<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('player_achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('player_id')->constrained()->cascadeOnDelete();
            $table->string('achievement_key', 100);
            $table->string('category', 30);
            $table->string('tier', 20)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('unlocked_at');
            $table->timestamps();

            $table->unique(['player_id', 'achievement_key']);
            $table->index(['player_id', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('player_achievements');
    }
};
