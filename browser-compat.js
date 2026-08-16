/**
 * browser-compat.js — YouTube Pro +
 *
 * Bidirectional shim so both `chrome.*` and `browser.*` always resolve:
 *  - Firefox exposes `browser` (and sometimes `chrome`) → ensure `chrome` exists.
 *  - Chrome/Edge expose only `chrome` → ensure `browser` exists.
 * This lets every script use either namespace without branching.
 * Also provides dev/preview mock fallbacks so the UI is fully functional in web preview.
 */
(function () {
    const root = typeof globalThis !== 'undefined' ? globalThis
                : typeof window     !== 'undefined' ? window
                : this;

    // Firefox without chrome alias → point chrome at browser
    if (typeof root.chrome === 'undefined' && typeof root.browser !== 'undefined') {
        root.chrome = root.browser;
    }

    // Chrome/Edge without browser alias → point browser at chrome
    if (typeof root.browser === 'undefined' && typeof root.chrome !== 'undefined') {
        root.browser = root.chrome;
    }

    // Dev/Preview environment fallback when opened outside an extension runtime
    if (!root.chrome || !root.chrome.storage || !root.chrome.storage.local) {
        const mockStore = {
            hasSeenWelcome: true,
            masterEnabled: true,
            theme: true,
            premium: true,
            ambient: false,
            cinematic: false,
            speed: true,
            audio: true,
            autoscroll: true,
            download: false,
            builtinDownloader: true,
            fullscreen: false,
            autoResume: true,
            screenshot: true,
            watchparty: true,
            miniplayer: true,
            returnDislike: true,
            sponsorblock: true,
            cinematicSettings: { blur: 'med', sat: 'med', dim: 'med' },
            sponsorblockCategories: {
                sponsor: true,
                selfpromo: true,
                interaction: true,
                intro: true,
                outro: true,
                preview: true,
                filler: false,
                music_offtopic: false
            },
            ytProVideos: [
                {
                    title: "Lofi Hip Hop Radio — Beats to Relax / Study to",
                    channel: "Lofi Girl",
                    videolink: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
                    time: 3420,
                    duration: 7200,
                    watchCount: 14,
                    complete: false,
                    timestamp: Date.now() - 1000 * 60 * 25
                },
                {
                    title: "Building a Production-Grade Design System & Glassmorphism UI",
                    channel: "Figma Design",
                    videolink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    time: 1420,
                    duration: 1420,
                    watchCount: 8,
                    complete: true,
                    timestamp: Date.now() - 1000 * 60 * 60 * 3
                },
                {
                    title: "The Universe in 4K: James Webb Deep Field Discoveries",
                    channel: "NASA Space",
                    videolink: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
                    time: 890,
                    duration: 1250,
                    watchCount: 5,
                    complete: false,
                    timestamp: Date.now() - 1000 * 60 * 60 * 26
                },
                {
                    title: "Synthwave / Cyberpunk Mix 2026 — Chill Retro Future Vibes",
                    channel: "Astral Throb",
                    videolink: "https://www.youtube.com/watch?v=36YnV9STBqc",
                    time: 2100,
                    duration: 2100,
                    watchCount: 19,
                    complete: true,
                    timestamp: Date.now() - 1000 * 60 * 60 * 50
                },
                {
                    title: "How Modern GPU Rendering Engines Work Under the Hood",
                    channel: "Computerphile",
                    videolink: "https://www.youtube.com/watch?v=9bZkp7q19f0",
                    time: 540,
                    duration: 980,
                    watchCount: 3,
                    complete: false,
                    timestamp: Date.now() - 1000 * 60 * 60 * 120
                }
            ]
        };

        try {
            const saved = window.localStorage ? window.localStorage.getItem('__ytpro_mock_store__') : null;
            if (saved) {
                const parsed = JSON.parse(saved);
                Object.assign(mockStore, parsed);
            }
        } catch (e) {}

        const persist = () => {
            try {
                if (window.localStorage) {
                    window.localStorage.setItem('__ytpro_mock_store__', JSON.stringify(mockStore));
                }
            } catch (e) {}
        };

        const mockStorage = {
            get: (keys, cb) => {
                let res = {};
                if (Array.isArray(keys)) {
                    keys.forEach(k => { if (k in mockStore) res[k] = mockStore[k]; });
                } else if (typeof keys === 'string') {
                    if (keys in mockStore) res[keys] = mockStore[keys];
                } else if (typeof keys === 'object' && keys !== null) {
                    res = { ...keys };
                    Object.keys(keys).forEach(k => { if (k in mockStore) res[k] = mockStore[k]; });
                } else {
                    res = { ...mockStore };
                }
                if (typeof cb === 'function') cb(res);
                return Promise.resolve(res);
            },
            set: (obj, cb) => {
                Object.assign(mockStore, obj);
                persist();
                if (typeof cb === 'function') cb();
                return Promise.resolve();
            }
        };

        root.chrome = root.chrome || {};
        root.chrome.storage = { local: mockStorage, sync: mockStorage };
        root.chrome.runtime = root.chrome.runtime || {
            getManifest: () => ({ version: "6.0", name: "YouTube Pro Plus" }),
            getURL: (path) => path,
            sendMessage: (msg, cb) => { if (cb) cb(); return Promise.resolve(); },
            onMessage: { addListener: () => {} }
        };
        root.chrome.tabs = root.chrome.tabs || {
            query: (opts, cb) => {
                const tabs = [{ id: 1, url: "https://www.youtube.com/watch?v=demo" }];
                if (cb) cb(tabs);
                return Promise.resolve(tabs);
            },
            sendMessage: (tabId, msg, cb) => { if (cb) cb(); return Promise.resolve(); },
            create: (opts, cb) => {
                window.open(opts.url, '_blank');
                if (cb) cb();
                return Promise.resolve();
            }
        };
        root.chrome.windows = root.chrome.windows || {
            create: (opts, cb) => {
                window.open(opts.url, '_blank', 'width=600,height=700');
                if (cb) cb();
                return Promise.resolve();
            }
        };
    }
})();
