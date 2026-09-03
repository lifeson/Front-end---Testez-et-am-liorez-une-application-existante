import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterComponent } from './register.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { UserService } from '../../core/service/user.service';
import { UserMockService } from '../../core/service/user-mock.service';

describe('RegisterComponent - intégration (rendu du template)', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: UserService, useValue: new UserMockService() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges(); // rend le template (ngOnInit + binding du formGroup)
  });

  // TI-08 — Le formulaire d'inscription est rendu
  // Entrée : detectChanges
  // Sortie : le DOM contient les input firstName, lastName, login, password
  //          et un button dont le texte contient "Register"
  it('affiche les 4 champs et le bouton Register (TI-08)', () => {
    const firstName = element.querySelector('input[formControlName="firstName"]');
    const lastName = element.querySelector('input[formControlName="lastName"]');
    const login = element.querySelector('input[formControlName="login"]');
    const password = element.querySelector('input[formControlName="password"]');
    const submitButton = Array.from(element.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Register'),
    );

    expect(firstName).not.toBeNull();
    expect(lastName).not.toBeNull();
    expect(login).not.toBeNull();
    expect(password).not.toBeNull();
    expect(submitButton).toBeTruthy();
  });
});