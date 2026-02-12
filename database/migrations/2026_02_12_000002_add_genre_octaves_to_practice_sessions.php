<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('practice_sessions', function (Blueprint $table) {
            $table->string('genre_id', 30)->nullable()->after('practice_date');
            $table->tinyInteger('octaves')->default(1)->after('genre_id');

            $table->index(['player_id', 'scale_id', 'completed']);
            $table->index(['player_id', 'genre_id', 'scale_id', 'completed']);
        });
    }

    public function down(): void
    {
        Schema::table('practice_sessions', function (Blueprint $table) {
            $table->dropIndex(['player_id', 'scale_id', 'completed']);
            $table->dropIndex(['player_id', 'genre_id', 'scale_id', 'completed']);
            $table->dropColumn(['genre_id', 'octaves']);
        });
    }
};
