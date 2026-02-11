<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('learning_tracks', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 50)->unique();
            $table->string('name', 100);
            $table->text('description');
            $table->string('difficulty', 20);
            $table->string('color', 20);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('track_scales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('learning_track_id')->constrained()->cascadeOnDelete();
            $table->string('scale_id', 50);
            $table->string('suggested_root', 3)->default('C');
            $table->integer('sort_order');
            $table->string('tip')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('track_scales');
        Schema::dropIfExists('learning_tracks');
    }
};
