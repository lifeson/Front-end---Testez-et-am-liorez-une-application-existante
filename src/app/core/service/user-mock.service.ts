import { Register } from '../models/Register';
import { Login } from '../models/Login';
import { LoginResponse } from '../models/LoginResponse';
import { Observable, of } from 'rxjs';


export class UserMockService {

  register(user: Register): Observable<Object> {
    return of();
  }

  login(user: Login): Observable<LoginResponse> {
    return of({ token: 'mock-jwt-token' });
  }
}
