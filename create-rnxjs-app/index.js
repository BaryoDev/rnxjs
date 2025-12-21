#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import prompts from 'prompts';
import { red, green, bold, cyan } from 'kolorist';

const TEMPLATES = [
    { name: 'blank', title: 'Blank (Recommended)', description: 'Minimal starter with imports' },
    { name: 'dashboard', title: 'Dashboard', description: 'Admin dashboard with all Phase 1 components' },
    { name: 'landing', title: 'Landing Page', description: 'Marketing landing page template' },
    { name: 'form', title: 'Multi-Step Form', description: 'Form wizard with validation' }
];

const CSS_FRAMEWORKS = [
    { name: 'bootstrap', title: 'Bootstrap 5 (Recommended)', description: 'Full Bootstrap framework' },
    { name: 'tailwind', title: 'Tailwind CSS', description: 'Utility-first CSS framework' },
    { name: 'none', title: 'None', description: 'No CSS framework' }
];

const BACKENDS = [
    { name: 'none', title: 'None (Frontend Only)', description: 'Frontend-only project' },
    { name: 'django', title: 'Django', description: 'Python Django backend' },
    { name: 'rails', title: 'Rails', description: 'Ruby on Rails backend' },
    { name: 'laravel', title: 'Laravel', description: 'PHP Laravel backend' }
];

async function init() {
    console.log(bold(green('\n🚀 Welcome to create-rnxjs-app!\n')));

    let projectName = process.argv[2];

    // Prompt for project name if not provided
    if (!projectName) {
        const response = await prompts([
            {
                type: 'text',
                name: 'projectName',
                message: 'Project name:',
                initial: 'my-rnx-app',
                validate: (val) => /^[a-zA-Z0-9_-]+$/.test(val) || 'Invalid project name'
            }
        ]);
        projectName = response.projectName;
    }

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

    // Prompt for template selection
    const templateResponse = await prompts([
        {
            type: 'select',
            name: 'template',
            message: 'Select a template:',
            choices: TEMPLATES.map(t => ({
                title: `${t.title} - ${t.description}`,
                value: t.name
            })),
            initial: 0
        }
    ]);

    const template = templateResponse.template;

    // Prompt for CSS framework
    const cssResponse = await prompts([
        {
            type: 'select',
            name: 'css',
            message: 'Select CSS framework:',
            choices: CSS_FRAMEWORKS.map(f => ({
                title: `${f.title} - ${f.description}`,
                value: f.name
            })),
            initial: 0
        }
    ]);

    const cssFramework = cssResponse.css;

    // Prompt for backend integration
    const backendResponse = await prompts([
        {
            type: 'select',
            name: 'backend',
            message: 'Backend integration:',
            choices: BACKENDS.map(b => ({
                title: `${b.title} - ${b.description}`,
                value: b.name
            })),
            initial: 0
        }
    ]);

    const backend = backendResponse.backend;

    // Prompt for git initialization
    const gitResponse = await prompts([
        {
            type: 'confirm',
            name: 'git',
            message: 'Initialize git repository?',
            initial: true
        }
    ]);

    const initGit = gitResponse.git;

    console.log(`\n${cyan('📦')} Creating project in ${bold(targetDir)}...`);

    const baseTemplateDir = path.resolve(
        fileURLToPath(import.meta.url),
        `../templates/${template}`
    );

    if (!fs.existsSync(baseTemplateDir)) {
        console.log(red(`✖ Template "${template}" not found`));
        return;
    }

    // Copy template
    copy(baseTemplateDir, targetDir);

    // Rename _gitignore to .gitignore
    const gitignorePath = path.join(targetDir, '_gitignore');
    if (fs.existsSync(gitignorePath)) {
        fs.renameSync(gitignorePath, path.join(targetDir, '.gitignore'));
    }

    // Update package.json
    const pkgPath = path.join(targetDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    pkg.name = projectName;

    // Add CSS framework to dependencies
    if (cssFramework === 'tailwind') {
        pkg.devDependencies = pkg.devDependencies || {};
        pkg.devDependencies['tailwindcss'] = '^3.3.0';
        pkg.devDependencies['postcss'] = '^8.4.0';
        pkg.devDependencies['autoprefixer'] = '^10.4.0';
    } else if (cssFramework === 'bootstrap') {
        pkg.dependencies = pkg.dependencies || {};
        pkg.dependencies['bootstrap'] = '^5.3.0';
    }

    // Add backend comments/examples
    if (backend !== 'none') {
        pkg.scripts = pkg.scripts || {};
        pkg.scripts['build:backend-help'] = `echo "See backend integration docs for ${backend}"`;
    }

    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

    // Initialize git if requested
    if (initGit) {
        try {
            const { execSync } = await import('child_process');
            process.chdir(targetDir);
            execSync('git init', { stdio: 'pipe' });
            execSync('git add .', { stdio: 'pipe' });
            execSync('git commit -m "Initial commit from create-rnxjs-app"', { stdio: 'pipe' });
            process.chdir(cwd);
            console.log(`${cyan('✓')} Git repository initialized`);
        } catch (error) {
            console.log(`${cyan('⚠')} Git initialization skipped`);
        }
    }

    console.log(bold(green('\n✓ Done! Next steps:\n')));
    console.log(`  cd ${projectName}`);
    console.log(`  npm install`);
    console.log(`  npm run dev`);
    console.log();
    console.log(`${cyan('📚')} Template: ${template}`);
    console.log(`${cyan('🎨')} CSS Framework: ${cssFramework}`);
    if (backend !== 'none') {
        console.log(`${cyan('⚙️')}  Backend: ${backend}`);
    }
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
    console.error(red('Error:'), e.message);
    process.exit(1);
});
