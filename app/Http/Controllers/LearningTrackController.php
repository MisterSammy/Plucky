<?php

namespace App\Http\Controllers;

use App\Models\LearningTrack;
use App\Models\Player;
use Inertia\Inertia;

class LearningTrackController extends Controller
{
    public function index()
    {
        $player = Player::where('is_active', true)->first();

        if (! $player) {
            return redirect()->route('players.index');
        }

        $tracks = LearningTrack::with(['scales' => function ($q) use ($player) {
            $q->with(['playerProgress' => function ($q) use ($player) {
                $q->where('player_id', $player->id);
            }]);
        }])->orderBy('sort_order')->get();

        return Inertia::render('LearningTracks/Index', [
            'player' => $player->load('settings'),
            'tracks' => $tracks,
        ]);
    }
}
