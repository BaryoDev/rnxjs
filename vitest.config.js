import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'happy-dom',
        globals: true,
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
