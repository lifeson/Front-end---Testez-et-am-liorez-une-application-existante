module.exports = {
  preset: 'jest-preset-angular',
  roots: ['<rootDir>/src/'],
  testMatch: ['**/+(*.)+(spec).+(ts|js)'],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  collectCoverage: true,
  // Mesure TOUT le code applicatif, même les fichiers sans test (sinon Sonar
  // ne voit pas les fichiers non importés par un spec).
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.spec.ts',
  ],
  coverageDirectory: 'coverage',
  // html        -> coverage/index.html (lecture humaine)
  // lcov        -> coverage/lcov.info (VS Code + SonarCloud) + coverage/lcov-report/
  // text-summary-> résumé en console à chaque run
  coverageReporters: ['html', 'lcov', 'text-summary'],
  // Gate automatique : `npm test` / `jest` sort en erreur si un seuil < 80 %.
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};