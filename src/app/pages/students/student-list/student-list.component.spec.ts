import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { StudentListComponent } from './student-list.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { StudentService } from '../../../core/service/student.service';
import { StudentMockService } from '../../../core/service/student-mock.service';
import { StudentResponse } from '../../../core/models/StudentResponse';

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
const s2: StudentResponse = {
  ...s1,
  id: 2,
  firstName: 'Alan',
  lastName: 'Turing',
  email: 'alan@x.com',
};

// ═════════════════════════════════════════════════════════════════════════════
describe('StudentListComponent (liste vide)', () => {
  let component: StudentListComponent;
  let fixture: ComponentFixture<StudentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentListComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: StudentService, useValue: new StudentMockService() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // TU-46 — Le composant s'instancie
  it("s'instancie (TU-46)", () => {
    expect(component).toBeTruthy();
  });

  // TU-47 — État initial de la liste
  it('a une liste vide et loading à false après chargement (TU-47)', () => {
    expect(component.students).toEqual([]);
    expect(component.loading).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('StudentListComponent (liste peuplée)', () => {
  let component: StudentListComponent;
  let fixture: ComponentFixture<StudentListComponent>;
  let studentService: StudentService;

  class PopulatedMock extends StudentMockService {
    override getAll() {
      return of([s1, s2]);
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentListComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: StudentService, useValue: new PopulatedMock() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentListComponent);
    component = fixture.componentInstance;
    studentService = TestBed.inject(StudentService);
    fixture.detectChanges(); // ngOnInit -> loadStudents() -> students = [s1, s2]
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // TU-57 — ngOnInit charge la liste dans students
  it('charge la liste renvoyée par le service dans students (TU-57)', () => {
    expect(component.students).toEqual([s1, s2]);
    expect(component.students.length).toBe(2);
  });

  // TU-58 — loading retombe à false après chargement
  it('remet loading à false après chargement (TU-58)', () => {
    expect(component.loading).toBe(false);
  });

  // ── TU-82 → TU-85 : deleteStudent() ───────────────────────────────────
  describe('deleteStudent()', () => {
    // TU-82 — Confirmation refusée
    // Entrée : students = [s1, s2] ; window.confirm -> false ; deleteStudent(1)
    // Sortie : students inchangé ; delete() non appelé
    it('ne supprime rien quand la confirmation est refusée (TU-82)', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(false);
      const deleteSpy = jest.spyOn(studentService, 'delete');

      component.deleteStudent(1);

      expect(component.students).toEqual([s1, s2]);
      expect(component.students.length).toBe(2);
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    // TU-83 — Confirmation acceptée
    // Entrée : students = [s1, s2] ; window.confirm -> true ; delete() -> of(undefined) ; deleteStudent(1)
    // Sortie : students ne contient plus l'id 1
    it("retire l'étudiant de la liste quand la suppression réussit (TU-83)", () => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      jest.spyOn(studentService, 'delete').mockReturnValue(of(undefined));

      component.deleteStudent(1);

      expect(component.students).toEqual([s2]);
      expect(component.students.length).toBe(1);
    });

    // TU-84 — Erreur avec message
    // Entrée : confirm -> true ; delete() -> throwError({ error: { message: 'Suppression interdite' } }) ; deleteStudent(1)
    // Sortie : errorMessage === 'Suppression interdite' ; students inchangé
    it("affiche le message d'erreur renvoyé par le back (TU-84)", () => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      jest
        .spyOn(studentService, 'delete')
        .mockReturnValue(
          throwError(() => ({ error: { message: 'Suppression interdite' } })),
        );

      component.deleteStudent(1);

      expect(component.errorMessage).toBe('Suppression interdite');
      expect(component.students).toEqual([s1, s2]);
    });

    // TU-85 — Erreur sans message (fallback)
    // Entrée : confirm -> true ; delete() -> throwError({}) ; deleteStudent(1)
    // Sortie : errorMessage === 'Impossible de supprimer cet étudiant.'
    it('affiche un message par défaut quand le back ne fournit pas de message (TU-85)', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      jest.spyOn(studentService, 'delete').mockReturnValue(throwError(() => ({})));

      component.deleteStudent(1);

      expect(component.errorMessage).toBe('Impossible de supprimer cet étudiant.');
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('StudentListComponent (chargement en erreur)', () => {
  let component: StudentListComponent;
  let fixture: ComponentFixture<StudentListComponent>;
  let studentService: StudentService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentListComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: StudentService, useValue: new StudentMockService() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentListComponent);
    component = fixture.componentInstance;
    studentService = TestBed.inject(StudentService);
    // Pas de detectChanges ici : chaque test pilote getAll() AVANT ngOnInit.
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // TU-80 — loadStudents : erreur avec message
  // Entrée : getAll() -> throwError({ error: { message: 'Service indisponible' } }) ; detectChanges
  // Sortie : errorMessage === 'Service indisponible' ; loading === false ; students === []
  it("affiche le message d'erreur quand le chargement de la liste échoue (TU-80)", () => {
    jest
      .spyOn(studentService, 'getAll')
      .mockReturnValue(
        throwError(() => ({ error: { message: 'Service indisponible' } })),
      );

    fixture.detectChanges(); // ngOnInit -> loadStudents()

    expect(component.errorMessage).toBe('Service indisponible');
    expect(component.loading).toBe(false);
    expect(component.students).toEqual([]);
  });

  // TU-81 — loadStudents : erreur sans message (fallback)
  // Entrée : getAll() -> throwError({}) ; detectChanges
  // Sortie : errorMessage === 'Impossible de charger la liste des étudiants.'
  it('affiche un message par défaut quand le chargement échoue sans message (TU-81)', () => {
    jest.spyOn(studentService, 'getAll').mockReturnValue(throwError(() => ({})));

    fixture.detectChanges();

    expect(component.errorMessage).toBe(
      'Impossible de charger la liste des étudiants.',
    );
    expect(component.loading).toBe(false);
  });
});