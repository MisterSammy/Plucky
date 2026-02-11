import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import ErrorBoundary from '@/components/ErrorBoundary'
import { usePitchStore } from '@/stores/pitchStore'
import { disposeSynths } from '@/lib/audio'
import { initPreferenceBridge } from '@/stores/preferenceBridge'
import './index.css'

// Initialize preference persistence (subscribes to both stores, handles debounced save)
initPreferenceBridge();

// Clean up audio resources on window unload
window.addEventListener('beforeunload', () => {
    usePitchStore.getState().stopListening();
    disposeSynths();
});

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx', { eager: true }) as Record<string, { default: React.ComponentType }>
        const page = pages[`./pages/${name}.tsx`]
        if (!page) throw new Error(`Page not found: ${name}`)
        return page
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <ErrorBoundary>
                <App {...props} />
            </ErrorBoundary>
        )
    },
})
