import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { useToastStore } from '@/stores/toastStore';
import type { Toast } from '@/stores/toastStore';

interface FlashAchievement {
    key: string;
    category: string;
    title: string;
    message: string;
    tier?: string;
    isFinalTier?: boolean;
}

interface FlashProps {
    flash?: {
        achievements?: FlashAchievement[];
    };
    [key: string]: unknown;
}

export function useFlashAchievements(): void {
    const achievements = usePage<FlashProps>().props.flash?.achievements;
    const processedRef = useRef<string | null>(null);

    useEffect(() => {
        if (!achievements || achievements.length === 0) return;

        // Deduplicate by serializing keys
        const fingerprint = achievements.map(a => a.key).join(',');
        if (processedRef.current === fingerprint) return;
        processedRef.current = fingerprint;

        const addToast = useToastStore.getState().addToast;

        for (const a of achievements) {
            let type: Toast['type'] = 'achievement';
            if (a.category === 'fastest') type = 'fastest';
            if (a.category === 'milestone') type = 'milestone';

            addToast({
                type,
                title: a.title,
                message: a.message,
                tier: a.tier,
                isFinalTier: a.isFinalTier,
                dismissAfterMs: a.isFinalTier ? 10000 : 5000,
            });
        }
    }, [achievements]);
}
