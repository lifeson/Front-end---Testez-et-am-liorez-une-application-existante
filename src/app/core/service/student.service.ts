import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from '../models/Student';
import { StudentResponse } from '../models/StudentResponse';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  constructor(private httpClient: HttpClient) { }

  create(student: Student): Observable<StudentResponse> {
    return this.httpClient.post<StudentResponse>('/api/students', student);
  }

  getAll(): Observable<StudentResponse[]> {
    return this.httpClient.get<StudentResponse[]>('/api/students');
  }

  getById(id: number): Observable<StudentResponse> {
    return this.httpClient.get<StudentResponse>(`/api/students/${id}`);
  }

  update(id: number, student: Student): Observable<StudentResponse> {
    return this.httpClient.put<StudentResponse>(`/api/students/${id}`, student);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`/api/students/${id}`);
  }
}
