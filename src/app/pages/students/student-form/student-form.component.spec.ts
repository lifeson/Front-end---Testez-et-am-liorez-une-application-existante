import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { StudentFormComponent } from './student-form.component';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { StudentService } from '../../../core/service/student.service';
import { StudentMockService } from '../../../core/service/student-mock.service';
import { StudentResponse } from '../../../core/models/StudentResponse';

const createdStudent: StudentResponse = {
  id: 1,
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@x.com',
  dateOfBirth: '',
  phoneNumber: '',
  createdAt: '2026-01-01T00:00:00',
  updatedAt: '2026-01-01T00:00:00',
};

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

// ═════════════════════════════════════════════════════════════════════════════
describe('StudentFormComponent (mode création)', () => {
  let component: StudentFormComponent;
  let fixture: ComponentFixture<StudentFormComponent>;
  let studentService: StudentService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentFormComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: StudentService, useValue: new StudentMockService() },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({}) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentFormComponent);
    component = fixture.componentInstance;
    studentService = TestBed.inject(StudentService);
    router = TestBed.inject(Router);
    fixture.detectChanges(); // ngOnInit -> construction du formulaire
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ── TU-36 → TU-45 : initialisation & état ──────────────────────────────
  it("s'instancie (TU-36)", () => {
    expect(component).toBeTruthy();
  });

  it("est en mode création quand aucun id n'est présent (TU-37)", () => {
    expect(component.isEditMode).toBe(false);
    expect(component.studentId).toBeNull();
  });

  it('construit le formulaire avec les 5 contrôles (TU-38)', () => {
    expect(component.studentForm.contains('firstName')).toBe(true);
    expect(component.studentForm.contains('lastName')).toBe(true);
    expect(component.studentForm.contains('email')).toBe(true);
    expect(component.studentForm.contains('dateOfBirth')).toBe(true);
    expect(component.studentForm.contains('phoneNumber')).toBe(true);
  });

  it('initialise les 5 champs à une chaîne vide (TU-39)', () => {
    expect(component.studentForm.get('firstName')?.value).toBe('');
    expect(component.studentForm.get('lastName')?.value).toBe('');
    expect(component.studentForm.get('email')?.value).toBe('');
    expect(component.studentForm.get('dateOfBirth')?.value).toBe('');
    expect(component.studentForm.get('phoneNumber')?.value).toBe('');
  });

  it("a des drapeaux d'état initiaux neutres (TU-40)", () => {
    expect(component.submitted).toBe(false);
    expect(component.loading).toBe(false);
  });

  it('expose les contrôles du formulaire via le getter form (TU-41)', () => {
    expect(component.form).toBe(component.studentForm.controls);
  });

  it('est valide avec prénom, nom et email renseignés (TU-42)', () => {
    component.studentForm.patchValue({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@x.com',
    });
    expect(component.studentForm.valid).toBe(true);
  });

  it('accepte une adresse email bien formée (TU-43)', () => {
    component.studentForm.get('email')?.setValue('ada@x.com');
    expect(component.studentForm.get('email')?.valid).toBe(true);
  });

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

  it('remet submitted et errorMessage à zéro via onReset() (TU-45)', () => {
    component.submitted = true;
    component.errorMessage = "Une erreur est survenue lors de l'enregistrement.";
    component.onReset();
    expect(component.submitted).toBe(false);
    expect(component.errorMessage).toBeNull();
  });

  // ── TU-73, TU-74, TU-76, TU-77 : onSubmit() en création ────────────────
  describe('onSubmit()', () => {
    // TU-73 — Formulaire invalide → sortie anticipée
    // Entrée : studentForm vide ; onSubmit()
    // Sortie : submitted === true ; formulaire invalide ; loading === false ; create() non appelé
    it('ne soumet pas quand le formulaire est invalide (TU-73)', () => {
      const createSpy = jest.spyOn(studentService, 'create');

      component.onSubmit();

      expect(component.submitted).toBe(true);
      expect(component.studentForm.invalid).toBe(true);
      expect(component.loading).toBe(false);
      expect(createSpy).not.toHaveBeenCalled();
    });

    // TU-74 — Création nominale
    // Entrée : form rempli ; create() -> of(<StudentResponse>) ; onSubmit()
    // Sortie : loading === false ; errorMessage === null ; navigation vers '/students'
    it('crée l\'étudiant puis redirige vers la liste (TU-74)', () => {
      jest.spyOn(studentService, 'create').mockReturnValue(of(createdStudent));
      jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
      component.studentForm.patchValue({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@x.com',
      });

      component.onSubmit();

      expect(component.loading).toBe(false);
      expect(component.errorMessage).toBeNull();
      expect(router.navigateByUrl).toHaveBeenCalledWith('/students');
    });

    // TU-76 — Erreur avec message
    // Entrée : form rempli ; create() -> throwError({ error: { message: 'Email déjà utilisé' } })
    // Sortie : errorMessage === 'Email déjà utilisé' ; loading === false
    it("affiche le message d'erreur renvoyé par le back (TU-76)", () => {
      jest
        .spyOn(studentService, 'create')
        .mockReturnValue(
          throwError(() => ({ error: { message: 'Email déjà utilisé' } })),
        );
      component.studentForm.patchValue({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@x.com',
      });

      component.onSubmit();

      expect(component.errorMessage).toBe('Email déjà utilisé');
      expect(component.loading).toBe(false);
    });

    // TU-77 — Erreur sans message (fallback)
    // Entrée : form rempli ; create() -> throwError({})
    // Sortie : errorMessage === "Une erreur est survenue lors de l'enregistrement." ; loading === false
    it('affiche un message par défaut quand le back ne fournit pas de message (TU-77)', () => {
      jest.spyOn(studentService, 'create').mockReturnValue(throwError(() => ({})));
      component.studentForm.patchValue({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@x.com',
      });

      component.onSubmit();

      expect(component.errorMessage).toBe(
        "Une erreur est survenue lors de l'enregistrement.",
      );
      expect(component.loading).toBe(false);
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('StudentFormComponent (mode édition)', () => {
  let component: StudentFormComponent;
  let fixture: ComponentFixture<StudentFormComponent>;
  let studentService: StudentService;
  let router: Router;

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
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '5' }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentFormComponent);
    component = fixture.componentInstance;
    studentService = TestBed.inject(StudentService);
    router = TestBed.inject(Router);
    fixture.detectChanges(); // ngOnInit -> loadStudent(5) -> patchValue
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ── TU-61 → TU-63 ─────────────────────────────────────────────────────
  it('est en mode édition quand un id est présent (TU-61)', () => {
    expect(component.isEditMode).toBe(true);
    expect(component.studentId).toBe(5);
  });

  it("pré-remplit le formulaire avec l'étudiant chargé (TU-62)", () => {
    expect(component.studentForm.get('firstName')?.value).toBe(s5.firstName);
    expect(component.studentForm.get('lastName')?.value).toBe(s5.lastName);
    expect(component.studentForm.get('email')?.value).toBe(s5.email);
    expect(component.studentForm.get('dateOfBirth')?.value).toBe(s5.dateOfBirth);
    expect(component.studentForm.get('phoneNumber')?.value).toBe(s5.phoneNumber);
  });

  it('remet loading à false après chargement (TU-63)', () => {
    expect(component.loading).toBe(false);
  });

  // ── TU-75 : onSubmit() en édition ─────────────────────────────────────
  describe('onSubmit()', () => {
    // TU-75 — Édition nominale (branche isEditMode ? update)
    // Entrée : formulaire pré-rempli + un champ modifié ; update() -> of(s5) ; onSubmit()
    // Sortie : loading === false ; errorMessage === null ; update() appelé avec l'id 5 ; navigation vers '/students'
    it("met à jour l'étudiant via update(id) puis redirige (TU-75)", () => {
      const updateSpy = jest
        .spyOn(studentService, 'update')
        .mockReturnValue(of(s5));
      jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
      component.studentForm.patchValue({ firstName: 'Grace-Updated' });

      component.onSubmit();

      expect(updateSpy).toHaveBeenCalledWith(5, expect.objectContaining({
        firstName: 'Grace-Updated',
      }));
      expect(component.loading).toBe(false);
      expect(component.errorMessage).toBeNull();
      expect(router.navigateByUrl).toHaveBeenCalledWith('/students');
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('StudentFormComponent (chargement en erreur)', () => {
  let component: StudentFormComponent;
  let fixture: ComponentFixture<StudentFormComponent>;
  let studentService: StudentService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentFormComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: StudentService, useValue: new StudentMockService() },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '9' }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentFormComponent);
    component = fixture.componentInstance;
    studentService = TestBed.inject(StudentService);
    // Pas de detectChanges ici : chaque test pilote getById() AVANT ngOnInit.
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // TU-78 — loadStudent : erreur avec message
  // Entrée : id = '9' ; getById() -> throwError({ error: { message: 'Étudiant supprimé' } }) ; detectChanges
  // Sortie : errorMessage === 'Étudiant supprimé' ; loading === false
  it("affiche le message d'erreur quand le chargement échoue (TU-78)", () => {
    jest
      .spyOn(studentService, 'getById')
      .mockReturnValue(
        throwError(() => ({ error: { message: 'Étudiant supprimé' } })),
      );

    fixture.detectChanges(); // déclenche ngOnInit -> loadStudent(9)

    expect(component.errorMessage).toBe('Étudiant supprimé');
    expect(component.loading).toBe(false);
  });

  // TU-79 — loadStudent : erreur sans message (fallback)
  // Entrée : id = '9' ; getById() -> throwError({}) ; detectChanges
  // Sortie : errorMessage === 'Impossible de charger cet étudiant.' ; loading === false
  it('affiche un message par défaut quand le chargement échoue sans message (TU-79)', () => {
    jest.spyOn(studentService, 'getById').mockReturnValue(throwError(() => ({})));

    fixture.detectChanges();

    expect(component.errorMessage).toBe('Impossible de charger cet étudiant.');
    expect(component.loading).toBe(false);
  });
});