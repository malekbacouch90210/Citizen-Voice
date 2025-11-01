import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginResponse } from '../models/auth.model'; // Import the interface

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/authentification/users';
  private authData: LoginResponse | null = null;

  constructor(private http: HttpClient) {
    const storedData = localStorage.getItem('authData');
    if (storedData) {
      this.authData = JSON.parse(storedData) as LoginResponse;
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login/`, { email, password }).pipe(
      tap((response: LoginResponse) => {
        this.authData = response;
        localStorage.setItem('authData', JSON.stringify(response));
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        console.log('Stored authData:', this.authData);
      })
    );
  }

  getAuthData(): LoginResponse | null {
    if (!this.authData) {
      const storedData = localStorage.getItem('authData');
      this.authData = storedData ? JSON.parse(storedData) as LoginResponse : null;
    }
    return this.authData;
  }

  isLoggedIn(): boolean {
    const authData = this.getAuthData();
    return !!authData && !!authData.access;
  }

  getAccessToken(): string | null {
    const authData = this.getAuthData();
    return authData ? authData.access : null;
  }

  logout(): void {
    this.authData = null;
    localStorage.removeItem('authData');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}