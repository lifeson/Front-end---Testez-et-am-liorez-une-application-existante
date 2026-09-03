describe("TF-04 — Création d'un étudiant", () => {
it('crée un étudiant et le retrouve dans la liste', () => {
  const created = {
    id: 3, firstName: 'Katherine', lastName: 'Johnson',
    email: 'katherine.johnson@mail.com', dateOfBirth: '1918-08-26',
    phoneNumber: '0708091011',
    createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00',
  };
  cy.intercept('POST', '**/api/students', { statusCode: 201, body: created }).as('createStudent');
  cy.intercept('GET', '**/api/students', { body: [created] }).as('getStudents');

  cy.visitAuthed('/students/new');
  cy.get('[data-cy="title"]').should('contain', 'Ajouter un étudiant');

  cy.get('[data-cy="firstName"]').type('Katherine');
  cy.get('[data-cy="lastName"]').type('Johnson');
  cy.get('[data-cy="email"]').type('katherine.johnson@mail.com');
  cy.get('[data-cy="dateOfBirth"]').type('1918-08-26');
  cy.get('[data-cy="phoneNumber"]').type('0708091011');
  cy.get('[data-cy="submit"]').click();

  cy.wait('@createStudent');
  cy.location('pathname').should('eq', '/students');
  cy.contains('[data-cy="student-row"]', 'Katherine').should('exist');
});

  it('affiche une erreur si la création échoue', () => {
    cy.intercept('GET', '**/api/students', { body: [] });
    cy.intercept('POST', '**/api/students', {
      statusCode: 400,
      body: { message: 'Email déjà utilisé' },
    }).as('createKO');

    cy.visitAuthed('/students/new');
    cy.get('[data-cy="firstName"]').type('Katherine');
    cy.get('[data-cy="lastName"]').type('Johnson');
    cy.get('[data-cy="email"]').type('katherine.johnson@mail.com');
    cy.get('[data-cy="submit"]').click();

    cy.wait('@createKO');
    cy.get('[data-cy="error"]').should('contain', 'Email déjà utilisé');
    cy.location('pathname').should('eq', '/students/new');
  });

  it('réinitialise le formulaire via Annuler (onReset)', () => {
    cy.visitAuthed('/students/new');
    cy.get('[data-cy="firstName"]').type('Katherine');
    cy.get('[data-cy="reset"]').click();
    cy.get('[data-cy="firstName"]').should('have.value', '');
  });
});