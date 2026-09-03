import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { RegisterComponent } from './register.component';
import { provideHttpClient } from '@angular/common/http';
import { UserService } from '../../core/service/user.service';
import { UserMockService } from '../../core/service/user-mock.service';
import { provideRouter, Router } from '@angular/router';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let userService: UserService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        // Correction : on fournit une INSTANCE du mock, pas la classe.
        { provide: UserService, useValue: new UserMockService() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService);
    router = TestBed.inject(Router);
    fixture.detectChanges(); // déclenche ngOnInit -> construction du formulaire
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ── TU-30 → TU-35 : initialisation & état ────────────────────────────────

  // TU-30 — Le composant s'instancie
  it("s'instancie (TU-30)", () => {
    expect(component).toBeTruthy();
  });

  // TU-31 — ngOnInit construit le formulaire avec les 4 contrôles
  it('construit le formulaire avec les 4 contrôles (TU-31)', () => {
    expect(component.registerForm.contains('firstName')).toBe(true);
    expect(component.registerForm.contains('lastName')).toBe(true);
    expect(component.registerForm.contains('login')).toBe(true);
    expect(component.registerForm.contains('password')).toBe(true);
  });

  // TU-32 — Les champs sont initialement vides
  it('initialise les 4 champs à une chaîne vide (TU-32)', () => {
    expect(component.registerForm.get('firstName')?.value).toBe('');
    expect(component.registerForm.get('lastName')?.value).toBe('');
    expect(component.registerForm.get('login')?.value).toBe('');
    expect(component.registerForm.get('password')?.value).toBe('');
  });

  // TU-33 — Drapeau initial
  it('a submitted à false initialement (TU-33)', () => {
    expect(component.submitted).toBe(false);
  });

  // TU-34 — Le formulaire est valide quand les 4 champs sont remplis
  it('est valide quand les 4 champs sont remplis (TU-34)', () => {
    component.registerForm.setValue({
      firstName: 'Ada',
      lastName: 'Lovelace',
      login: 'ada',
      password: 'pwd',
    });

    expect(component.registerForm.valid).toBe(true);
  });

  // TU-35 — onReset() remet le drapeau à zéro
  it('remet submitted à false via onReset() (TU-35)', () => {
    component.submitted = true;

    component.onReset();

    expect(component.submitted).toBe(false);
  });

  // ── TU-71 → TU-72 : onSubmit() ─────────────────────────────────────────
  describe('onSubmit()', () => {
    // TU-71 — Formulaire invalide → sortie anticipée
    // Entrée : registerForm vide ; onSubmit()
    // Sortie : submitted === true ; registerForm invalide ; register() non appelé
    it('ne soumet pas quand le formulaire est invalide (TU-71)', () => {
      const registerSpy = jest.spyOn(userService, 'register');

      component.onSubmit();

      expect(component.submitted).toBe(true);
      expect(component.registerForm.invalid).toBe(true);
      expect(registerSpy).not.toHaveBeenCalled();
    });

    // TU-72 — Soumission nominale
    // Entrée : form rempli ; register() -> of({}) ; onSubmit()
    // Sortie : submitted === true ; navigation déclenchée vers '/login'
    it("redirige vers /login après une inscription réussie (TU-72)", () => {
      jest.spyOn(userService, 'register').mockReturnValue(of({}));
      jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
      component.registerForm.setValue({
        firstName: 'Ada',
        lastName: 'Lovelace',
        login: 'ada',
        password: 'pwd',
      });

      component.onSubmit();

      expect(component.submitted).toBe(true);
      expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
    });
  });
});