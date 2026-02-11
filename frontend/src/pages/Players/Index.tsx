import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';

interface Player {
    id: number;
    name: string;
    color: string;
    practice_sessions_count: number;
}

const COLORS = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4'];

export default function PlayersIndex() {
    const { players } = usePage<{ players: Player[] }>().props;
    const [name, setName] = useState('');
    const [color, setColor] = useState(COLORS[0]);
    const [deleting, setDeleting] = useState<number | null>(null);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        router.post('/players', { name: name.trim(), color });
        setName('');
    };

    const handleActivate = (id: number) => {
        router.post(`/players/${id}/activate`);
    };

    const handleDelete = (id: number) => {
        if (deleting === id) {
            router.delete(`/players/${id}`);
            setDeleting(null);
        } else {
            setDeleting(id);
        }
    };

    return (
        <div className="min-h-screen bg-content flex items-center justify-center p-6">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Scale<span className="text-accent">Pro</span>
                    </h1>
                    <p className="text-gray-400">Choose a player or create a new one</p>
                </div>

                {/* Existing players */}
                {players.length > 0 && (
                    <div className="space-y-2">
                        {players.map((player) => (
                            <div
                                key={player.id}
                                className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-gray-700 hover:border-accent/50 transition-all group"
                            >
                                <button
                                    onClick={() => handleActivate(player.id)}
                                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                                >
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                                        style={{ backgroundColor: player.color }}
                                    >
                                        {player.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-white font-medium truncate">{player.name}</div>
                                        <div className="text-xs text-gray-500">
                                            {player.practice_sessions_count} session{player.practice_sessions_count !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => handleDelete(player.id)}
                                    className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                                        deleting === player.id
                                            ? 'bg-red-500/20 text-red-400'
                                            : 'text-gray-600 hover:text-gray-400 opacity-0 group-hover:opacity-100'
                                    }`}
                                    title={deleting === player.id ? 'Click again to confirm' : 'Delete player'}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create new player */}
                <form onSubmit={handleCreate} className="p-4 rounded-xl bg-surface border border-gray-700 space-y-4">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">New Player</h2>

                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name..."
                        maxLength={50}
                        className="w-full px-3 py-2 rounded-lg bg-content border border-gray-700 text-white placeholder-gray-500 focus:border-accent focus:outline-none"
                    />

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Color:</span>
                        {COLORS.map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setColor(c)}
                                className={`w-7 h-7 rounded-full transition-all ${
                                    color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-surface scale-110' : 'hover:scale-110'
                                }`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className="w-full py-2 rounded-lg bg-accent hover:bg-accent-hover text-black font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Start Playing
                    </button>
                </form>
            </div>
        </div>
    );
}
