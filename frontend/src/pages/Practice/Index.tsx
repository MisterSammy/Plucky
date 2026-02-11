import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { useScaleStore } from '@/stores/scaleStore';
import { usePracticeStore } from '@/stores/practiceStore';
import AppLayout from '@/layouts/AppLayout';
import Sidebar from '@/components/Sidebar';
import ContentTitleBar from '@/components/ContentTitleBar';
import ControlsToolbar from '@/components/ControlsToolbar';
import GuitarView from '@/components/GuitarView';
import PianoView from '@/components/PianoView';
import WelcomeScreen from '@/components/WelcomeScreen';
import type { NoteName } from '@/types';

interface Preselect {
    scaleId: string | null;
    root: string | null;
    trackScaleId: string | null;
}

interface Props {
    preselect: Preselect;
    [key: string]: unknown;
}

function useThemeEffect() {
    const { theme } = useScaleStore();

    useEffect(() => {
        const apply = (resolved: 'light' | 'dark') => {
            document.documentElement.classList.toggle('dark', resolved === 'dark');
        };

        if (theme === 'system') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            apply(mq.matches ? 'dark' : 'light');
            const handler = (e: MediaQueryListEvent) => apply(e.matches ? 'dark' : 'light');
            mq.addEventListener('change', handler);
            return () => mq.removeEventListener('change', handler);
        } else {
            apply(theme);
        }
    }, [theme]);
}

function usePreselect(preselect: Preselect) {
    const applied = useRef(false);
    const { setScale, setRoot, setInstrument, instrument } = useScaleStore();

    useEffect(() => {
        if (applied.current) return;
        if (preselect.scaleId) {
            setScale(preselect.scaleId);
            if (preselect.root) setRoot(preselect.root as NoteName);
            if (!instrument) setInstrument('guitar');
            // Set track context for session recording
            usePracticeStore.getState().setTrackScaleId(
                preselect.trackScaleId ? Number(preselect.trackScaleId) : null
            );
            applied.current = true;
        }
    }, [preselect, setScale, setRoot, setInstrument, instrument]);
}

export default function PracticeIndex() {
    useThemeEffect();
    const { preselect } = usePage<Props>().props;
    usePreselect(preselect);

    const { instrument } = useScaleStore();

    if (!instrument) {
        return <WelcomeScreen />;
    }

    return (
        <AppLayout>
            <div className="flex flex-1 min-h-0">
                <Sidebar />
                <main className="flex-1 flex flex-col min-w-0">
                    <ContentTitleBar />
                    <ControlsToolbar />
                    {instrument === 'guitar' ? <GuitarView /> : <PianoView />}
                </main>
            </div>
        </AppLayout>
    );
}
