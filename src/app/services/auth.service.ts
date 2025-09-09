import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ✅ Move interfaces outside or into a separate `auth.model.ts`
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  fullName: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth'; // ✅ adjust for backend

  constructor(private http: HttpClient) {}

  login(data: LoginRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data);
  }

  signup(data: SignupRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/signup`, data);
  }

  logout(): void {
    localStorage.removeItem('authToken');
  }
}

//
// C:\Python312\Scripts\

// C:\Python312\
