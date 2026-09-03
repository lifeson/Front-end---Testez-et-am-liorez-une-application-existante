describe('TF-01 — Inscription', () => {
  it("redirige vers /login après une inscription réussie", () => {
    cy.intercept('POST', '**/api/register', { statusCode: 200, body: {} }).as('register');

    cy.visit('/register');
    cy.get('[data-cy="firstName"]').type('Grace');
    cy.get('[data-cy="lastName"]').type('Hopper');
    cy.get('[data-cy="login"]').type(`grace_${Date.now()}`);
    cy.get('[data-cy="password"]').type('secret123');
    cy.get('[data-cy="submit"]').click();

    cy.wait('@register');
    cy.location('pathname').should('eq', '/login');
  });

  it("ne soumet pas un formulaire incomplet", () => {
    cy.intercept('POST', '**/api/register', { statusCode: 200, body: {} }).as('register');

    cy.visit('/register');
    cy.get('[data-cy="submit"]').click();

    cy.location('pathname').should('eq', '/register');
    cy.get('@register.all').should('have.length', 0);
  });
});