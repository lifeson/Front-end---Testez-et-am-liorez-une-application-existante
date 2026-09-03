const { defineConfig } = require('cypress');
const addMonocartCoverage = require('cypress-monocart-coverage');

module.exports = defineConfig({
  env: {
    apiUrl: '/api',
  },
  e2e: {
    baseUrl: 'http://localhost:4200',
    setupNodeEvents(on, config) {
      // Couverture E2E via V8 (aucune instrumentation du build)
      addMonocartCoverage(on, config, {
        name: 'Couverture E2E — etudiant-frontend',
        outputDir: 'coverage-e2e',
        reports: ['console-details', 'v8', 'html', 'lcovonly'],
        sourceFilter: (sourcePath) =>
          sourcePath.includes('src/app/') &&
          !sourcePath.includes('.spec.') &&
          !sourcePath.includes('-mock.service'),
        onEnd: (results) => {
          const pct = results?.summary?.lines?.pct ?? 0;
          console.log(`\nCouverture E2E (lignes) : ${pct}%`);
          if (pct < 80) {
            throw new Error(`Couverture E2E ${pct}% < 80 % requis`);
          }
        },
      });
      return config;
    },
  },
});