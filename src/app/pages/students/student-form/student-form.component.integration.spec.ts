import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { StudentFormComponent } from './student-form.component';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { StudentService } from '../../../core/service/student.service';
import { StudentMockService } from '../../../core/service/student-mock.service';
import { StudentResponse } from '../../../core/models/StudentResponse';

describe('StudentFormComponent - intégration (rendu du template)', () => {
  let fixture: ComponentFixture<StudentFormComponent>;
  let element: HTMLElement;

  // ── TI-12 — mode création ─────────────────────────────────────────────────
  describe('mode création', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [StudentFormComponent],
        providers: [
          provideHttpClient(),
          provideRouter([]),
          { provide: StudentService, useValue: new StudentMockService() },
          {
            // Pas de paramètre 'id' -> mode création.
            provide: ActivatedRoute,
            useValue: { snapshot: { paramMap: convertToParamMap({}) } },
          },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(StudentFormComponent);
      element = fixture.nativeElement as HTMLElement;
      fixture.detectChanges();
    });

    // Entrée : paramMap = {} ; detectChanges
    // Sortie : h5.card-header contient "Ajouter un étudiant" ; bouton principal = "Ajouter"
    it("affiche l'en-tête et le bouton de création (TI-12)", () => {
      const header = element.querySelector('h5.card-header');
      const submitButton = element.querySelector('button.btn-primary');

      expect(header?.textContent).toContain('Ajouter un étudiant');
      expect(submitButton?.textContent?.trim()).toBe('Ajouter');
    });
  });

  // ── TI-13 — mode édition ──────────────────────────────────────────────────
  describe('mode édition', () => {
    const s5: StudentResponse = {
      id: 5,
      firstName: 'Grace',
      lastName: 'Hopper',
      email: 'grace@x.com',
      dateOfBirth: '1906-12-09',
      phoneNumber: '0605040302',
      createdAt: '2026-01-01T00:00:00',
      updatedAt: '2026-01-01T00:00:00',
    };

    class EditMock extends StudentMockService {
      override getById() {
        return of(s5);
      }
    }

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [StudentFormComponent],
        providers: [
          provideHttpClient(),
          provideRouter([]),
          { provide: StudentService, useValue: new EditMock() },
          {
            // id = '5' -> mode édition + chargement de s5.
            provide: ActivatedRoute,
            useValue: { snapshot: { paramMap: convertToParamMap({ id: '5' }) } },
          },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(StudentFormComponent);
      element = fixture.nativeElement as HTMLElement;
      fixture.detectChanges();
    });

    // Entrée : paramMap = { id: '5' } ; mock getById(5) -> of(s5) ; detectChanges
    // Sortie : h5.card-header contient "Modifier un étudiant" ; bouton principal = "Enregistrer"
    it("affiche l'en-tête et le bouton d'édition (TI-13)", () => {
      const header = element.querySelector('h5.card-header');
      const submitButton = element.querySelector('button.btn-primary');

      expect(header?.textContent).toContain('Modifier un étudiant');
      expect(submitButton?.textContent?.trim()).toBe('Enregistrer');
    });
  });
});