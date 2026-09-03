// cypress/support/commands.js

// Visite une URL protégée en pré-injectant un token (contourne authGuard).
Cypress.Commands.add('visitAuthed', (url) => {
  cy.visit(url, {
    onBeforeLoad: (win) => win.localStorage.setItem('token', 'fake-jwt-token'),
  });
});