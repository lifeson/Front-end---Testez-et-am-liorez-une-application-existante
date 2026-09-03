import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  provideRouter,
} from '@angular/router';

import { authGuard } from './auth.guard';

describe('authGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])], // fournit Router pour le inject(Router) du guard
    });
  });

  afterEach(() => {
    localStorage.removeItem('token'); // évite toute fuite de token entre tests
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
});