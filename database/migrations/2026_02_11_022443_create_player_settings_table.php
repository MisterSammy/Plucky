<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('player_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('player_id')->unique()->constrained()->cascadeOnDelete();
            $table->integer('completion_threshold')->default(1);
            $table->string('preferred_instrument', 10)->default('guitar');
            $table->string('theme', 10)->default('dark');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('player_settings');
    }
};
