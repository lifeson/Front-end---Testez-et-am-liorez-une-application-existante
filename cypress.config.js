const { defineConfig } = require('cypress');
const addMonocartCoverage = require('cypress-monocart-coverage');

module.exports = defineConfig({
  env: {
    apiUrl: '/api',
  },
  e2e: {
    baseUrl: 'http://localhost:4200',
    video: false,
    setupNodeEvents(on, config) {
      addMonocartCoverage(on, config, {
        name: 'Couverture E2E — etudiant-frontend',
        outputDir: 'coverage-e2e',
        reports: ['console-summary', 'v8', 'lcovonly'],

        // 1) NE GARDE QUE les bundles JS servis par le dev-server Angular
        entryFilter: (entry) => {
          const url = entry.url || '';
          if (!url.startsWith('http://localhost:4200/')) return false; // fonts, CDN…
          if (url.includes('/__/') || url.includes('/__cypress')) return false; // UI Cypress
          return /\.js(\?|$)/.test(url); // uniquement du JS
        },

        // 2) après résolution des source maps, NE GARDE QUE le code applicatif .ts
        sourceFilter: (sourcePath) =>
          /src[\\/]app[\\/].*\.ts$/.test(sourcePath) &&
          !sourcePath.includes('.spec.') &&
          !sourcePath.includes('-mock.service'),

        onEnd: (results) => {
          const lines = results && results.summary && results.summary.lines;
          const pct = (lines && lines.pct) || 0;
          console.log(`\n➡️  Couverture E2E (lignes) : ${pct}%`);
          if (pct < 80) {
            throw new Error(`Couverture E2E ${pct}% < 80 % requis`);
          }
        },
      });
      return config;
    },
  },
});