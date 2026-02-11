<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('practice_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('player_id')->constrained()->cascadeOnDelete();
            $table->string('scale_id', 50);
            $table->string('root_note', 3);
            $table->string('tuning_id', 30);
            $table->string('instrument', 10);
            $table->boolean('completed')->default(false);
            $table->integer('duration_ms')->nullable();
            $table->integer('total_notes');
            $table->integer('notes_hit');
            $table->decimal('accuracy', 5, 2)->nullable();
            $table->date('practice_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('practice_sessions');
    }
};
