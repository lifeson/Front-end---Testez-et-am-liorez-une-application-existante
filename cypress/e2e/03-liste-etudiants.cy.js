describe("TF-07 — Suppression d'un étudiant", () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/students', { fixture: 'students.json' }).as('getStudents');
  });

  it("retire l'étudiant du tableau après confirmation", () => {
    cy.intercept('DELETE', '**/api/students/1', { statusCode: 204 }).as('deleteStudent');

    cy.visitAuthed('/students');
    cy.wait('@getStudents');
    cy.get('[data-cy="student-row"]').should('have.length', 2);

    cy.on('window:confirm', () => true);
    cy.contains('[data-cy="student-row"]', 'Ada').find('[data-cy="delete"]').click();

    cy.wait('@deleteStudent');
    cy.get('[data-cy="student-row"]').should('have.length', 1);
    cy.contains('Ada').should('not.exist');
  });

  it("ne supprime rien si la confirmation est refusée", () => {
    cy.intercept('DELETE', '**/api/students/*', { statusCode: 204 }).as('deleteStudent');

    cy.visitAuthed('/students');
    cy.wait('@getStudents');
    cy.on('window:confirm', () => false);
    cy.contains('[data-cy="student-row"]', 'Ada').find('[data-cy="delete"]').click();

    cy.get('[data-cy="student-row"]').should('have.length', 2);
    cy.get('@deleteStudent.all').should('have.length', 0);
  });

  it("affiche une erreur si la suppression échoue", () => {
    cy.intercept('DELETE', '**/api/students/1', {
      statusCode: 500,
      body: { message: 'Suppression impossible' },
    }).as('deleteKO');

    cy.visitAuthed('/students');
    cy.wait('@getStudents');
    cy.on('window:confirm', () => true);
    cy.contains('[data-cy="student-row"]', 'Ada').find('[data-cy="delete"]').click();

    cy.wait('@deleteKO');
    cy.get('[data-cy="error"]').should('contain', 'Suppression impossible');
    cy.get('[data-cy="student-row"]').should('have.length', 2);
  });
});

describe('Liste — états particuliers', () => {
  it('affiche le message quand aucun étudiant', () => {
    cy.intercept('GET', '**/api/students', { body: [] }).as('getStudents');
    cy.visitAuthed('/students');
    cy.wait('@getStudents');
    cy.get('[data-cy="empty"]').should('be.visible');
    cy.get('table').should('not.exist');
  });

  it('affiche une erreur si le chargement échoue', () => {
    cy.intercept('GET', '**/api/students', { statusCode: 500, body: {} }).as('getKO');
    cy.visitAuthed('/students');
    cy.wait('@getKO');
    cy.get('[data-cy="error"]').should('contain', 'Impossible de charger');
  });
});