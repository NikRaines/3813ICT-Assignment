import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  deleteUser(username: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/api/users/${username}`);
  }
  private apiUrl = 'http://localhost:3000';
  constructor(private http: HttpClient) {}

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/users/register`, { username, email, password });
  }
}
