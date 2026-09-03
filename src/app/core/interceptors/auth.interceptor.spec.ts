import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(), // doit venir APRÈS provideHttpClient
      ],
    });
    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    localStorage.removeItem('token'); // évite toute fuite de token entre tests
    httpMock.verify();
  });

  // TU-64 — Ajoute l'en-tête Authorization quand un token est présent
  // Entrée : localStorage.setItem('token', 'jwt-abc') ; httpClient.get('/api/x')
  // Sortie : la requête interceptée porte Authorization: 'Bearer jwt-abc'
  it("ajoute l'en-tête Authorization quand un token est présent (TU-64)", () => {
    localStorage.setItem('token', 'jwt-abc');

    httpClient.get('/api/x').subscribe();

    const req = httpMock.expectOne('/api/x');
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-abc');
    req.flush({});
  });

  // TU-65 — Ne modifie pas la requête en l'absence de token
  // Entrée : localStorage.removeItem('token') ; httpClient.get('/api/x')
  // Sortie : la requête interceptée n'a pas d'en-tête Authorization
  it("ne modifie pas la requête en l'absence de token (TU-65)", () => {
    localStorage.removeItem('token');

    httpClient.get('/api/x').subscribe();

    const req = httpMock.expectOne('/api/x');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
});