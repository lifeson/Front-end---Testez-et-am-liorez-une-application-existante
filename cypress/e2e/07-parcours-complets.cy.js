describe('TF-09 — Parcours : inscription → connexion → création', () => {
  it("s'inscrire, se connecter, puis créer un étudiant", () => {
    const created = {
      id: 9, firstName: 'Katherine', lastName: 'Johnson', email: 'kj@mail.com',
      dateOfBirth: '', phoneNumber: '',
      createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00',
    };
    let liste = [];

    cy.intercept('POST', '**/api/register', { statusCode: 200, body: {} }).as('register');
    cy.intercept('POST', '**/api/login', { body: { token: 'fake-jwt-token' } }).as('login');
    cy.intercept('POST', '**/api/students', (req) => {
      liste = [created];
      req.reply({ statusCode: 201, body: created });
    }).as('createStudent');
    cy.intercept('GET', '**/api/students', (req) => req.reply(liste)).as('getStudents');

    // Inscription
    cy.visit('/register');
    cy.get('[data-cy="firstName"]').type('Katherine');
    cy.get('[data-cy="lastName"]').type('Johnson');
    cy.get('[data-cy="login"]').type('kjohnson');
    cy.get('[data-cy="password"]').type('secret123');
    cy.get('[data-cy="submit"]').click();
    cy.location('pathname').should('eq', '/login');

    // Connexion
    cy.get('[data-cy="login"]').type('kjohnson');
    cy.get('[data-cy="password"]').type('secret123');
    cy.get('[data-cy="submit"]').click();
    cy.location('pathname').should('eq', '/students');

    // Création
    cy.get('[data-cy="add-student"]').click();
    cy.location('pathname').should('eq', '/students/new');
    cy.get('[data-cy="firstName"]').type('Katherine');
    cy.get('[data-cy="lastName"]').type('Johnson');
    cy.get('[data-cy="email"]').type('kj@mail.com');
    cy.get('[data-cy="submit"]').click();

    cy.wait('@createStudent');
    cy.location('pathname').should('eq', '/students');
    cy.contains('[data-cy="student-row"]', 'Katherine').should('exist');
  });
});

describe("TF-10 — Cycle de vie complet d'un étudiant", () => {
  it('consultation → modification → suppression', () => {
    const base = {
      id: 1, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@mail.com',
      dateOfBirth: '1815-12-10', phoneNumber: '0102030405',
      createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00',
    };
    let liste = [base];

    cy.intercept('GET', '**/api/students', (req) => req.reply(liste)).as('getStudents');
    cy.intercept('GET', '**/api/students/1', (req) => req.reply(liste[0] || base)).as('getStudent');
    cy.intercept('PUT', '**/api/students/1', (req) => {
      liste = [{ ...liste[0], ...req.body }];
      req.reply(liste[0]);
    }).as('updateStudent');
    cy.intercept('DELETE', '**/api/students/1', (req) => {
      liste = [];
      req.reply({ statusCode: 204 });
    }).as('deleteStudent');

    // Consultation
    cy.visitAuthed('/students');
    cy.contains('[data-cy="student-row"]', 'Ada').find('[data-cy="view"]').click();
    cy.location('pathname').should('eq', '/students/1');
    cy.get('[data-cy="detail"]').should('contain', 'Lovelace');

    // Modification
    cy.get('[data-cy="detail"]').find('[data-cy="edit"]').click();
    cy.location('pathname').should('eq', '/students/1/edit');
    cy.get('[data-cy="lastName"]').clear().type('King-Noel');
    cy.get('[data-cy="submit"]').click();
    cy.wait('@updateStudent');
    cy.location('pathname').should('eq', '/students');
    cy.contains('[data-cy="student-row"]', 'King-Noel').should('exist');

    // Suppression
    cy.on('window:confirm', () => true);
    cy.contains('[data-cy="student-row"]', 'King-Noel').find('[data-cy="delete"]').click();
    cy.wait('@deleteStudent');
    cy.get('[data-cy="empty"]').should('be.visible');
  });
});