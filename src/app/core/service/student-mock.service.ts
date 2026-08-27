import { Observable, of } from 'rxjs';
import { Student } from '../models/Student';
import { StudentResponse } from '../models/StudentResponse';

export class StudentMockService {

  create(student: Student): Observable<StudentResponse> {
    return of({ id: 1, ...student } as StudentResponse);
  }

  getAll(): Observable<StudentResponse[]> {
    return of([]);
  }

  getById(id: number): Observable<StudentResponse> {
    return of({
      id,
      firstName: 'Mock',
      lastName: 'Student',
      email: 'mock.student@mail.com',
      dateOfBirth: '2000-01-01',
      phoneNumber: '0600000000',
      createdAt: '2026-01-01T00:00:00',
      updatedAt: '2026-01-01T00:00:00'
    });
  }

  update(id: number, student: Student): Observable<StudentResponse> {
    return of({ id, ...student } as StudentResponse);
  }

  delete(id: number): Observable<void> {
    return of(undefined);
  }
}
