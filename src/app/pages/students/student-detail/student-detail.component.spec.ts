import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentDetailComponent } from './student-detail.component';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { StudentService } from '../../../core/service/student.service';
import { StudentMockService } from '../../../core/service/student-mock.service';

describe('StudentDetailComponent', () => {
  let component: StudentDetailComponent;
  let fixture: ComponentFixture<StudentDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentDetailComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        // StudentMockService.getById(1) renvoie of(<étudiant factice id=1>).
        { provide: StudentService, useValue: new StudentMockService() },
        {
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
  // Entrée : paramMap = convertToParamMap({ id: '1' }), mock getById() -> of(<étudiant>)
  // Sortie : instance truthy
  it("s'instancie (TU-48)", () => {
    expect(component).toBeTruthy();
  });
});