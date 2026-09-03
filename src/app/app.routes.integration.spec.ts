import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { routes } from './app.routes';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { StudentListComponent } from './pages/students/student-list/student-list.component';
import { StudentDetailComponent } from './pages/students/student-detail/student-detail.component';
import { StudentFormComponent } from './pages/students/student-form/student-form.component';
import { StudentService } from './core/service/student.service';
import { StudentMockService } from './core/service/student-mock.service';
import { UserService } from './core/service/user.service';
import { UserMockService } from './core/service/user-mock.service';
import { StudentResponse } from './core/models/StudentResponse';

const s1: StudentResponse = {
  id: 1,
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@x.com',
  dateOfBirth: '1815-12-10',
  phoneNumber: '0102030405',
  createdAt: '2026-01-01T00:00:00',
  updatedAt: '2026-01-01T00:00:00',
};

/** Mock renvoyant un étudiant connu pour les routes /students/:id[/edit]. */
class RoutingStudentMock extends StudentMockService {
  override getById() {
    return of(s1);
  }
}

describe('Routing - intégration (app.routes)', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideRouter(routes), // les vraies routes de l'application
        { provide: StudentService, useValue: new RoutingStudentMock() },
        { provide: UserService, useValue: new UserMockService() },
      ],
    });

    // authGuard protège /students* : on simule une session active.
    localStorage.setItem('token', 'jwt-abc');

    harness = await RouterTestingHarness.create();
  });

  afterEach(() => {
    localStorage.removeItem('token');
  });

  // TI-14 — /login monte LoginComponent
  // Entrée : harness.navigateByUrl('/login')
  // Sortie : le composant rendu est une instance de LoginComponent
  it('/login monte LoginComponent (TI-14)', async () => {
    const cmp = await harness.navigateByUrl('/login', LoginComponent);
    expect(cmp).toBeInstanceOf(LoginComponent);
  });

  // TI-15 — /register monte RegisterComponent
  it('/register monte RegisterComponent (TI-15)', async () => {
    const cmp = await harness.navigateByUrl('/register', RegisterComponent);
    expect(cmp).toBeInstanceOf(RegisterComponent);
  });

  // TI-16 — /students (token présent) monte StudentListComponent
  it('/students monte StudentListComponent quand un token est présent (TI-16)', async () => {
    const cmp = await harness.navigateByUrl('/students', StudentListComponent);
    expect(cmp).toBeInstanceOf(StudentListComponent);
  });

  // TI-17 — /students/new monte StudentFormComponent en création
  // Sortie : instance de StudentFormComponent avec isEditMode === false
  it('/students/new monte StudentFormComponent en mode création (TI-17)', async () => {
    const cmp = await harness.navigateByUrl('/students/new', StudentFormComponent);
    expect(cmp).toBeInstanceOf(StudentFormComponent);
    expect(cmp.isEditMode).toBe(false);
  });

  // TI-18 — /students/1 monte StudentDetailComponent
  it('/students/1 monte StudentDetailComponent (TI-18)', async () => {
    const cmp = await harness.navigateByUrl('/students/1', StudentDetailComponent);
    expect(cmp).toBeInstanceOf(StudentDetailComponent);
  });

  // TI-19 — /students/1/edit monte StudentFormComponent en édition
  // Sortie : instance de StudentFormComponent avec isEditMode === true
  it('/students/1/edit monte StudentFormComponent en mode édition (TI-19)', async () => {
    const cmp = await harness.navigateByUrl('/students/1/edit', StudentFormComponent);
    expect(cmp).toBeInstanceOf(StudentFormComponent);
    expect(cmp.isEditMode).toBe(true);
  });
});