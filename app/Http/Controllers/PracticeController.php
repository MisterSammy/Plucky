<?php

namespace App\Http\Controllers;

use App\Models\Player;
use App\Models\PlayerTrackProgress;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PracticeController extends Controller
{
    public function index(Request $request)
    {
        $player = Player::where('is_active', true)->first();

        if (! $player) {
            if (Player::count() === 1) {
                $player = Player::first();
                $player->update(['is_active' => true]);
            } else {
                return redirect()->route('players.index');
            }
        }

        return Inertia::render('Practice/Index', [
            'player' => $player->load('settings'),
            'recentSessions' => $player->practiceSessions()
                ->where('completed', true)
                ->latest()
                ->take(5)
                ->get(),
            'preselect' => [
                'scaleId' => $request->query('scaleId'),
                'root' => $request->query('root'),
                'trackScaleId' => $request->query('trackScaleId'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'scale_id' => 'required|string|max:50',
            'root_note' => 'required|string|max:3',
            'tuning_id' => 'required|string|max:30',
            'instrument' => 'required|in:guitar,piano',
            'completed' => 'required|boolean',
            'duration_ms' => 'nullable|integer|min:0',
            'total_notes' => 'required|integer|min:1',
            'notes_hit' => 'required|integer|min:0',
            'track_scale_id' => 'nullable|integer|exists:track_scales,id',
        ]);

        $player = Player::where('is_active', true)->first();

        if (! $player) {
            return redirect()->route('practice');
        }

        $accuracy = ($validated['total_notes'] > 0)
            ? round(($validated['notes_hit'] / $validated['total_notes']) * 100, 2)
            : 0;

        $player->practiceSessions()->create([
            'scale_id' => $validated['scale_id'],
            'root_note' => $validated['root_note'],
            'tuning_id' => $validated['tuning_id'],
            'instrument' => $validated['instrument'],
            'completed' => $validated['completed'],
            'duration_ms' => $validated['duration_ms'],
            'total_notes' => $validated['total_notes'],
            'notes_hit' => $validated['notes_hit'],
            'accuracy' => $accuracy,
            'practice_date' => now()->toDateString(),
        ]);

        // Update learning track progress if applicable
        if (isset($validated['track_scale_id']) && $validated['completed']) {
            $progress = PlayerTrackProgress::firstOrCreate(
                ['player_id' => $player->id, 'track_scale_id' => $validated['track_scale_id']],
                ['completed_runs' => 0]
            );
            $progress->increment('completed_runs');

            if ($validated['duration_ms'] && (! $progress->best_time_ms || $validated['duration_ms'] < $progress->best_time_ms)) {
                $progress->update(['best_time_ms' => $validated['duration_ms']]);
            }
        }

        return redirect()->route('practice');
    }

    public function savePreferences(Request $request)
    {
        $request->validate([
            'preferences' => 'required|array',
        ]);

        $player = Player::where('is_active', true)->first();

        if (! $player) {
            return response()->json(['error' => 'no_player'], 404);
        }

        $player->settings()->updateOrCreate(
            ['player_id' => $player->id],
            ['preferences' => $request->input('preferences')]
        );

        return response()->json(['ok' => true]);
    }

    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'completion_threshold' => 'sometimes|integer|in:1,3,5',
            'preferred_instrument' => 'sometimes|string|in:guitar,piano',
            'theme' => 'sometimes|string|in:light,dark,system',
        ]);

        $player = Player::where('is_active', true)->firstOrFail();
        $player->settings()->updateOrCreate(
            ['player_id' => $player->id],
            $validated
        );

        return back();
    }
}
