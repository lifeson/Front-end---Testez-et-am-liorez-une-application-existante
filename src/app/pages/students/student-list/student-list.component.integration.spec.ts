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

describe('StudentListComponent - intégration (rendu du template)', () => {
  let fixture: ComponentFixture<StudentListComponent>;
  let element: HTMLElement;

  // ── TI-09 — liste peuplée ──────────────────────────────────────────────────
  describe('liste peuplée', () => {
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
      element = fixture.nativeElement as HTMLElement;
      fixture.detectChanges(); // ngOnInit -> loadStudents() -> rendu du tableau
    });

    // Entrée : mock getAll() -> of([s1, s2]) ; detectChanges
    // Sortie : tbody tr = 2 ; la 1re ligne affiche firstName / lastName / email de s1
    it('affiche une ligne de tableau par étudiant (TI-09)', () => {
      const rows = element.querySelectorAll('tbody tr');
      expect(rows.length).toBe(2);

      const firstRowText = rows[0].textContent ?? '';
      expect(firstRowText).toContain(s1.firstName);
      expect(firstRowText).toContain(s1.lastName);
      expect(firstRowText).toContain(s1.email);
    });
  });

  // ── TI-10 — liste vide ────────────────────────────────────────────────────
  describe('liste vide', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [StudentListComponent],
        providers: [
          provideHttpClient(),
          provideRouter([]),
          // StudentMockService.getAll() renvoie of([]).
          { provide: StudentService, useValue: new StudentMockService() },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(StudentListComponent);
      element = fixture.nativeElement as HTMLElement;
      fixture.detectChanges();
    });

    // Entrée : mock getAll() -> of([]) ; detectChanges
    // Sortie : le DOM contient "Aucun étudiant pour le moment." et aucun <table>
    it('affiche le message « liste vide » et aucun tableau (TI-10)', () => {
      expect(element.textContent).toContain('Aucun étudiant pour le moment.');
      expect(element.querySelector('table')).toBeNull();
    });
  });
});