import { create } from 'zustand';

export interface Toast {
    id: string;
    type: 'achievement' | 'fastest' | 'milestone' | 'error';
    title: string;
    message: string;
    tier?: string;
    isFinalTier?: boolean;
    dismissAfterMs: number;
}

interface ToastStore {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
    clearAll: () => void;
}

let nextId = 0;

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],

    addToast: (toast) => {
        const id = `toast-${++nextId}`;
        set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    },

    removeToast: (id) => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    },

    clearAll: () => set({ toasts: [] }),
}));
