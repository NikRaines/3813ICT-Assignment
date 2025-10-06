import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';


@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiUrl = 'http://localhost:3000';
  constructor(private http: HttpClient) {}

  currentUser: User|null = null;
  currentUser$ = new BehaviorSubject<User|null>(null);

  //Login
  login(username: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/api/users/login`, { username, password });
  }

  //Logout
  logout(): Observable<void> {
    localStorage.removeItem('currentUser');
    this.currentUser = null;
    this.currentUser$.next(null);
    return this.http.post<void>(`${this.apiUrl}/api/users/logout`, {});
  }

  //Check if user is logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('currentUser');
  }

  //Save user to local storage
  saveProfile(user: User) {
    this.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUser$.next(user);
  }

  //Get current user from local storage
  getCurrentUser(): User | null {
    let storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  }
}