const config = {
    bootstrap: typeof window !== 'undefined' ? window.bootstrap : undefined
};

export function setBootstrap(bs) {
    config.bootstrap = bs;
}

export function getBootstrap() {
    if (config.bootstrap) {
        return config.bootstrap;
    }
    if (typeof window !== 'undefined' && window.bootstrap) {
        return window.bootstrap;
    }
    return undefined;
}
