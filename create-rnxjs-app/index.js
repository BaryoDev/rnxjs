#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import prompts from 'prompts';
import { red, green, bold } from 'kolorist';

async function init() {
    console.log(bold(green('\n🚀 Welcome to create-rnxjs-app!\n')));

    const response = await prompts([
        {
            type: 'text',
            name: 'projectName',
            message: 'Project name:',
            initial: 'my-rnx-app'
        }
    ]);

    const { projectName } = response;

    if (!projectName) {
        console.log(red('✖ Operation cancelled'));
        return;
    }

    const cwd = process.cwd();
    const targetDir = path.join(cwd, projectName);

    if (fs.existsSync(targetDir)) {
        console.log(red(`\n✖ Directory "${projectName}" already exists. Please choose a different name or delete the directory.\n`));
        return;
    }

    console.log(`\nScaffolding project in ${targetDir}...`);

    const templateDir = path.resolve(
        fileURLToPath(import.meta.url),
        '../template'
    );

    // Copy template
    copy(templateDir, targetDir);

    // Rename _gitignore to .gitignore (npm publish renames .gitignore to .npmignore otherwise)
    const gitignorePath = path.join(targetDir, '_gitignore');
    if (fs.existsSync(gitignorePath)) {
        fs.renameSync(gitignorePath, path.join(targetDir, '.gitignore'));
    }

    // Update package.json
    const pkgPath = path.join(targetDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    pkg.name = projectName;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

    console.log(bold(green('\nDone! Now run:\n')));
    console.log(`  cd ${projectName}`);
    console.log(`  npm install`);
    console.log(`  npm run dev`);
    console.log();
}

function copy(src, dest) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        copyDir(src, dest);
    } else {
        fs.copyFileSync(src, dest);
    }
}

function copyDir(srcDir, destDir) {
    fs.mkdirSync(destDir, { recursive: true });
    for (const file of fs.readdirSync(srcDir)) {
        const srcFile = path.resolve(srcDir, file);
        const destFile = path.resolve(destDir, file);
        copy(srcFile, destFile);
    }
}

init().catch((e) => {
    console.error(e);
});
