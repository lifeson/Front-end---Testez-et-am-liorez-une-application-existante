import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { UserService } from '../../core/service/user.service';
import { UserMockService } from '../../core/service/user-mock.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

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
    fixture.detectChanges(); // déclenche ngOnInit -> construction du formulaire
  });

  // TU-23 — Le composant s'instancie
  // Entrée : createComponent + detectChanges
  // Sortie : instance truthy
  it("s'instancie (TU-23)", () => {
    expect(component).toBeTruthy();
  });

  // TU-24 — ngOnInit construit le formulaire avec les 2 contrôles
  // Entrée : après detectChanges
  // Sortie : loginForm contient 'login' et 'password'
  it('construit le formulaire avec les contrôles login et password (TU-24)', () => {
    expect(component.loginForm.contains('login')).toBe(true);
    expect(component.loginForm.contains('password')).toBe(true);
  });

  // TU-25 — Les champs sont initialement vides
  // Entrée : après detectChanges
  // Sortie : login === '' et password === ''
  it('initialise les deux champs à une chaîne vide (TU-25)', () => {
    expect(component.loginForm.get('login')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  // TU-26 — Drapeaux d'état initiaux
  // Entrée : après detectChanges
  // Sortie : submitted === false, loading === false, errorMessage === null
  it('a des drapeaux d\'état initiaux neutres (TU-26)', () => {
    expect(component.submitted).toBe(false);
    expect(component.loading).toBe(false);
    expect(component.errorMessage).toBeNull();
  });

  // TU-27 — Le getter form expose les contrôles du formulaire
  // Entrée : lecture de component.form
  // Sortie : component.form === loginForm.controls
  it('expose les contrôles du formulaire via le getter form (TU-27)', () => {
    expect(component.form).toBe(component.loginForm.controls);
  });

  // TU-28 — Le formulaire est valide avec des identifiants renseignés
  // Entrée : loginForm.setValue({ login: 'jdoe', password: 'secret' })
  // Sortie : loginForm.valid === true
  it('est valide quand login et password sont renseignés (TU-28)', () => {
    component.loginForm.setValue({ login: 'jdoe', password: 'secret' });

    expect(component.loginForm.valid).toBe(true);
  });

  // TU-29 — onReset() remet les drapeaux à zéro
  // Entrée : submitted = true, errorMessage renseigné, puis onReset()
  // Sortie : submitted === false et errorMessage === null
  it('remet submitted et errorMessage à zéro via onReset() (TU-29)', () => {
    component.submitted = true;
    component.errorMessage = 'Login ou mot de passe incorrect.';

    component.onReset();

    expect(component.submitted).toBe(false);
    expect(component.errorMessage).toBeNull();
  });
});