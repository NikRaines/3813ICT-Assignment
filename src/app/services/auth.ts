import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';


@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiUrl = 'http://localhost:3000';
  currentUser: User|null = null;
  currentUser$ = new BehaviorSubject<User|null>(null);

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/api/users/login`, { username, password });
  }

  logout(): Observable<void> {
    localStorage.removeItem('currentUser');
    this.currentUser = null;
    this.currentUser$.next(null);
    return this.http.post<void>(`${this.apiUrl}/api/users/logout`, {});
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('currentUser');
  }

  saveProfile(user: User) {
    this.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUser$.next(user);
  }

  getCurrentUser(): User | null {
    let storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  }

  /*
  loadProfile(): User|null {
    const data = localStorage.getItem('currentUser');
    if (data) {
      this.currentUser = JSON.parse(data);
      return this.currentUser;
    }
    return null;
  }
    */
}
