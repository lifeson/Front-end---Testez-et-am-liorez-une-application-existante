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

describe('StudentDetailComponent - intégration (rendu du template)', () => {
  let fixture: ComponentFixture<StudentDetailComponent>;
  let element: HTMLElement;

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
          // id = '1' -> ngOnInit appelle getById(1).
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentDetailComponent);
    element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges(); // ngOnInit -> getById(1) -> rendu du détail
  });

  // TI-11 — Les informations de l'étudiant sont affichées
  // Entrée : paramMap = { id: '1' } ; mock getById(1) -> of(s1) ; detectChanges
  // Sortie : le DOM contient firstName / lastName / email / dateOfBirth / phoneNumber de s1
  it("affiche les informations de l'étudiant chargé (TI-11)", () => {
    const text = element.textContent ?? '';

    expect(text).toContain(s1.firstName);
    expect(text).toContain(s1.lastName);
    expect(text).toContain(s1.email);
    expect(text).toContain(s1.dateOfBirth);
    expect(text).toContain(s1.phoneNumber);
  });
});