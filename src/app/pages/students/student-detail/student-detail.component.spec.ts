import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { StudentDetailComponent } from './student-detail.component';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
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

// ═════════════════════════════════════════════════════════════════════════════
describe('StudentDetailComponent', () => {
  let component: StudentDetailComponent;
  let fixture: ComponentFixture<StudentDetailComponent>;

  /** Mock renvoyant un étudiant connu (s1) pour getById(). */
  class DetailMock extends StudentMockService {
    override getById() {
      return of(s1);
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentDetailComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: StudentService, useValue: new DetailMock() },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // ngOnInit -> getById(1)
  });

  // TU-48 — Le composant s'instancie
  it("s'instancie (TU-48)", () => {
    expect(component).toBeTruthy();
  });

  // TU-59 — ngOnInit charge l'étudiant dans student
  it("charge l'étudiant renvoyé par le service dans student (TU-59)", () => {
    expect(component.student).toEqual(s1);
  });

  // TU-60 — loading retombe à false après chargement
  it('remet loading à false après chargement (TU-60)', () => {
    expect(component.loading).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('StudentDetailComponent (chargement en erreur)', () => {
  let component: StudentDetailComponent;
  let fixture: ComponentFixture<StudentDetailComponent>;
  let studentService: StudentService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentDetailComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: StudentService, useValue: new StudentMockService() },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentDetailComponent);
    component = fixture.componentInstance;
    studentService = TestBed.inject(StudentService);
    // Pas de detectChanges ici : chaque test pilote getById() AVANT ngOnInit.
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // TU-86 — ngOnInit : erreur avec message
  // Entrée : paramMap = { id: '1' } ; getById() -> throwError({ error: { message: 'Accès refusé' } }) ; detectChanges
  // Sortie : errorMessage === 'Accès refusé' ; loading === false ; student === null
  it("affiche le message d'erreur quand le chargement échoue (TU-86)", () => {
    jest
      .spyOn(studentService, 'getById')
      .mockReturnValue(
        throwError(() => ({ error: { message: 'Accès refusé' } })),
      );

    fixture.detectChanges(); // déclenche ngOnInit -> getById(1)

    expect(component.errorMessage).toBe('Accès refusé');
    expect(component.loading).toBe(false);
    expect(component.student).toBeNull();
  });

  // TU-87 — ngOnInit : erreur sans message (fallback)
  // Entrée : paramMap = { id: '1' } ; getById() -> throwError({}) ; detectChanges
  // Sortie : errorMessage === 'Étudiant introuvable.' ; loading === false
  it('affiche un message par défaut quand le chargement échoue sans message (TU-87)', () => {
    jest.spyOn(studentService, 'getById').mockReturnValue(throwError(() => ({})));

    fixture.detectChanges();

    expect(component.errorMessage).toBe('Étudiant introuvable.');
    expect(component.loading).toBe(false);
  });
});