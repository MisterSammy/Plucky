import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import './index.css'

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx', { eager: true }) as Record<string, { default: React.ComponentType }>
        const page = pages[`./pages/${name}.tsx`]
        if (!page) throw new Error(`Page not found: ${name}`)
        return page
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />)
    },
})
