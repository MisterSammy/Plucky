import { usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';

interface Player {
    id: number;
    name: string;
    color: string;
    practice_sessions_count: number;
    completed_count: number;
}

interface Stats {
    totalSessions: number;
    completedSessions: number;
    totalPracticeTimeMs: number;
    uniqueScalesPracticed: number;
    uniqueScalesCompleted: number;
    currentStreak: number;
    longestStreak: number;
    averageAccuracy: number;
    fastestSessionMs: number | null;
}

interface RecentSession {
    id: number;
    scale_id: string;
    root_note: string;
    instrument: string;
    completed: boolean;
    duration_ms: number | null;
    accuracy: string | null;
    practice_date: string;
    created_at: string;
}

interface ScaleBreakdown {
    scale_id: string;
    root_note: string;
    attempts: number;
    completions: number;
    best_time_ms: number | null;
}

interface Props {
    player: { id: number; name: string; color: string };
    stats: Stats;
    recentSessions: RecentSession[];
    scaleBreakdown: ScaleBreakdown[];
    allPlayers: Player[];
}

function formatTime(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

function formatDuration(ms: number): string {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
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

export default function StatsIndex() {
    const { stats, recentSessions, scaleBreakdown, allPlayers } = usePage<Props & Record<string, unknown>>().props;

    const completionRate = stats.totalSessions > 0
        ? Math.round((stats.completedSessions / stats.totalSessions) * 100)
        : 0;

    return (
        <AppLayout>
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto p-6 space-y-8">
                    <h1 className="text-2xl font-bold text-white">Stats Dashboard</h1>

                    {/* Summary cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        <StatCard label="Completed" value={stats.completedSessions} sub={`${completionRate}% rate`} />
                        <StatCard label="Current Streak" value={`${stats.currentStreak}d`} />
                        <StatCard label="Longest Streak" value={`${stats.longestStreak}d`} />
                        <StatCard label="Practice Time" value={formatDuration(stats.totalPracticeTimeMs)} />
                        <StatCard label="Avg Accuracy" value={`${stats.averageAccuracy}%`} />
                        <StatCard label="Scales Mastered" value={stats.uniqueScalesCompleted} sub={`of ${stats.uniqueScalesPracticed} tried`} />
                    </div>

                    {stats.fastestSessionMs && (
                        <div className="text-sm text-gray-500">
                            Fastest completion: {formatTime(stats.fastestSessionMs)}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Scale breakdown */}
                        <div className="space-y-3">
                            <h2 className="text-lg font-semibold text-white">Scale Breakdown</h2>
                            {scaleBreakdown.length === 0 ? (
                                <p className="text-gray-500 text-sm">No practice sessions yet. Start practicing to see your stats!</p>
                            ) : (
                                <div className="space-y-1">
                                    {scaleBreakdown.map((s) => (
                                        <div key={`${s.scale_id}-${s.root_note}`} className="flex items-center gap-3 p-2.5 rounded-lg bg-surface/50 border border-gray-800/50">
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm text-white truncate">
                                                    {s.root_note} {scaleIdToName(s.scale_id)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {s.completions}/{s.attempts} completed
                                                    {s.best_time_ms && ` · Best: ${formatTime(s.best_time_ms)}`}
                                                </div>
                                            </div>
                                            <div className="w-16 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-accent"
                                                    style={{ width: `${Math.min(100, (Number(s.completions) / Number(s.attempts)) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent sessions */}
                        <div className="space-y-3">
                            <h2 className="text-lg font-semibold text-white">Recent Sessions</h2>
                            {recentSessions.length === 0 ? (
                                <p className="text-gray-500 text-sm">No sessions recorded yet.</p>
                            ) : (
                                <div className="space-y-1">
                                    {recentSessions.map((s) => (
                                        <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-surface/50 border border-gray-800/50">
                                            <div className={`w-2 h-2 rounded-full shrink-0 ${s.completed ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm text-white truncate">
                                                    {s.root_note} {scaleIdToName(s.scale_id)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {s.instrument} · {s.accuracy}%
                                                    {s.duration_ms && ` · ${formatTime(s.duration_ms)}`}
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
                                            <th className="pb-2 pr-4">Completed</th>
                                            <th className="pb-2">Rate</th>
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
                                                    <td className="py-2 pr-4 text-gray-400">{p.completed_count}</td>
                                                    <td className="py-2 text-gray-400">
                                                        {p.practice_sessions_count > 0
                                                            ? `${Math.round((p.completed_count / p.practice_sessions_count) * 100)}%`
                                                            : '-'}
                                                    </td>
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
