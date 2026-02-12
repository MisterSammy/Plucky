import { usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { GENRES } from '@/data/genres';
import {
    GENRE_EXPLORATION_AWARDS,
    MILESTONE_AWARDS,
    TIER_COLORS,
    TIER_ORDER,
} from '@/data/achievements';

interface Player {
    id: number;
    name: string;
    color: string;
    practice_sessions_count: number;
    completed_count: number;
}

interface Stats {
    totalSessions: number;
    totalPracticeTimeMs: number;
    uniqueScalesPracticed: number;
    currentStreak: number;
    longestStreak: number;
}

interface UnlockedAchievement {
    key: string;
    category: string;
    tier?: string;
    metadata?: Record<string, unknown>;
    unlocked_at: string;
}

interface TierProgress {
    completed: number;
    total: number;
    unlocked: boolean;
}

interface GenreProgressItem {
    name: string;
    scaleCount: number;
    tiers: Record<string, TierProgress>;
}

interface RecentSession {
    id: number;
    scale_id: string;
    root_note: string;
    instrument: string;
    duration_ms: number | null;
    created_at: string;
}

interface Props {
    player: { id: number; name: string; color: string };
    stats: Stats;
    unlockedAchievements: Record<string, UnlockedAchievement>;
    genreProgress: Record<string, GenreProgressItem>;
    recentSessions: RecentSession[];
    allPlayers: Player[];
}

function formatDuration(ms: number): string {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

function formatTime(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
    return (
        <div className="p-4 rounded-xl bg-surface border border-gray-800">
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-sm text-gray-400 mt-1">{label}</div>
            {sub && <div className="text-xs text-gray-600 mt-0.5">{sub}</div>}
        </div>
    );
}

function scaleIdToName(id: string): string {
    return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Genre color mapping from Tailwind color names to hex
const GENRE_COLOR_MAP: Record<string, string> = {
    amber: '#f59e0b',
    red: '#ef4444',
    indigo: '#6366f1',
    violet: '#8b5cf6',
    emerald: '#10b981',
    orange: '#f97316',
    fuchsia: '#d946ef',
    slate: '#64748b',
    rose: '#f43f5e',
    cyan: '#06b6d4',
    teal: '#14b8a6',
    purple: '#a855f7',
};

function AwardBadge({ unlocked, label, color, size = 'sm' }: {
    unlocked: boolean;
    label: string;
    color?: string;
    size?: 'sm' | 'md';
}) {
    const dim = size === 'md' ? 'w-10 h-10 text-xs' : 'w-8 h-8 text-[10px]';
    return (
        <div
            className={`${dim} rounded-full flex items-center justify-center font-bold border-2 transition-all ${
                unlocked
                    ? 'text-white shadow-lg'
                    : 'text-gray-600 border-gray-700 bg-gray-800/50 opacity-50'
            }`}
            style={unlocked ? {
                backgroundColor: color ?? '#f59e0b',
                borderColor: color ?? '#f59e0b',
                boxShadow: `0 0 12px ${color ?? '#f59e0b'}40`,
            } : undefined}
            title={label}
        >
            {unlocked ? '\u2713' : '?'}
        </div>
    );
}

function TierBadge({ tier, unlocked, progress }: {
    tier: string;
    unlocked: boolean;
    progress?: { completed: number; total: number };
}) {
    const color = TIER_COLORS[tier];
    return (
        <div className="flex flex-col items-center gap-0.5">
            <div
                className={`w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-bold border transition-all ${
                    unlocked
                        ? 'text-white'
                        : 'text-gray-600 border-gray-700 bg-gray-800/50 opacity-40'
                }`}
                style={unlocked ? {
                    backgroundColor: color,
                    borderColor: color,
                    boxShadow: `0 0 8px ${color}40`,
                    color: tier === 'diamond' ? '#1a1a2e' : '#fff',
                } : undefined}
                title={`${tier.charAt(0).toUpperCase() + tier.slice(1)}${progress ? ` (${progress.completed}/${progress.total})` : ''}`}
            >
                {tier.charAt(0).toUpperCase()}
            </div>
            {progress && !unlocked && (
                <span className="text-[9px] text-gray-500">{progress.completed}/{progress.total}</span>
            )}
        </div>
    );
}

export default function StatsIndex() {
    const { stats, unlockedAchievements, genreProgress, recentSessions, allPlayers } = usePage<Props & Record<string, unknown>>().props;

    return (
        <AppLayout>
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto p-6 space-y-8">
                    <h1 className="text-2xl font-bold text-white">Stats & Awards</h1>

                    {/* Summary cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        <StatCard label="Sessions" value={stats.totalSessions} />
                        <StatCard label="Current Streak" value={`${stats.currentStreak}d`} />
                        <StatCard label="Longest Streak" value={`${stats.longestStreak}d`} />
                        <StatCard label="Practice Time" value={formatDuration(stats.totalPracticeTimeMs)} />
                        <StatCard label="Scales Explored" value={stats.uniqueScalesPracticed} />
                    </div>

                    {/* Genre Exploration */}
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold text-white">Genre Exploration</h2>
                        <div className="flex flex-wrap gap-3">
                            {GENRE_EXPLORATION_AWARDS.map((award) => {
                                const genre = GENRES.find(g => g.id === award.genreId);
                                const unlocked = !!unlockedAchievements[award.key];
                                const color = genre ? GENRE_COLOR_MAP[genre.color] : undefined;
                                return (
                                    <div key={award.key} className="flex flex-col items-center gap-1">
                                        <AwardBadge
                                            unlocked={unlocked}
                                            label={award.title}
                                            color={color}
                                            size="md"
                                        />
                                        <span className={`text-[10px] ${unlocked ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {genre?.name.split(' ')[0] ?? award.genreId}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Genre Mastery */}
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold text-white">Genre Mastery</h2>
                        <div className="space-y-2">
                            {GENRES.map((genre) => {
                                const progress = genreProgress[genre.id];
                                const color = GENRE_COLOR_MAP[genre.color];
                                return (
                                    <div
                                        key={genre.id}
                                        className="flex items-center gap-4 p-3 rounded-xl bg-surface/50 border border-gray-800/50"
                                    >
                                        <div className="w-28 shrink-0">
                                            <div className="text-sm font-medium text-white truncate">{genre.name}</div>
                                            <div className="text-[10px] text-gray-500">{genre.scaleIds.length} scales</div>
                                        </div>
                                        <div className="flex gap-3">
                                            {TIER_ORDER.map((tier) => {
                                                const key = `genre:${genre.id}:${tier}`;
                                                const unlocked = !!unlockedAchievements[key];
                                                const tierProg = progress?.tiers[tier];
                                                return (
                                                    <TierBadge
                                                        key={tier}
                                                        tier={tier}
                                                        unlocked={unlocked}
                                                        progress={tierProg}
                                                    />
                                                );
                                            })}
                                        </div>
                                        {/* Progress bar for bronze */}
                                        {progress && !progress.tiers.bronze.unlocked && (
                                            <div className="flex-1 min-w-0">
                                                <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={{
                                                            width: `${(progress.tiers.bronze.completed / progress.tiers.bronze.total) * 100}%`,
                                                            backgroundColor: color,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Practice Milestones */}
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold text-white">Practice Milestones</h2>
                        <div className="flex flex-wrap gap-4">
                            {MILESTONE_AWARDS.map((award) => {
                                const unlocked = !!unlockedAchievements[award.key];
                                return (
                                    <div key={award.key} className="flex flex-col items-center gap-1.5">
                                        <div
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all ${
                                                unlocked
                                                    ? 'bg-accent/20 border-accent text-accent shadow-lg'
                                                    : 'bg-gray-800/50 border-gray-700 text-gray-600 opacity-50'
                                            }`}
                                            style={unlocked ? { boxShadow: '0 0 12px #f59e0b40' } : undefined}
                                            title={award.description}
                                        >
                                            {unlocked ? '\u2605' : '\u2606'}
                                        </div>
                                        <span className={`text-[10px] text-center max-w-[64px] ${unlocked ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {award.title}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent Sessions */}
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold text-white">Recent Sessions</h2>
                        {recentSessions.length === 0 ? (
                            <p className="text-gray-500 text-sm">No sessions recorded yet. Start practicing to see your stats!</p>
                        ) : (
                            <div className="space-y-1">
                                {recentSessions.map((s) => (
                                    <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-surface/50 border border-gray-800/50">
                                        <div className="w-2 h-2 rounded-full shrink-0 bg-emerald-400" />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm text-white truncate">
                                                {s.root_note} {scaleIdToName(s.scale_id)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {s.instrument}
                                                {s.duration_ms && ` \u00B7 ${formatTime(s.duration_ms)}`}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-600 shrink-0">
                                            {new Date(s.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Leaderboard */}
                    {allPlayers.length > 1 && (
                        <div className="space-y-3">
                            <h2 className="text-lg font-semibold text-white">Leaderboard</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-500 border-b border-gray-800">
                                            <th className="pb-2 pr-4">Player</th>
                                            <th className="pb-2 pr-4">Sessions</th>
                                            <th className="pb-2">Completed</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allPlayers
                                            .sort((a, b) => b.completed_count - a.completed_count)
                                            .map((p) => (
                                                <tr key={p.id} className="border-b border-gray-800/50">
                                                    <td className="py-2 pr-4">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                                                style={{ backgroundColor: p.color }}
                                                            >
                                                                {p.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="text-white">{p.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-2 pr-4 text-gray-400">{p.practice_sessions_count}</td>
                                                    <td className="py-2 text-gray-400">{p.completed_count}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
