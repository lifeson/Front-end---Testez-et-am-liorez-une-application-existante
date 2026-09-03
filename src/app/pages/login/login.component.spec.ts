import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { UserService } from '../../core/service/user.service';
import { UserMockService } from '../../core/service/user-mock.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let userService: UserService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        // Correction : on fournit une INSTANCE du mock, pas la classe.
        { provide: UserService, useValue: new UserMockService() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService);
    router = TestBed.inject(Router);
    fixture.detectChanges(); // déclenche ngOnInit -> construction du formulaire
  });

  afterEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  // ── TU-23 → TU-29 : initialisation & état ────────────────────────────────

  // TU-23 — Le composant s'instancie
  it("s'instancie (TU-23)", () => {
    expect(component).toBeTruthy();
  });

  // TU-24 — ngOnInit construit le formulaire avec les 2 contrôles
  it('construit le formulaire avec les contrôles login et password (TU-24)', () => {
    expect(component.loginForm.contains('login')).toBe(true);
    expect(component.loginForm.contains('password')).toBe(true);
  });

  // TU-25 — Les champs sont initialement vides
  it('initialise les deux champs à une chaîne vide (TU-25)', () => {
    expect(component.loginForm.get('login')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  // TU-26 — Drapeaux d'état initiaux
  it("a des drapeaux d'état initiaux neutres (TU-26)", () => {
    expect(component.submitted).toBe(false);
    expect(component.loading).toBe(false);
    expect(component.errorMessage).toBeNull();
  });

  // TU-27 — Le getter form expose les contrôles du formulaire
  it('expose les contrôles du formulaire via le getter form (TU-27)', () => {
    expect(component.form).toBe(component.loginForm.controls);
  });

  // TU-28 — Le formulaire est valide avec des identifiants renseignés
  it('est valide quand login et password sont renseignés (TU-28)', () => {
    component.loginForm.setValue({ login: 'jdoe', password: 'secret' });
    expect(component.loginForm.valid).toBe(true);
  });

  // TU-29 — onReset() remet les drapeaux à zéro
  it('remet submitted et errorMessage à zéro via onReset() (TU-29)', () => {
    component.submitted = true;
    component.errorMessage = 'Login ou mot de passe incorrect.';

    component.onReset();

    expect(component.submitted).toBe(false);
    expect(component.errorMessage).toBeNull();
  });

  // ── TU-67 → TU-70 : onSubmit() ──────────────────────────────────────────
  describe('onSubmit()', () => {
    // TU-67 — Formulaire invalide → sortie anticipée
    // Entrée : loginForm vide ; onSubmit()
    // Sortie : submitted === true ; loginForm invalide ; loading === false ; login() non appelé
    it('ne soumet pas quand le formulaire est invalide (TU-67)', () => {
      const loginSpy = jest.spyOn(userService, 'login');

      component.onSubmit();

      expect(component.submitted).toBe(true);
      expect(component.loginForm.invalid).toBe(true);
      expect(component.loading).toBe(false);
      expect(loginSpy).not.toHaveBeenCalled();
    });

    // TU-68 — Soumission nominale
    // Entrée : form rempli ; login() -> of({ token: 'jwt-abc' }) ; onSubmit()
    // Sortie : loading === false ; errorMessage === null ; token stocké dans localStorage
    it('stocke le token et termine le chargement en cas de succès (TU-68)', () => {
      jest.spyOn(userService, 'login').mockReturnValue(of({ token: 'jwt-abc' }));
      jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
      component.loginForm.setValue({ login: 'jdoe', password: 'secret' });

      component.onSubmit();

      expect(component.loading).toBe(false);
      expect(component.errorMessage).toBeNull();
      expect(localStorage.getItem('token')).toBe('jwt-abc');
      expect(router.navigateByUrl).toHaveBeenCalledWith('/students');
    });

    // TU-69 — Réponse en erreur avec message
    // Entrée : form rempli ; login() -> throwError({ error: { message: 'Identifiants invalides' } })
    // Sortie : errorMessage === 'Identifiants invalides' ; loading === false
    it("affiche le message d'erreur renvoyé par le back (TU-69)", () => {
      jest
        .spyOn(userService, 'login')
        .mockReturnValue(
          throwError(() => ({ error: { message: 'Identifiants invalides' } })),
        );
      component.loginForm.setValue({ login: 'jdoe', password: 'secret' });

      component.onSubmit();

      expect(component.errorMessage).toBe('Identifiants invalides');
      expect(component.loading).toBe(false);
    });

    // TU-70 — Réponse en erreur sans message (fallback)
    // Entrée : form rempli ; login() -> throwError({})
    // Sortie : errorMessage === 'Login ou mot de passe incorrect.' ; loading === false
    it('affiche un message par défaut quand le back ne fournit pas de message (TU-70)', () => {
      jest.spyOn(userService, 'login').mockReturnValue(throwError(() => ({})));
      component.loginForm.setValue({ login: 'jdoe', password: 'secret' });

      component.onSubmit();

      expect(component.errorMessage).toBe('Login ou mot de passe incorrect.');
      expect(component.loading).toBe(false);
    });
  });
});