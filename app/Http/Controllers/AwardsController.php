<?php

namespace App\Http\Controllers;

use App\Models\Player;
use App\Services\AchievementService;
use Carbon\Carbon;
use Inertia\Inertia;

class AwardsController extends Controller
{
    public function index(AchievementService $achievementService)
    {
        $player = Player::where('is_active', true)->first();

        if (! $player) {
            return redirect()->route('players.index');
        }

        // Summary stats
        $stats = $player->practiceSessions()
            ->selectRaw('
                count(*) as total_sessions,
                sum(case when completed then 1 else 0 end) as completed_sessions,
                coalesce(sum(duration_ms), 0) as total_practice_time_ms,
                count(distinct scale_id) as unique_scales_practiced
            ')
            ->first();

        // Unlocked achievements keyed by achievement_key
        $unlockedAchievements = $player->achievements()
            ->get()
            ->keyBy('achievement_key')
            ->map(fn ($a) => [
                'key' => $a->achievement_key,
                'category' => $a->category,
                'tier' => $a->tier,
                'metadata' => $a->metadata,
                'unlocked_at' => $a->unlocked_at->toISOString(),
            ])
            ->toArray();

        // Genre progress
        $genreProgress = $achievementService->getGenreProgress($player);

        // Recent sessions
        $recentSessions = $player->practiceSessions()
            ->where('completed', true)
            ->latest()
            ->take(20)
            ->get();

        // Leaderboard
        $allPlayers = Player::withCount([
            'practiceSessions',
            'practiceSessions as completed_count' => function ($q) {
                $q->where('completed', true);
            },
        ])->get();

        return Inertia::render('Stats/Index', [
            'player' => $player,
            'stats' => [
                'totalSessions' => (int) $stats->completed_sessions,
                'totalPracticeTimeMs' => (int) $stats->total_practice_time_ms,
                'uniqueScalesPracticed' => (int) $stats->unique_scales_practiced,
                'currentStreak' => $this->calculateStreak($player),
                'longestStreak' => $this->calculateLongestStreak($player),
            ],
            'unlockedAchievements' => $unlockedAchievements,
            'genreProgress' => $genreProgress,
            'recentSessions' => $recentSessions,
            'allPlayers' => $allPlayers,
        ]);
    }

    private function calculateStreak(Player $player): int
    {
        $dates = $player->practiceSessions()
            ->where('completed', true)
            ->selectRaw('DISTINCT practice_date')
            ->orderByDesc('practice_date')
            ->pluck('practice_date')
            ->map(fn ($d) => Carbon::parse($d));

        if ($dates->isEmpty()) {
            return 0;
        }

        $first = $dates->first();
        if ($first->lt(today()->subDay())) {
            return 0;
        }

        $streak = 1;
        for ($i = 1; $i < $dates->count(); $i++) {
            if ($dates[$i - 1]->diffInDays($dates[$i]) === 1) {
                $streak++;
            } else {
                break;
            }
        }

        return $streak;
    }

    private function calculateLongestStreak(Player $player): int
    {
        $dates = $player->practiceSessions()
            ->where('completed', true)
            ->selectRaw('DISTINCT practice_date')
            ->orderBy('practice_date')
            ->pluck('practice_date')
            ->map(fn ($d) => Carbon::parse($d));

        if ($dates->isEmpty()) {
            return 0;
        }

        $longest = 1;
        $current = 1;
        for ($i = 1; $i < $dates->count(); $i++) {
            if ($dates[$i]->diffInDays($dates[$i - 1]) === 1) {
                $current++;
                $longest = max($longest, $current);
            } else {
                $current = 1;
            }
        }

        return $longest;
    }
}
