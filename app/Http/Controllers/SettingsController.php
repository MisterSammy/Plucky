<?php

namespace App\Http\Controllers;

use App\Models\Player;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $player = Player::where('is_active', true)->first();

        if (! $player) {
            return redirect()->route('players.index');
        }

        return Inertia::render('Settings/Index', [
            'player' => $player->load('settings'),
        ]);
    }
}
