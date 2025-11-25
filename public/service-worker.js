// Empty service worker to prevent 404 errors from browser extensions
// This file intentionally does nothing
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
