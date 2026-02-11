import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';

interface PlayerProgress {
    id: number;
    completed_runs: number;
    best_time_ms: number | null;
}

interface TrackScaleItem {
    id: number;
    scale_id: string;
    suggested_root: string;
    sort_order: number;
    tip: string | null;
    player_progress: PlayerProgress[];
}

interface LearningTrack {
    id: number;
    slug: string;
    name: string;
    description: string;
    difficulty: string;
    color: string;
    scales: TrackScaleItem[];
}

interface PlayerSettings {
    completion_threshold: number;
}

interface Props {
    player: { id: number; name: string; settings: PlayerSettings | null };
    tracks: LearningTrack[];
}

const DIFFICULTY_COLORS: Record<string, string> = {
    beginner: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    intermediate: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    advanced: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
};

const TRACK_ACCENTS: Record<string, string> = {
    emerald: 'border-emerald-500/30',
    amber: 'border-amber-500/30',
    violet: 'border-violet-500/30',
};

const PROGRESS_COLORS: Record<string, string> = {
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    violet: 'bg-violet-400',
};

function scaleIdToName(id: string): string {
    return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function formatTime(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

function ThresholdSelector({ current }: { current: number }) {
    const options = [1, 3, 5];

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Runs to master:</span>
            {options.map((n) => (
                <button
                    key={n}
                    onClick={() => router.patch('/settings', { completion_threshold: n }, { preserveState: true })}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        current === n
                            ? 'bg-accent text-black'
                            : 'bg-surface text-gray-400 hover:text-white border border-gray-700'
                    }`}
                >
                    {n}
                </button>
            ))}
        </div>
    );
}

export default function LearningTracksIndex() {
    const { player, tracks } = usePage<Props & Record<string, unknown>>().props;
    const [expanded, setExpanded] = useState<string | null>(tracks[0]?.slug ?? null);
    const threshold = player.settings?.completion_threshold ?? 1;

    const handlePractice = (scale: TrackScaleItem) => {
        router.visit('/', {
            data: {
                scaleId: scale.scale_id,
                root: scale.suggested_root,
                trackScaleId: String(scale.id),
            },
        });
    };

    return (
        <AppLayout>
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto p-6 space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <h1 className="text-2xl font-bold text-white">Learning Tracks</h1>
                        <ThresholdSelector current={threshold} />
                    </div>

                    {tracks.map((track) => {
                        const isExpanded = expanded === track.slug;
                        const completedCount = track.scales.filter(
                            (s) => (s.player_progress[0]?.completed_runs ?? 0) >= threshold
                        ).length;

                        return (
                            <div
                                key={track.id}
                                className={`rounded-xl border bg-surface/50 overflow-hidden ${TRACK_ACCENTS[track.color] ?? 'border-gray-800'}`}
                            >
                                {/* Track header */}
                                <button
                                    onClick={() => setExpanded(isExpanded ? null : track.slug)}
                                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/[0.02] transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h2 className="text-lg font-semibold text-white">{track.name}</h2>
                                            <span className={`text-xs px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[track.difficulty] ?? ''}`}>
                                                {track.difficulty}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-1">{track.description}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-sm font-medium text-white">
                                            {completedCount}/{track.scales.length}
                                        </div>
                                        <div className="w-20 h-1.5 rounded-full bg-gray-800 mt-1 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${PROGRESS_COLORS[track.color] ?? 'bg-accent'}`}
                                                style={{ width: `${(completedCount / track.scales.length) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className={`text-gray-500 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                    >
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </button>

                                {/* Scale list */}
                                {isExpanded && (
                                    <div className="border-t border-gray-800/50">
                                        {track.scales.map((scale, i) => {
                                            const progress = scale.player_progress[0];
                                            const runs = progress?.completed_runs ?? 0;
                                            const isMastered = runs >= threshold;

                                            return (
                                                <div
                                                    key={scale.id}
                                                    className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-gray-800/30' : ''}`}
                                                >
                                                    {/* Status indicator */}
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                                                        isMastered
                                                            ? `${PROGRESS_COLORS[track.color] ?? 'bg-accent'} text-black`
                                                            : 'bg-gray-800 text-gray-500'
                                                    }`}>
                                                        {isMastered ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                        ) : (
                                                            scale.sort_order
                                                        )}
                                                    </div>

                                                    {/* Scale info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm text-white">
                                                            {scale.suggested_root} {scaleIdToName(scale.scale_id)}
                                                        </div>
                                                        {scale.tip && (
                                                            <div className="text-xs text-gray-500 truncate">{scale.tip}</div>
                                                        )}
                                                    </div>

                                                    {/* Progress */}
                                                    <div className="text-xs text-gray-500 shrink-0">
                                                        {runs}/{threshold}
                                                        {progress?.best_time_ms && (
                                                            <span className="ml-2 text-gray-600">{formatTime(progress.best_time_ms)}</span>
                                                        )}
                                                    </div>

                                                    {/* Practice button */}
                                                    <button
                                                        onClick={() => handlePractice(scale)}
                                                        className="px-3 py-1 rounded-lg text-xs font-medium bg-white/5 text-gray-300 hover:bg-accent hover:text-black transition-colors shrink-0"
                                                    >
                                                        Practice
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
