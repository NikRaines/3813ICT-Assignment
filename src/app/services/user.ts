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

  // Fetch all users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/api/users`);
  }
  
  // User Registration
  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/users/register`, { username, email, password });
  }

  // Approve user registration
  approveUser(username: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/users/approve`, { username });
  }
  
  // Fetch notifications
  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/api/notifications`);
  }

  // Update user details
  updateUserRoles(username: string, role: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/users/updateRoles`, { username, role });
  }

  // User deletion
  deleteUser(username: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/api/users/${username}`);
  }

  // Update profile image
  updateProfileImg(username: string, profileImg: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/users/updateProfileImg`, { username, profileImg });
  }

  // Update user groups
  updateUserGroups(username: string, groups: number[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/users/updateGroups`, { username, groups });
  }

  // Update applied groups
  updateUserAppliedGroups(username: string, appliedGroups: number[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/users/updateAppliedGroups`, { username, appliedGroups });
  }

  // Ban user from group
  banUserFromGroup(username: string, groupId: number, description: string, reason: string, bannedBy: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/groups/${groupId}/ban`, { username, description, reason, bannedBy});
  }
}
