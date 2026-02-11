<?php

namespace App\Http\Controllers;

use App\Models\Player;
use Carbon\Carbon;
use Inertia\Inertia;

class StatsController extends Controller
{
    public function index()
    {
        $player = Player::where('is_active', true)->first();

        if (! $player) {
            return redirect()->route('players.index');
        }

        // Single aggregation query for all session stats
        $stats = $player->practiceSessions()
            ->selectRaw('
                count(*) as total_sessions,
                sum(case when completed then 1 else 0 end) as completed_sessions,
                coalesce(sum(duration_ms), 0) as total_practice_time_ms,
                count(distinct scale_id) as unique_scales_practiced,
                count(distinct case when completed then scale_id else null end) as unique_scales_completed,
                round(avg(case when completed then accuracy else null end), 1) as average_accuracy,
                min(case when completed then duration_ms else null end) as fastest_session_ms
            ')
            ->first();

        return Inertia::render('Stats/Index', [
            'player' => $player,
            'stats' => [
                'totalSessions' => (int) $stats->total_sessions,
                'completedSessions' => (int) $stats->completed_sessions,
                'totalPracticeTimeMs' => (int) $stats->total_practice_time_ms,
                'uniqueScalesPracticed' => (int) $stats->unique_scales_practiced,
                'uniqueScalesCompleted' => (int) $stats->unique_scales_completed,
                'currentStreak' => $this->calculateStreak($player),
                'longestStreak' => $this->calculateLongestStreak($player),
                'averageAccuracy' => (float) ($stats->average_accuracy ?? 0),
                'fastestSessionMs' => $stats->fastest_session_ms,
            ],
            'recentSessions' => $player->practiceSessions()
                ->latest()
                ->take(20)
                ->get(),
            'scaleBreakdown' => $player->practiceSessions()
                ->selectRaw('scale_id, root_note, count(*) as attempts, sum(case when completed then 1 else 0 end) as completions, min(case when completed then duration_ms else null end) as best_time_ms')
                ->groupBy('scale_id', 'root_note')
                ->get(),
            'allPlayers' => Player::withCount([
                'practiceSessions',
                'practiceSessions as completed_count' => function ($q) {
                    $q->where('completed', true);
                },
            ])->get(),
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
