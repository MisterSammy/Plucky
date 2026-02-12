<?php

namespace App\Services;

use App\Models\Player;
use App\Models\PlayerAchievement;
use App\Models\PracticeSession;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AchievementService
{
    private const TIER_THRESHOLDS = [
        'bronze' => 1,
        'silver' => 5,
        'gold' => 10,
        'diamond' => 100,
    ];

    private const MILESTONE_SESSIONS = [10, 50, 100, 500];

    private const MILESTONE_SCALES = [10, 25, 52];

    private const MILESTONE_STREAKS = [7, 30];

    /**
     * Evaluate all achievements after a session is saved.
     * Returns array of newly unlocked achievements.
     */
    public function evaluate(Player $player, PracticeSession $session): array
    {
        if (! $session->completed) {
            return [];
        }

        $newAchievements = [];

        $newAchievements = array_merge($newAchievements, $this->checkFastestTime($player, $session));
        $newAchievements = array_merge($newAchievements, $this->checkMilestones($player));

        // Genre achievements only fire when a genre is selected
        if ($session->genre_id) {
            $newAchievements = array_merge($newAchievements, $this->checkGenreExploration($player, $session));
            $newAchievements = array_merge($newAchievements, $this->checkGenreCompletions($player, $session));
        }

        return $newAchievements;
    }

    private function checkFastestTime(Player $player, PracticeSession $session): array
    {
        if (! $session->duration_ms) {
            return [];
        }

        $key = "fastest:{$session->scale_id}:{$session->root_note}";

        // Get previous best for this scale+root
        $previousBest = $player->practiceSessions()
            ->where('scale_id', $session->scale_id)
            ->where('root_note', $session->root_note)
            ->where('completed', true)
            ->where('id', '!=', $session->id)
            ->min('duration_ms');

        // First completion or new personal best
        if ($previousBest === null || $session->duration_ms < $previousBest) {
            $achievement = PlayerAchievement::updateOrCreate(
                ['player_id' => $player->id, 'achievement_key' => $key],
                [
                    'category' => 'fastest',
                    'metadata' => [
                        'scale_id' => $session->scale_id,
                        'root_note' => $session->root_note,
                        'time_ms' => $session->duration_ms,
                        'previous_ms' => $previousBest,
                    ],
                    'unlocked_at' => now(),
                ]
            );

            // Only toast if this beats a previous record (not first time)
            if ($previousBest !== null) {
                return [[
                    'key' => $key,
                    'category' => 'fastest',
                    'title' => 'New Fastest Time!',
                    'message' => $this->formatScaleName($session->scale_id).' in '.
                        $this->formatTime($session->duration_ms).
                        ' (was '.$this->formatTime($previousBest).')',
                ]];
            }
        }

        return [];
    }

    private function checkGenreExploration(Player $player, PracticeSession $session): array
    {
        $genreId = $session->genre_id;
        $key = "explore:{$genreId}";

        // Already unlocked?
        if ($player->achievements()->where('achievement_key', $key)->exists()) {
            return [];
        }

        $genreName = config("genres.{$genreId}.name", $genreId);

        $player->achievements()->create([
            'achievement_key' => $key,
            'category' => 'genre_exploration',
            'metadata' => ['genre_id' => $genreId],
            'unlocked_at' => now(),
        ]);

        return [[
            'key' => $key,
            'category' => 'genre_exploration',
            'title' => 'Genre Explored!',
            'message' => $genreName,
        ]];
    }

    private function checkGenreCompletions(Player $player, PracticeSession $session): array
    {
        $genreId = $session->genre_id;
        $genreConfig = config("genres.{$genreId}");

        if (! $genreConfig) {
            return [];
        }

        $scaleIds = $genreConfig['scaleIds'];
        $genreName = $genreConfig['name'];

        // Get completion counts per scale for this genre
        $completions = $player->practiceSessions()
            ->where('genre_id', $genreId)
            ->where('completed', true)
            ->whereIn('scale_id', $scaleIds)
            ->select('scale_id', DB::raw('COUNT(*) as count'))
            ->groupBy('scale_id')
            ->pluck('count', 'scale_id');

        $newAchievements = [];

        foreach (self::TIER_THRESHOLDS as $tier => $threshold) {
            $key = "genre:{$genreId}:{$tier}";

            // Already unlocked?
            if ($player->achievements()->where('achievement_key', $key)->exists()) {
                continue;
            }

            // Check if every scale in the genre has enough completions
            $allMet = true;
            foreach ($scaleIds as $scaleId) {
                if (($completions[$scaleId] ?? 0) < $threshold) {
                    $allMet = false;
                    break;
                }
            }

            if ($allMet) {
                $player->achievements()->create([
                    'achievement_key' => $key,
                    'category' => 'genre_completion',
                    'tier' => $tier,
                    'metadata' => [
                        'genre_id' => $genreId,
                        'threshold' => $threshold,
                    ],
                    'unlocked_at' => now(),
                ]);

                $newAchievements[] = [
                    'key' => $key,
                    'category' => 'genre_completion',
                    'tier' => $tier,
                    'title' => "Genre Mastered: {$genreName}",
                    'message' => ucfirst($tier).' tier unlocked!',
                    'isFinalTier' => $tier === 'diamond',
                ];
            }
        }

        return $newAchievements;
    }

    private function checkMilestones(Player $player): array
    {
        $newAchievements = [];

        // Session count milestones
        $sessionCount = $player->practiceSessions()->where('completed', true)->count();
        foreach (self::MILESTONE_SESSIONS as $threshold) {
            $key = "milestone:sessions:{$threshold}";
            if ($sessionCount >= $threshold && ! $player->achievements()->where('achievement_key', $key)->exists()) {
                $player->achievements()->create([
                    'achievement_key' => $key,
                    'category' => 'milestone',
                    'metadata' => ['type' => 'sessions', 'threshold' => $threshold],
                    'unlocked_at' => now(),
                ]);
                $newAchievements[] = [
                    'key' => $key,
                    'category' => 'milestone',
                    'title' => 'Milestone!',
                    'message' => "{$threshold} Sessions Completed!",
                ];
            }
        }

        // Unique scales milestones
        $uniqueScales = $player->practiceSessions()
            ->where('completed', true)
            ->distinct('scale_id')
            ->count('scale_id');
        foreach (self::MILESTONE_SCALES as $threshold) {
            $key = "milestone:scales:{$threshold}";
            if ($uniqueScales >= $threshold && ! $player->achievements()->where('achievement_key', $key)->exists()) {
                $player->achievements()->create([
                    'achievement_key' => $key,
                    'category' => 'milestone',
                    'metadata' => ['type' => 'scales', 'threshold' => $threshold],
                    'unlocked_at' => now(),
                ]);
                $label = $threshold === 52 ? 'All 52 Scales Practiced!' : "{$threshold} Unique Scales!";
                $newAchievements[] = [
                    'key' => $key,
                    'category' => 'milestone',
                    'title' => 'Milestone!',
                    'message' => $label,
                ];
            }
        }

        // Streak milestones
        $currentStreak = $this->calculateStreak($player);
        foreach (self::MILESTONE_STREAKS as $threshold) {
            $key = "milestone:streak:{$threshold}";
            if ($currentStreak >= $threshold && ! $player->achievements()->where('achievement_key', $key)->exists()) {
                $player->achievements()->create([
                    'achievement_key' => $key,
                    'category' => 'milestone',
                    'metadata' => ['type' => 'streak', 'threshold' => $threshold],
                    'unlocked_at' => now(),
                ]);
                $newAchievements[] = [
                    'key' => $key,
                    'category' => 'milestone',
                    'title' => 'Streak!',
                    'message' => "{$threshold}-Day Practice Streak!",
                ];
            }
        }

        return $newAchievements;
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

    /**
     * Get genre completion progress for the awards page.
     */
    public function getGenreProgress(Player $player): array
    {
        $genres = config('genres', []);
        $progress = [];

        foreach ($genres as $genreId => $genre) {
            $scaleIds = $genre['scaleIds'];

            $completions = $player->practiceSessions()
                ->where('genre_id', $genreId)
                ->where('completed', true)
                ->whereIn('scale_id', $scaleIds)
                ->select('scale_id', DB::raw('COUNT(*) as count'))
                ->groupBy('scale_id')
                ->pluck('count', 'scale_id');

            $tierProgress = [];
            foreach (self::TIER_THRESHOLDS as $tier => $threshold) {
                $scalesCompleted = 0;
                foreach ($scaleIds as $scaleId) {
                    if (($completions[$scaleId] ?? 0) >= $threshold) {
                        $scalesCompleted++;
                    }
                }
                $tierProgress[$tier] = [
                    'completed' => $scalesCompleted,
                    'total' => count($scaleIds),
                    'unlocked' => $scalesCompleted === count($scaleIds),
                ];
            }

            $progress[$genreId] = [
                'name' => $genre['name'],
                'scaleCount' => count($scaleIds),
                'tiers' => $tierProgress,
            ];
        }

        return $progress;
    }

    private function formatScaleName(string $id): string
    {
        return implode(' ', array_map('ucfirst', explode('-', $id)));
    }

    private function formatTime(int $ms): string
    {
        if ($ms < 1000) {
            return $ms.'ms';
        }
        $seconds = round($ms / 1000, 1);

        return $seconds.'s';
    }
}
