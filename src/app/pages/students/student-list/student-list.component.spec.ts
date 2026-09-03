import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

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

describe('StudentListComponent (liste vide)', () => {
  let component: StudentListComponent;
  let fixture: ComponentFixture<StudentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentListComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        // StudentMockService.getAll() renvoie of([]) -> liste vide en sortie.
        { provide: StudentService, useValue: new StudentMockService() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // déclenche ngOnInit -> loadStudents()
  });

  // TU-46 — Le composant s'instancie
  // Entrée : createComponent + detectChanges (mock getAll() -> of([]))
  // Sortie : instance truthy
  it("s'instancie (TU-46)", () => {
    expect(component).toBeTruthy();
  });

  // TU-47 — État initial de la liste
  // Entrée : après detectChanges, mock getAll() -> of([])
  // Sortie : students vaut [] et loading === false
  it('a une liste vide et loading à false après chargement (TU-47)', () => {
    expect(component.students).toEqual([]);
    expect(component.loading).toBe(false);
  });
});

describe('StudentListComponent (liste peuplée)', () => {
  let component: StudentListComponent;
  let fixture: ComponentFixture<StudentListComponent>;

  /** Mock renvoyant 2 étudiants pour getAll(). */
  class StudentListMock extends StudentMockService {
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
        { provide: StudentService, useValue: new StudentListMock() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // déclenche ngOnInit -> loadStudents()
  });

  // TU-57 — ngOnInit charge la liste dans students
  // Entrée : mock getAll() -> of([s1, s2]) ; detectChanges
  // Sortie : component.students égale [s1, s2] (longueur 2)
  it('charge la liste renvoyée par le service dans students (TU-57)', () => {
    expect(component.students).toEqual([s1, s2]);
    expect(component.students.length).toBe(2);
  });

  // TU-58 — loading retombe à false après chargement
  // Entrée : idem TU-57
  // Sortie : component.loading === false
  it('remet loading à false après chargement (TU-58)', () => {
    expect(component.loading).toBe(false);
  });
});