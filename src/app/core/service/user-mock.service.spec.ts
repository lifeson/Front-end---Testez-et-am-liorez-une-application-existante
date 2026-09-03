import { Observable } from 'rxjs';
import { UserMockService } from './user-mock.service';
import { Login } from '../models/Login';
import { Register } from '../models/Register';

/**
 * Souscrit de façon synchrone (of(...)) et capture la première valeur émise,
 * le fait que next ait été appelé, et la complétion.
 */
function subscribeSync<T>(obs$: Observable<T>): {
  value: T | undefined;
  nextCalled: boolean;
  completed: boolean;
} {
  let value: T | undefined;
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

describe('UserMockService', () => {
  let service: UserMockService;

  beforeEach(() => {
    service = new UserMockService();
  });

  // TU-22 — login() renvoie un token factice
  // Entrée : service.login({ login: 'jdoe', password: 'secret' })
  // Sortie : émet { token: 'mock-jwt-token' }
  it('login() émet un token factice (TU-22)', () => {
    const credentials: Login = { login: 'jdoe', password: 'secret' };

    const { value, nextCalled } = subscribeSync(service.login(credentials));

    expect(nextCalled).toBe(true);
    expect(value).toEqual({ token: 'mock-jwt-token' });
  });

  // TU-89 — register() complète sans émettre
  // Entrée : service.register({ firstName: 'Ada', lastName: 'L', login: 'ada', password: 'pwd' })
  // Sortie : l'Observable complète ; next n'est jamais appelé
  it('register() complète sans émettre (TU-89)', () => {
    const user: Register = {
      firstName: 'Ada',
      lastName: 'L',
      login: 'ada',
      password: 'pwd',
    };

    const { nextCalled, completed } = subscribeSync(service.register(user));

    expect(nextCalled).toBe(false);
    expect(completed).toBe(true);
  });
});