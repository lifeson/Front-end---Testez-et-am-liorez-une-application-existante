import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

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

describe('StudentDetailComponent', () => {
  let component: StudentDetailComponent;
  let fixture: ComponentFixture<StudentDetailComponent>;

  /** Mock renvoyant un étudiant connu (s1) pour getById(). */
  class StudentDetailMock extends StudentMockService {
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
        { provide: StudentService, useValue: new StudentDetailMock() },
        {
          // id = '1' -> ngOnInit lit ce paramètre et appelle getById(1).
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // déclenche ngOnInit -> getById(1)
  });

  // TU-48 — Le composant s'instancie
  // Entrée : paramMap = convertToParamMap({ id: '1' }), mock getById() -> of(s1)
  // Sortie : instance truthy
  it("s'instancie (TU-48)", () => {
    expect(component).toBeTruthy();
  });

  // TU-59 — ngOnInit charge l'étudiant dans student
  // Entrée : paramMap = { id: '1' } ; mock getById(1) -> of(s1) ; detectChanges
  // Sortie : component.student est deep-equal à s1
  it("charge l'étudiant renvoyé par le service dans student (TU-59)", () => {
    expect(component.student).toEqual(s1);
  });

  // TU-60 — loading retombe à false après chargement
  // Entrée : idem TU-59
  // Sortie : component.loading === false
  it('remet loading à false après chargement (TU-60)', () => {
    expect(component.loading).toBe(false);
  });
});