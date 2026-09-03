import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentListComponent } from './student-list.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { StudentService } from '../../../core/service/student.service';
import { StudentMockService } from '../../../core/service/student-mock.service';

describe('StudentListComponent', () => {
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