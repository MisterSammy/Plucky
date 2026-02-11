<?php

namespace App\Http\Controllers;

use App\Models\Player;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlayerController extends Controller
{
    public function index()
    {
        return Inertia::render('Players/Index', [
            'players' => Player::withCount('practiceSessions')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'color' => 'required|string|max:7',
        ]);

        Player::where('is_active', true)->update(['is_active' => false]);

        $player = Player::create([...$validated, 'is_active' => true]);
        $player->settings()->create();

        return redirect()->route('practice');
    }

    public function activate(Player $player)
    {
        Player::where('is_active', true)->update(['is_active' => false]);
        $player->update(['is_active' => true]);

        return redirect()->route('practice');
    }

    public function destroy(Player $player)
    {
        $player->delete();

        return redirect()->route('players.index');
    }
}
