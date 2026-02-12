import type { ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ToastContainer from '@/components/ToastContainer';
import { useFlashAchievements } from '@/hooks/useFlashAchievements';

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

    useFlashAchievements();

    return (
        <div className="flex min-h-screen bg-content text-gray-100">
            <ToastContainer />
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

                {/* Stats & Awards */}
                <NavIcon href="/stats" title="Stats & Awards" isActive={currentUrl.startsWith('/stats')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                        <path d="M4 22h16" />
                        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                    </svg>
                </NavIcon>

                {/* Settings + Player avatar */}
                <div className="mt-auto flex flex-col items-center gap-2">
                    <NavIcon href="/settings" title="Settings" isActive={currentUrl.startsWith('/settings')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                    </NavIcon>
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
