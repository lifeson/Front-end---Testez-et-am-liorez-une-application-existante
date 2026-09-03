describe('TF-05 — Consultation du détail', () => {
  it("affiche les informations de l'étudiant", () => {
    cy.intercept('GET', '**/api/students/1', {
      body: {
        id: 1, firstName: 'Ada', lastName: 'Lovelace', email: 'ada.lovelace@mail.com',
        dateOfBirth: '1815-12-10', phoneNumber: '0102030405',
        createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00',
      },
    }).as('getStudent');

    cy.visitAuthed('/students/1');
    cy.wait('@getStudent');

    cy.get('[data-cy="detail"]').within(() => {
      cy.contains('Ada');
      cy.contains('Lovelace');
      cy.contains('ada.lovelace@mail.com');
      cy.contains('1815-12-10');
      cy.contains('0102030405');
    });
  });

  it("affiche une erreur si l'étudiant est introuvable", () => {
    cy.intercept('GET', '**/api/students/999', { statusCode: 404, body: {} }).as('getKO');

    cy.visitAuthed('/students/999');
    cy.wait('@getKO');
    cy.get('[data-cy="error"]').should('contain', 'introuvable');
  });
});