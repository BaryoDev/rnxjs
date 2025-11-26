import * as esbuild from 'esbuild';

async function build() {
    // ESM Bundle (for modern bundlers)
    await esbuild.build({
        entryPoints: ['index.js'],
        outfile: 'dist/rnx.esm.js',
        bundle: true,
        format: 'esm',
        minify: true,
        sourcemap: true,
    });

    // Global Bundle (for <script> tag usage)
    await esbuild.build({
        entryPoints: ['index.js'],
        outfile: 'dist/rnx.global.js',
        bundle: true,
        format: 'iife',
        globalName: 'rnx', // Users can access exports via window.rnx
        minify: true,
        sourcemap: true,
    });

    console.log('Build complete: dist/rnx.esm.js, dist/rnx.global.js');
}

build().catch(() => process.exit(1));
