import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentFormComponent } from './student-form.component';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { StudentService } from '../../../core/service/student.service';
import { StudentMockService } from '../../../core/service/student-mock.service';

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
  // Entrée : createComponent + detectChanges
  // Sortie : instance truthy
  it("s'instancie (TU-36)", () => {
    expect(component).toBeTruthy();
  });

  // TU-37 — Mode création quand aucun paramètre id
  // Entrée : paramMap = convertToParamMap({})
  // Sortie : isEditMode === false et studentId === null
  it('est en mode création quand aucun id n\'est présent (TU-37)', () => {
    expect(component.isEditMode).toBe(false);
    expect(component.studentId).toBeNull();
  });

  // TU-38 — ngOnInit construit le formulaire avec les 5 contrôles
  // Entrée : après detectChanges
  // Sortie : studentForm contient firstName, lastName, email, dateOfBirth, phoneNumber
  it('construit le formulaire avec les 5 contrôles (TU-38)', () => {
    expect(component.studentForm.contains('firstName')).toBe(true);
    expect(component.studentForm.contains('lastName')).toBe(true);
    expect(component.studentForm.contains('email')).toBe(true);
    expect(component.studentForm.contains('dateOfBirth')).toBe(true);
    expect(component.studentForm.contains('phoneNumber')).toBe(true);
  });

  // TU-39 — Les champs sont initialement vides
  // Entrée : après detectChanges
  // Sortie : les 5 contrôles valent ''
  it('initialise les 5 champs à une chaîne vide (TU-39)', () => {
    expect(component.studentForm.get('firstName')?.value).toBe('');
    expect(component.studentForm.get('lastName')?.value).toBe('');
    expect(component.studentForm.get('email')?.value).toBe('');
    expect(component.studentForm.get('dateOfBirth')?.value).toBe('');
    expect(component.studentForm.get('phoneNumber')?.value).toBe('');
  });

  // TU-40 — Drapeaux d'état initiaux
  // Entrée : après detectChanges
  // Sortie : submitted === false, loading === false
  it('a des drapeaux d\'état initiaux neutres (TU-40)', () => {
    expect(component.submitted).toBe(false);
    expect(component.loading).toBe(false);
  });

  // TU-41 — Le getter form expose les contrôles
  // Entrée : lecture de component.form
  // Sortie : component.form === studentForm.controls
  it('expose les contrôles du formulaire via le getter form (TU-41)', () => {
    expect(component.form).toBe(component.studentForm.controls);
  });

  // TU-42 — Le formulaire est valide avec prénom / nom / email valides
  // Entrée : patchValue({ firstName: 'Ada', lastName: 'Lovelace', email: 'ada@x.com' })
  // Sortie : studentForm.valid === true
  it('est valide avec prénom, nom et email renseignés (TU-42)', () => {
    component.studentForm.patchValue({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@x.com',
    });

    expect(component.studentForm.valid).toBe(true);
  });

  // TU-43 — Le contrôle email accepte une adresse bien formée
  // Entrée : studentForm.get('email').setValue('ada@x.com')
  // Sortie : studentForm.get('email').valid === true
  it('accepte une adresse email bien formée (TU-43)', () => {
    component.studentForm.get('email')?.setValue('ada@x.com');

    expect(component.studentForm.get('email')?.valid).toBe(true);
  });

  // TU-44 — dateOfBirth et phoneNumber sont optionnels
  // Entrée : patchValue({ firstName: 'A', lastName: 'B', email: 'a@b.com' }) (2 autres vides)
  // Sortie : studentForm.valid === true
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
  // Entrée : submitted = true, errorMessage renseigné, puis onReset()
  // Sortie : submitted === false et errorMessage === null
  it('remet submitted et errorMessage à zéro via onReset() (TU-45)', () => {
    component.submitted = true;
    component.errorMessage = "Une erreur est survenue lors de l'enregistrement.";

    component.onReset();

    expect(component.submitted).toBe(false);
    expect(component.errorMessage).toBeNull();
  });
});