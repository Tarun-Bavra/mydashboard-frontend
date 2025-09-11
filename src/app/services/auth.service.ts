import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface User {
  fullName: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth';

  // ✅ BehaviorSubject stores current user state
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // ✅ Restore from localStorage if available
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(data: LoginRequest): Observable<any> {
    return this.http.post<User>(`${this.baseUrl}/login`, data).pipe(
      tap((user) => {
        // ✅ Save user in BehaviorSubject + localStorage
        this.currentUserSubject.next(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('authToken', 'dummyToken'); // replace with real JWT
      })
    );
  }

  signup(data: SignupRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/signup`, data);
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  // ✅ Helper: read current user snapshot (sync)
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
