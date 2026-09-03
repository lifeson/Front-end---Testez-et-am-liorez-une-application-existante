import { Observable } from 'rxjs';
import { UserMockService } from './user-mock.service';
import { Login } from '../models/Login';

/** Souscrit de façon synchrone (of(...)) et capture la première valeur émise. */
function subscribeSync<T>(obs$: Observable<T>): { value: T; nextCalled: boolean } {
  let value!: T;
  let nextCalled = false;
  obs$.subscribe((v) => {
    value = v;
    nextCalled = true;
  });
  return { value, nextCalled };
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
});