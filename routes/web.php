<?php

use App\Http\Controllers\LearningTrackController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\PracticeController;
use App\Http\Controllers\StatsController;
use Illuminate\Support\Facades\Route;

// Player management
Route::get('/players', [PlayerController::class, 'index'])->name('players.index');
Route::post('/players', [PlayerController::class, 'store'])->name('players.store');
Route::post('/players/{player}/activate', [PlayerController::class, 'activate'])->name('players.activate');
Route::delete('/players/{player}', [PlayerController::class, 'destroy'])->name('players.destroy');

// Main practice view
Route::get('/', [PracticeController::class, 'index'])->name('practice');

// Session recording
Route::post('/sessions', [PracticeController::class, 'store'])->name('sessions.store');

// Settings
Route::patch('/settings', [PracticeController::class, 'updateSettings'])->name('settings.update');
Route::put('/preferences', [PracticeController::class, 'savePreferences'])->name('preferences.save');

// Stats dashboard
Route::get('/stats', [StatsController::class, 'index'])->name('stats');

// Learning tracks
Route::get('/tracks', [LearningTrackController::class, 'index'])->name('tracks');
