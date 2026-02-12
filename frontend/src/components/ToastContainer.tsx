import { useEffect, useState } from 'react';
import { useToastStore } from '@/stores/toastStore';
import type { Toast } from '@/stores/toastStore';
import CelebrationOverlay from './CelebrationOverlay';

const TIER_COLORS: Record<string, string> = {
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    gold: '#ffd700',
    diamond: '#b9f2ff',
};

function ToastItem({ toast }: { toast: Toast }) {
    const removeToast = useToastStore(s => s.removeToast);
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        const exitTimer = setTimeout(() => setExiting(true), toast.dismissAfterMs - 300);
        const removeTimer = setTimeout(() => removeToast(toast.id), toast.dismissAfterMs);
        return () => {
            clearTimeout(exitTimer);
            clearTimeout(removeTimer);
        };
    }, [toast.id, toast.dismissAfterMs, removeToast]);

    const tierColor = toast.tier ? TIER_COLORS[toast.tier] : undefined;

    return (
        <div
            className={`toast-item ${exiting ? 'toast-exit' : 'toast-enter'}`}
            style={tierColor ? { borderLeftColor: tierColor } : undefined}
        >
            <div className="flex items-start gap-3">
                {toast.tier && (
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                        style={{ backgroundColor: tierColor, color: toast.tier === 'diamond' ? '#1a1a2e' : '#fff' }}
                    >
                        {toast.tier === 'diamond' ? '\u2666' : toast.tier === 'gold' ? '\u2605' : '\u25CF'}
                    </div>
                )}
                {!toast.tier && (
                    <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm shrink-0">
                        {toast.type === 'fastest' ? '\u26A1' : toast.type === 'milestone' ? '\u2B50' : '\u2714'}
                    </div>
                )}
                <div className="min-w-0">
                    <div className="text-sm font-semibold text-white">{toast.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{toast.message}</div>
                </div>
            </div>
        </div>
    );
}

export default function ToastContainer() {
    const toasts = useToastStore(s => s.toasts);
    const showCelebration = toasts.some(t => t.isFinalTier);

    return (
        <>
            {showCelebration && <CelebrationOverlay />}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} />
                ))}
            </div>
        </>
    );
}
