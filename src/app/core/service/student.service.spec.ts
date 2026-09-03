import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { StudentService } from './student.service';
import { Student } from '../models/Student';
import { StudentResponse } from '../models/StudentResponse';

describe('StudentService', () => {
  let service: StudentService;
  let httpMock: HttpTestingController;

  const student: Student = {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@x.com',
    dateOfBirth: '1815-12-10',
    phoneNumber: '0102030405',
  };

  /** Construit une réponse serveur cohérente pour un id donné. */
  const asResponse = (id: number): StudentResponse => ({
    id,
    ...student,
    createdAt: '2026-01-01T00:00:00',
    updatedAt: '2026-01-01T00:00:00',
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StudentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // aucune requête inattendue ou en attente
  });

  // TU-49 — getAll() émet la liste renvoyée par le back
  // Entrée : souscrire ; flush([{id:1,...}, {id:2,...}])
  // Sortie : requête GET /api/students ; émet un tableau de longueur 2 identique au corps flush
  it('getAll() émet la liste renvoyée par le back (TU-49)', () => {
    const body: StudentResponse[] = [asResponse(1), asResponse(2)];
    let received: StudentResponse[] | undefined;

    service.getAll().subscribe((students) => (received = students));

    const req = httpMock.expectOne('/api/students');
    expect(req.request.method).toBe('GET');
    req.flush(body);

    expect(received).toEqual(body);
    expect(received?.length).toBe(2);
  });

  // TU-50 — getById() émet l'étudiant demandé
  // Entrée : getById(42) ; flush({ id: 42, ... })
  // Sortie : requête GET /api/students/42 ; émet l'objet dont id === 42
  it("getById() émet l'étudiant demandé (TU-50)", () => {
    const body = asResponse(42);
    let received: StudentResponse | undefined;

    service.getById(42).subscribe((s) => (received = s));

    const req = httpMock.expectOne('/api/students/42');
    expect(req.request.method).toBe('GET');
    req.flush(body);

    expect(received?.id).toBe(42);
    expect(received).toEqual(body);
  });

  // TU-51 — create() cible le bon endpoint et émet la réponse
  // Entrée : create(<student>) ; flush({ id: 1, ... })
  // Sortie : requête POST /api/students ; émet l'objet dont id === 1
  it('create() poste vers /api/students et émet la réponse (TU-51)', () => {
    const body = asResponse(1);
    let received: StudentResponse | undefined;

    service.create(student).subscribe((s) => (received = s));

    const req = httpMock.expectOne('/api/students');
    expect(req.request.method).toBe('POST');
    req.flush(body);

    expect(received?.id).toBe(1);
  });

  // TU-52 — update() cible le bon id et émet la réponse
  // Entrée : update(42, <student>) ; flush({ id: 42, ... })
  // Sortie : requête PUT /api/students/42 ; émet l'objet dont id === 42
  it('update() cible /api/students/42 et émet la réponse (TU-52)', () => {
    const body = asResponse(42);
    let received: StudentResponse | undefined;

    service.update(42, student).subscribe((s) => (received = s));

    const req = httpMock.expectOne('/api/students/42');
    expect(req.request.method).toBe('PUT');
    req.flush(body);

    expect(received?.id).toBe(42);
  });

  // TU-53 — delete() cible le bon endpoint et se termine
  // Entrée : delete(42) ; flush(null)
  // Sortie : requête DELETE /api/students/42 ; l'Observable complète
  it('delete() cible /api/students/42 et complète (TU-53)', () => {
    let completed = false;

    service.delete(42).subscribe({ complete: () => (completed = true) });

    const req = httpMock.expectOne('/api/students/42');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(completed).toBe(true);
  });
});