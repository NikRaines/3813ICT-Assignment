import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Notification } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  private apiUrl = 'http://localhost:3000';
  constructor(private http: HttpClient) {}

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/api/notifications`);
  }

  updateUserRoles(username: string, role: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/users/updateRoles`, { username, role });
  }
  
  approveUser(username: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/users/approve`, { username });
  }

  deleteUser(username: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/api/users/${username}`);
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/users/register`, { username, email, password });
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/api/users`);
  }
}
