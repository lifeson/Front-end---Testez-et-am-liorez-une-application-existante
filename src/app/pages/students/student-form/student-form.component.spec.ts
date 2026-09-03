import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { StudentFormComponent } from './student-form.component';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { StudentService } from '../../../core/service/student.service';
import { StudentMockService } from '../../../core/service/student-mock.service';
import { StudentResponse } from '../../../core/models/StudentResponse';

// ─────────────────────────────────────────────────────────────────────────────
describe('StudentFormComponent (mode création)', () => {
  let component: StudentFormComponent;
  let fixture: ComponentFixture<StudentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentFormComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: StudentService, useValue: new StudentMockService() },
        {
          // Pas de paramètre 'id' -> le composant reste en mode création.
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({}) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // déclenche ngOnInit -> construction du formulaire
  });

  // TU-36 — Le composant s'instancie
  it("s'instancie (TU-36)", () => {
    expect(component).toBeTruthy();
  });

  // TU-37 — Mode création quand aucun paramètre id
  it("est en mode création quand aucun id n'est présent (TU-37)", () => {
    expect(component.isEditMode).toBe(false);
    expect(component.studentId).toBeNull();
  });

  // TU-38 — ngOnInit construit le formulaire avec les 5 contrôles
  it('construit le formulaire avec les 5 contrôles (TU-38)', () => {
    expect(component.studentForm.contains('firstName')).toBe(true);
    expect(component.studentForm.contains('lastName')).toBe(true);
    expect(component.studentForm.contains('email')).toBe(true);
    expect(component.studentForm.contains('dateOfBirth')).toBe(true);
    expect(component.studentForm.contains('phoneNumber')).toBe(true);
  });

  // TU-39 — Les champs sont initialement vides
  it('initialise les 5 champs à une chaîne vide (TU-39)', () => {
    expect(component.studentForm.get('firstName')?.value).toBe('');
    expect(component.studentForm.get('lastName')?.value).toBe('');
    expect(component.studentForm.get('email')?.value).toBe('');
    expect(component.studentForm.get('dateOfBirth')?.value).toBe('');
    expect(component.studentForm.get('phoneNumber')?.value).toBe('');
  });

  // TU-40 — Drapeaux d'état initiaux
  it("a des drapeaux d'état initiaux neutres (TU-40)", () => {
    expect(component.submitted).toBe(false);
    expect(component.loading).toBe(false);
  });

  // TU-41 — Le getter form expose les contrôles
  it('expose les contrôles du formulaire via le getter form (TU-41)', () => {
    expect(component.form).toBe(component.studentForm.controls);
  });

  // TU-42 — Le formulaire est valide avec prénom / nom / email valides
  it('est valide avec prénom, nom et email renseignés (TU-42)', () => {
    component.studentForm.patchValue({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@x.com',
    });

    expect(component.studentForm.valid).toBe(true);
  });

  // TU-43 — Le contrôle email accepte une adresse bien formée
  it('accepte une adresse email bien formée (TU-43)', () => {
    component.studentForm.get('email')?.setValue('ada@x.com');

    expect(component.studentForm.get('email')?.valid).toBe(true);
  });

  // TU-44 — dateOfBirth et phoneNumber sont optionnels
  it('reste valide avec dateOfBirth et phoneNumber vides (TU-44)', () => {
    component.studentForm.patchValue({
      firstName: 'A',
      lastName: 'B',
      email: 'a@b.com',
    });

    expect(component.studentForm.get('dateOfBirth')?.value).toBe('');
    expect(component.studentForm.get('phoneNumber')?.value).toBe('');
    expect(component.studentForm.valid).toBe(true);
  });

  // TU-45 — onReset() remet les drapeaux à zéro
  it('remet submitted et errorMessage à zéro via onReset() (TU-45)', () => {
    component.submitted = true;
    component.errorMessage = "Une erreur est survenue lors de l'enregistrement.";

    component.onReset();

    expect(component.submitted).toBe(false);
    expect(component.errorMessage).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('StudentFormComponent (mode édition)', () => {
  let component: StudentFormComponent;
  let fixture: ComponentFixture<StudentFormComponent>;

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

  /** Mock renvoyant un étudiant connu (s5) pour getById(). */
  class StudentFormEditMock extends StudentMockService {
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
        { provide: StudentService, useValue: new StudentFormEditMock() },
        {
          // id = '5' -> ngOnInit passe en mode édition et appelle getById(5).
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '5' }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // déclenche ngOnInit -> loadStudent(5)
  });

  // TU-61 — Mode édition quand un id est présent
  // Entrée : paramMap = { id: '5' } ; detectChanges
  // Sortie : isEditMode === true et studentId === 5
  it("est en mode édition quand un id est présent (TU-61)", () => {
    expect(component.isEditMode).toBe(true);
    expect(component.studentId).toBe(5);
  });

  // TU-62 — Le formulaire est pré-rempli avec l'étudiant chargé
  // Entrée : mock getById(5) -> of(s5) ; detectChanges
  // Sortie : chaque contrôle du formulaire vaut le champ correspondant de s5
  it("pré-remplit le formulaire avec l'étudiant chargé (TU-62)", () => {
    expect(component.studentForm.get('firstName')?.value).toBe(s5.firstName);
    expect(component.studentForm.get('lastName')?.value).toBe(s5.lastName);
    expect(component.studentForm.get('email')?.value).toBe(s5.email);
    expect(component.studentForm.get('dateOfBirth')?.value).toBe(s5.dateOfBirth);
    expect(component.studentForm.get('phoneNumber')?.value).toBe(s5.phoneNumber);
  });

  // TU-63 — loading retombe à false après chargement
  // Entrée : idem TU-62
  // Sortie : component.loading === false
  it('remet loading à false après chargement (TU-63)', () => {
    expect(component.loading).toBe(false);
  });
});