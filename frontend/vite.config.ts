import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const publicDir = path.resolve(__dirname, '../public')

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        outDir: path.resolve(publicDir, 'build'),
        emptyOutDir: true,
        manifest: 'manifest.json',
        rollupOptions: {
            input: path.resolve(__dirname, 'src/main.tsx'),
        },
    },
    server: {
        origin: 'http://localhost:5173',
    },
})
