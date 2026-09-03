import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterComponent } from './register.component';
import { provideHttpClient } from '@angular/common/http';
import { UserService } from '../../core/service/user.service';
import { UserMockService } from '../../core/service/user-mock.service';
import { provideRouter } from '@angular/router';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

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
    fixture.detectChanges(); // déclenche ngOnInit -> construction du formulaire
  });

  // TU-30 — Le composant s'instancie
  // Entrée : createComponent + detectChanges
  // Sortie : instance truthy
  it("s'instancie (TU-30)", () => {
    expect(component).toBeTruthy();
  });

  // TU-31 — ngOnInit construit le formulaire avec les 4 contrôles
  // Entrée : après detectChanges
  // Sortie : registerForm contient firstName, lastName, login, password
  it('construit le formulaire avec les 4 contrôles (TU-31)', () => {
    expect(component.registerForm.contains('firstName')).toBe(true);
    expect(component.registerForm.contains('lastName')).toBe(true);
    expect(component.registerForm.contains('login')).toBe(true);
    expect(component.registerForm.contains('password')).toBe(true);
  });

  // TU-32 — Les champs sont initialement vides
  // Entrée : après detectChanges
  // Sortie : les 4 contrôles valent ''
  it('initialise les 4 champs à une chaîne vide (TU-32)', () => {
    expect(component.registerForm.get('firstName')?.value).toBe('');
    expect(component.registerForm.get('lastName')?.value).toBe('');
    expect(component.registerForm.get('login')?.value).toBe('');
    expect(component.registerForm.get('password')?.value).toBe('');
  });

  // TU-33 — Drapeau initial
  // Entrée : après detectChanges
  // Sortie : submitted === false
  it('a submitted à false initialement (TU-33)', () => {
    expect(component.submitted).toBe(false);
  });

  // TU-34 — Le formulaire est valide quand les 4 champs sont remplis
  // Entrée : registerForm.setValue({ firstName, lastName, login, password })
  // Sortie : registerForm.valid === true
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
  // Entrée : submitted = true, puis onReset()
  // Sortie : submitted === false
  it('remet submitted à false via onReset() (TU-35)', () => {
    component.submitted = true;

    component.onReset();

    expect(component.submitted).toBe(false);
  });
});