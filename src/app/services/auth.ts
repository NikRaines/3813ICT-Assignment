import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';


@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiUrl = 'http://localhost:3000';
  currentUser: User|null = null;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/api/users/login`, { username, password });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/api/users/logout`, {});
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('currentUser');
  }

  saveProfile(user: User) {
    this.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  getCurrentUser(): User | null {
    let storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  }

  loadProfile(): User|null {
    const data = localStorage.getItem('currentUser');
    if (data) {
      this.currentUser = JSON.parse(data);
      return this.currentUser;
    }
    return null;
  }
}
