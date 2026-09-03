import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { UserService } from '../../core/service/user.service';
import { UserMockService } from '../../core/service/user-mock.service';

describe('LoginComponent - intégration (rendu du template)', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: UserService, useValue: new UserMockService() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges(); // rend le template (ngOnInit + binding du formGroup)
  });

  // TI-07 — Le formulaire de connexion est rendu
  // Entrée : detectChanges
  // Sortie : le DOM contient input[formControlName="login"], input[formControlName="password"]
  //          et un button dont le texte contient "Login"
  it('affiche les champs login / password et le bouton Login (TI-07)', () => {
    const loginInput = element.querySelector('input[formControlName="login"]');
    const passwordInput = element.querySelector('input[formControlName="password"]');
    const submitButton = Array.from(element.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Login'),
    );

    expect(loginInput).not.toBeNull();
    expect(passwordInput).not.toBeNull();
    expect(submitButton).toBeTruthy();
  });
});