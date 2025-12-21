import {
    Container,
    Row,
    Column,
    Card,
    Button,
    TopAppBar,
    Tabs,
    Tab
} from '@arnelirobles/rnxjs';

// Navigation
const nav = TopAppBar({
    title: 'rnxJS',
    subtitle: 'Build fast, modern web apps',
    icon: 'bi-lightning'
});

// Hero section
const hero = Container({
    className: 'hero-section py-5 text-center',
    children: [
        Row({
            children: [
                Column({
                    children: [
                        (() => {
                            const div = document.createElement('div');
                            div.className = 'hero-content';
                            div.innerHTML = `
                                <h1 class="display-4 fw-bold mb-4">Build Web Apps in Minutes</h1>
                                <p class="lead mb-4 text-muted">
                                    rnxJS is a lightweight framework for building modern, reactive web applications
                                    with minimal dependencies and maximum productivity.
                                </p>
                                <div class="hero-buttons mb-4">
                                    <button class="btn btn-primary btn-lg me-3">Get Started</button>
                                    <button class="btn btn-outline-primary btn-lg">Learn More</button>
                                </div>
                            `;
                            return div;
                        })()
                    ]
                })
            ]
        })
    ]
});

// Features section
const features = Container({
    className: 'features-section py-5',
    children: [
        Row({
            children: [
                Column({
                    md: 4,
                    className: 'mb-4',
                    children: [
                        Card({
                            className: 'feature-card h-100',
                            children: [
                                (() => {
                                    const div = document.createElement('div');
                                    div.className = 'feature-icon mb-3';
                                    div.innerHTML = '<i class="bi bi-lightning-fill"></i>';
                                    return div;
                                })(),
                                (() => {
                                    const div = document.createElement('div');
                                    div.innerHTML = `
                                        <h5 class="card-title">Lightning Fast</h5>
                                        <p class="card-text">Minimal overhead with optimized rendering and reactive state management.</p>
                                    `;
                                    return div;
                                })()
                            ]
                        })
                    ]
                }),
                Column({
                    md: 4,
                    className: 'mb-4',
                    children: [
                        Card({
                            className: 'feature-card h-100',
                            children: [
                                (() => {
                                    const div = document.createElement('div');
                                    div.className = 'feature-icon mb-3';
                                    div.innerHTML = '<i class="bi bi-gear-fill"></i>';
                                    return div;
                                })(),
                                (() => {
                                    const div = document.createElement('div');
                                    div.innerHTML = `
                                        <h5 class="card-title">Component Library</h5>
                                        <p class="card-text">Rich set of pre-built components for common UI patterns and layouts.</p>
                                    `;
                                    return div;
                                })()
                            ]
                        })
                    ]
                }),
                Column({
                    md: 4,
                    className: 'mb-4',
                    children: [
                        Card({
                            className: 'feature-card h-100',
                            children: [
                                (() => {
                                    const div = document.createElement('div');
                                    div.className = 'feature-icon mb-3';
                                    div.innerHTML = '<i class="bi bi-shield-lock-fill"></i>';
                                    return div;
                                })(),
                                (() => {
                                    const div = document.createElement('div');
                                    div.innerHTML = `
                                        <h5 class="card-title">Secure by Default</h5>
                                        <p class="card-text">Built-in protection against XSS and other common web vulnerabilities.</p>
                                    `;
                                    return div;
                                })()
                            ]
                        })
                    ]
                })
            ]
        })
    ]
});

// CTA Section
const cta = Container({
    className: 'cta-section py-5 bg-light rounded-lg',
    children: [
        Row({
            children: [
                Column({
                    className: 'text-center',
                    children: [
                        (() => {
                            const div = document.createElement('div');
                            div.innerHTML = `
                                <h2 class="mb-4">Ready to build something amazing?</h2>
                                <p class="lead mb-4">Start building with rnxJS today</p>
                            `;
                            return div;
                        })(),
                        (() => {
                            const btn = Button({
                                label: 'Get Started Free',
                                variant: 'primary',
                                size: 'lg',
                                onclick: () => {
                                    alert('Follow the getting started guide in the documentation!');
                                }
                            });
                            return btn;
                        })()
                    ]
                })
            ]
        })
    ]
});

// Footer
const footer = (() => {
    const div = document.createElement('div');
    div.className = 'footer bg-dark text-white py-5 mt-5';
    div.innerHTML = `
        <div class="container">
            <div class="row">
                <div class="col-md-4 mb-4">
                    <h5>rnxJS</h5>
                    <p class="text-muted">A lightweight, modern JavaScript framework</p>
                </div>
                <div class="col-md-4 mb-4">
                    <h5>Links</h5>
                    <ul class="list-unstyled">
                        <li><a href="#" class="text-muted text-decoration-none">Documentation</a></li>
                        <li><a href="#" class="text-muted text-decoration-none">GitHub</a></li>
                        <li><a href="#" class="text-muted text-decoration-none">Components</a></li>
                    </ul>
                </div>
                <div class="col-md-4 mb-4">
                    <h5>Follow</h5>
                    <ul class="list-unstyled">
                        <li><a href="#" class="text-muted text-decoration-none">Twitter</a></li>
                        <li><a href="#" class="text-muted text-decoration-none">Discord</a></li>
                        <li><a href="#" class="text-muted text-decoration-none">Email</a></li>
                    </ul>
                </div>
            </div>
            <hr class="bg-secondary">
            <div class="text-center text-muted">
                <p>&copy; 2024 rnxJS. All rights reserved.</p>
            </div>
        </div>
    `;
    return div;
})();

// Main app
const app = document.getElementById('app');
app.appendChild(nav);
app.appendChild(hero);
app.appendChild(features);
app.appendChild(cta);
app.appendChild(footer);

console.log('🚀 Landing page loaded!');
