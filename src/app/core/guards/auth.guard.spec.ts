import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  provideRouter,
  Router,
} from '@angular/router';

import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])], // fournit Router pour le inject(Router) du guard
    });
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    localStorage.removeItem('token'); // évite toute fuite de token entre tests
    jest.restoreAllMocks();
  });

  /** Exécute le guard dans un contexte d'injection avec des snapshots vides. */
  const run = () =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

  // TU-66 — Autorise l'accès quand un token est présent
  // Entrée : localStorage.setItem('token', 'jwt-abc')
  // Sortie : authGuard(...) renvoie true
  it("autorise l'accès quand un token est présent (TU-66)", () => {
    localStorage.setItem('token', 'jwt-abc');

    expect(run()).toBe(true);
  });

  // TU-88 — Refuse l'accès et redirige quand aucun token
  // Entrée : localStorage sans 'token' ; spy sur router.navigateByUrl
  // Sortie : renvoie false ; router.navigateByUrl appelé avec '/login'
  it("refuse l'accès et redirige vers /login quand aucun token (TU-88)", () => {
    localStorage.removeItem('token');
    jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    const result = run();

    expect(result).toBe(false);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });
});