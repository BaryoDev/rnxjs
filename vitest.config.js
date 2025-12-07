import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'happy-dom',
        globals: true,
        exclude: ['**/node_modules/**', '**/dist/**', '**/cypress/**', '**/.{idea,git,cache,output,temp}/**', '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*', 'tests/e2e/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            exclude: [
                'dist/**',
                'examples/**',
                'create-rnxjs-app/**',
                'node_modules/**',
                'tests/**',
                'build.js'
            ],
            include: [
                'utils/**/*.js',
                'framework/**/*.js',
                'components/**/**.js'
            ]
        }
    }
});
