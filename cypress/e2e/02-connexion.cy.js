describe('TF-02 — Connexion', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/students', { fixture: 'students.json' }).as('getStudents');
  });

  it("stocke le token et redirige vers /students (identifiants valides)", () => {
    cy.intercept('POST', '**/api/login', {
      statusCode: 200,
      body: { token: 'fake-jwt-token' },
    }).as('login');

    cy.visit('/login');
    cy.get('[data-cy="login"]').type('ada');
    cy.get('[data-cy="password"]').type('secret123');
    cy.get('[data-cy="submit"]').click();

    cy.wait('@login');
    cy.location('pathname').should('eq', '/students');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.eq('fake-jwt-token');
    });
  });

  it("affiche un message d'erreur avec de mauvais identifiants", () => {
    cy.intercept('POST', '**/api/login', { statusCode: 401, body: {} }).as('loginKO');

    cy.visit('/login');
    cy.get('[data-cy="login"]').type('ada');
    cy.get('[data-cy="password"]').type('mauvais');
    cy.get('[data-cy="submit"]').click();

    cy.wait('@loginKO');
    cy.get('[data-cy="error"]').should('be.visible').and('contain', 'incorrect');
    cy.location('pathname').should('eq', '/login');
  });
});

describe('TF-03 / TF-08 — Session active', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/students', { fixture: 'students.json' }).as('getStudents');
  });

  it("TF-03 — affiche la liste des étudiants une fois connecté", () => {
    cy.visitAuthed('/students');
    cy.wait('@getStudents');
    cy.get('[data-cy="student-row"]').should('have.length', 2);
    cy.contains('[data-cy="student-row"]', 'Ada').should('exist');
  });

  it("TF-08 — reste sur /students après un rafraîchissement", () => {
    cy.visitAuthed('/students');
    cy.wait('@getStudents');
    cy.reload();
    cy.location('pathname').should('eq', '/students');
    cy.get('[data-cy="student-row"]').should('have.length', 2);
  });

  it("redirige vers /login sans session active (authGuard)", () => {
    cy.visit('/students');
    cy.location('pathname').should('eq', '/login');
  });
});