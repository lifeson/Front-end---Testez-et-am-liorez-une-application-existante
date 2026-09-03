import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { UserService } from './user.service';
import { Login } from '../models/Login';
import { Register } from '../models/Register';
import { LoginResponse } from '../models/LoginResponse';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // aucune requête inattendue ou en attente
  });

  // TU-54 — Le service s'instancie
  // Entrée : TestBed.inject(UserService)
  // Sortie : instance truthy
  it("s'instancie (TU-54)", () => {
    expect(service).toBeTruthy();
  });

  // TU-55 — login() émet le token renvoyé par le back
  // Entrée : login({ login: 'jdoe', password: 'secret' }) ; flush({ token: 'jwt-abc' })
  // Sortie : requête POST /api/login ; émet { token: 'jwt-abc' }
  it('login() émet le token renvoyé par le back (TU-55)', () => {
    const credentials: Login = { login: 'jdoe', password: 'secret' };
    let received: LoginResponse | undefined;

    service.login(credentials).subscribe((res) => (received = res));

    const req = httpMock.expectOne('/api/login');
    expect(req.request.method).toBe('POST');
    req.flush({ token: 'jwt-abc' });

    expect(received).toEqual({ token: 'jwt-abc' });
  });

  // TU-56 — register() cible le bon endpoint et se termine
  // Entrée : register({ firstName: 'Ada', lastName: 'L', login: 'ada', password: 'pwd' }) ; flush({})
  // Sortie : requête POST /api/register ; l'Observable complète
  it('register() poste vers /api/register et complète (TU-56)', () => {
    const user: Register = {
      firstName: 'Ada',
      lastName: 'L',
      login: 'ada',
      password: 'pwd',
    };
    let completed = false;

    service.register(user).subscribe({ complete: () => (completed = true) });

    const req = httpMock.expectOne('/api/register');
    expect(req.request.method).toBe('POST');
    req.flush({});

    expect(completed).toBe(true);
  });
});