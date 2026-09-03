describe("TF-06 — Modification d'un étudiant", () => {
  it('modifie un étudiant et voit la nouvelle valeur dans la liste', () => {
    const original = {
      id: 1, firstName: 'Ada', lastName: 'Lovelace', email: 'ada.lovelace@mail.com',
      dateOfBirth: '1815-12-10', phoneNumber: '0102030405',
      createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00',
    };
    const updated = { ...original, firstName: 'Augusta Ada' };

    cy.intercept('GET', '**/api/students/1', { body: original }).as('getStudent');
    cy.intercept('PUT', '**/api/students/1', { body: updated }).as('updateStudent');
    cy.intercept('GET', '**/api/students', { body: [updated] }).as('getStudents');

    cy.visitAuthed('/students/1/edit');
    cy.wait('@getStudent');
    cy.get('[data-cy="title"]').should('contain', 'Modifier un étudiant');
    cy.get('[data-cy="firstName"]').should('have.value', 'Ada');

    cy.get('[data-cy="firstName"]').clear().type('Augusta Ada');
    cy.get('[data-cy="submit"]').click();

    cy.wait('@updateStudent');
    cy.location('pathname').should('eq', '/students');
    cy.contains('[data-cy="student-row"]', 'Augusta Ada').should('exist');
  });
});