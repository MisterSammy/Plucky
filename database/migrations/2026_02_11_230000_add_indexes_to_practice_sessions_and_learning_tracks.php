<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('practice_sessions', function (Blueprint $table) {
            $table->index('practice_date');
            $table->index(['player_id', 'completed']);
        });

        Schema::table('learning_tracks', function (Blueprint $table) {
            $table->index('slug');
        });
    }

    public function down(): void
    {
        Schema::table('practice_sessions', function (Blueprint $table) {
            $table->dropIndex(['practice_date']);
            $table->dropIndex(['player_id', 'completed']);
        });

        Schema::table('learning_tracks', function (Blueprint $table) {
            $table->dropIndex(['slug']);
        });
    }
};
