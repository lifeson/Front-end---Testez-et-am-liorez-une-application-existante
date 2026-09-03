import { Observable } from 'rxjs';
import { StudentMockService } from './student-mock.service';
import { Student } from '../models/Student';

/**
 * Souscrit de façon synchrone (les mocks renvoient des of(...)) et capture
 * la première valeur émise, le fait que next ait été appelé, et la complétion.
 * subscribeSync plutôt que firstValueFrom + await : inutile de rendre les tests 
 * async puisque of(...) émet immédiatement. Ça garde les tests synchrones et lisibles.
 * Pas de TestBed, pas de providers : c'est le test le plus bas de la pyramide, 
 * sans configuration Angular.
 */
function subscribeSync<T>(obs$: Observable<T>): {
  value: T;
  nextCalled: boolean;
  completed: boolean;
} {
  let value!: T;
  let nextCalled = false;
  let completed = false;
  obs$.subscribe({
    next: (v) => {
      value = v;
      nextCalled = true;
    },
    complete: () => {
      completed = true;
    },
  });
  return { value, nextCalled, completed };
}

describe('StudentMockService', () => {
  let service: StudentMockService;

  beforeEach(() => {
    service = new StudentMockService();
  });

  // TU-17 — getAll() renvoie une liste vide
  // Entrée : service.getAll() souscrit
  // Sortie : l'Observable émet []
  it('getAll() émet une liste vide (TU-17)', () => {
    const { value } = subscribeSync(service.getAll());

    expect(value).toEqual([]);
  });

  // TU-18 — getById() renvoie un étudiant factice portant l'id demandé
  // Entrée : service.getById(7)
  // Sortie : émet l'étudiant factice avec id = 7
  it('getById() émet un étudiant factice portant l\'id demandé (TU-18)', () => {
    const { value } = subscribeSync(service.getById(7));

    expect(value).toEqual({
      id: 7,
      firstName: 'Mock',
      lastName: 'Student',
      email: 'mock.student@mail.com',
      dateOfBirth: '2000-01-01',
      phoneNumber: '0600000000',
      createdAt: '2026-01-01T00:00:00',
      updatedAt: '2026-01-01T00:00:00',
    });
  });

  // TU-19 — create() renvoie l'étudiant avec id = 1
  // Entrée : service.create(<student>)
  // Sortie : émet { id: 1, ...student }
  it('create() émet l\'étudiant créé avec id = 1 (TU-19)', () => {
    const student: Student = {
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@x.com',
      dateOfBirth: '1815-12-10',
      phoneNumber: '0102030405',
    };

    const { value } = subscribeSync(service.create(student));

    expect(value).toEqual({
      id: 1,
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@x.com',
      dateOfBirth: '1815-12-10',
      phoneNumber: '0102030405',
    });
  });

  // TU-20 — update() renvoie l'étudiant avec l'id fourni
  // Entrée : service.update(3, <student>)
  // Sortie : émet un objet dont id === 3 et les champs valent ceux passés
  it('update() émet l\'étudiant modifié avec l\'id fourni (TU-20)', () => {
    const student: Student = {
      firstName: 'Ada',
      lastName: 'L',
      email: 'ada@x.com',
      dateOfBirth: '',
      phoneNumber: '',
    };

    const { value } = subscribeSync(service.update(3, student));

    expect(value).toEqual({
      id: 3,
      firstName: 'Ada',
      lastName: 'L',
      email: 'ada@x.com',
      dateOfBirth: '',
      phoneNumber: '',
    });
  });

  // TU-21 — delete() se termine sans valeur
  // Entrée : service.delete(1) souscrit
  // Sortie : émet undefined puis complète
  it('delete() émet undefined puis complète (TU-21)', () => {
    const { value, nextCalled, completed } = subscribeSync(service.delete(1));

    expect(nextCalled).toBe(true);
    expect(value).toBeUndefined();
    expect(completed).toBe(true);
  });
});