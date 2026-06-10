import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/server.ts'],
    clean: true,
    format: ['esm'],
    outDir: 'dist',
    sourcemap: true,
    target: 'node20',
})
