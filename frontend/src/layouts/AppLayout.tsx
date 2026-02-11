import type { ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';

interface Player {
    id: number;
    name: string;
    color: string;
}

interface SharedProps {
    activePlayer: Player | null;
    [key: string]: unknown;
}

function NavIcon({ href, title, isActive, children }: { href: string; title: string; isActive: boolean; children: ReactNode }) {
    return (
        <Link
            href={href}
            title={title}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                isActive
                    ? 'bg-accent/20 text-accent'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
        >
            {children}
        </Link>
    );
}

export default function AppLayout({ children }: { children: ReactNode }) {
    const { activePlayer, url } = usePage<SharedProps>().props;
    const currentUrl = url as string;

    return (
        <div className="flex min-h-screen bg-content text-gray-100">
            {/* Navigation rail */}
            <nav className="w-14 bg-sidebar flex flex-col items-center py-3 gap-2 border-r border-gray-800 shrink-0">
                {/* Practice */}
                <NavIcon href="/" title="Practice" isActive={currentUrl === '/'}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11.9 12.1a4.3 4.3 0 0 0-1.2-6.1 4.3 4.3 0 0 0-6.1 1.2L1 12.8a4.3 4.3 0 0 0 1.2 6.1 4.3 4.3 0 0 0 6.1-1.2" />
                        <path d="m15.6 8.4 1-1" />
                        <path d="M12 12 8.4 15.6" />
                        <path d="m18 3-1.4 1.4" />
                        <path d="m20 7.5-.7.7" />
                        <path d="m21 3-5.6 5.6" />
                    </svg>
                </NavIcon>

                {/* Learning Tracks */}
                <NavIcon href="/tracks" title="Learning Tracks" isActive={currentUrl.startsWith('/tracks')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                </NavIcon>

                {/* Stats */}
                <NavIcon href="/stats" title="Stats" isActive={currentUrl.startsWith('/stats')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                </NavIcon>

                {/* Player avatar */}
                <div className="mt-auto">
                    <Link
                        href="/players"
                        title={activePlayer ? activePlayer.name : 'Select Player'}
                        className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
                    >
                        {activePlayer ? (
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                style={{ backgroundColor: activePlayer.color }}
                            >
                                {activePlayer.name.charAt(0).toUpperCase()}
                            </div>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        )}
                    </Link>
                </div>
            </nav>

            {/* Page content */}
            <div className="flex-1 flex flex-col min-w-0">
                {children}
            </div>
        </div>
    );
}
